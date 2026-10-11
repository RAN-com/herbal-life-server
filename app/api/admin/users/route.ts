import {
  AdminRequestError,
  adminFirestore,
  requireAdmin,
} from "@/firebase/admin";
import { FieldPath, Query } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const PAGE_SIZE = 25;
const QUOTA_FIELDS = [
  "total_customers",
  "total_staffs",
  "total_visitors",
  "total_products",
] as const;

type SubscriptionQuotas = Record<(typeof QUOTA_FIELDS)[number], number>;

function readString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getValidTillTimestamp(value: unknown): number | null {
  if (typeof value === "string") {
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) ? timestamp : null;
  }

  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    const timestamp = value.toDate().getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }

  return null;
}

function readQuotas(value: Record<string, unknown>): SubscriptionQuotas {
  return {
    total_customers: readNumber(value.total_customers) ?? 0,
    total_staffs: readNumber(value.total_staffs) ?? 0,
    total_visitors: readNumber(value.total_visitors) ?? 0,
    total_products: readNumber(value.total_products) ?? 0,
  };
}

export async function GET(request: Request) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    if (cursor && (cursor.length > 256 || cursor.includes("/"))) {
      return NextResponse.json({ error: "Invalid page cursor." }, { status: 400 });
    }

    let usersQuery: Query = adminFirestore
      .collection("users")
      .orderBy(FieldPath.documentId());
    if (cursor) {
      usersQuery = usersQuery.startAfter(cursor);
    }

    const [usersSnapshot, totalCount, paidCount, trialCount] =
      await Promise.all([
        usersQuery.limit(PAGE_SIZE).get(),
        adminFirestore.collection("users").count().get(),
        adminFirestore
          .collection("users")
          .where("subscription.type", "in", ["SUBSCRIPTION", "PAID"])
          .count()
          .get(),
        adminFirestore
          .collection("users")
          .where("subscription.type", "==", "FREE_TRAIL")
          .count()
          .get(),
      ]);

    const users = usersSnapshot.docs.map((userDocument) => {
      const data = userDocument.data();
      const subscriptionData =
        typeof data.subscription === "object" && data.subscription !== null
          ? (data.subscription as Record<string, unknown>)
          : null;

      return {
        uid: userDocument.id,
        name: readString(data.name),
        email: readString(data.email),
        city: readString(data.city),
        locality: readString(data.locality),
        createdOn: readString(data.createdOn),
        subscription: subscriptionData
          ? {
              type: readString(subscriptionData.type),
              subscribedOn: readString(subscriptionData.subscribedOn),
              valid_till: readString(subscriptionData.valid_till),
              ...readQuotas(subscriptionData),
            }
          : null,
      };
    });

    return NextResponse.json({
      users,
      nextCursor:
        usersSnapshot.docs.length === PAGE_SIZE
          ? usersSnapshot.docs.at(-1)?.id ?? null
          : null,
      metrics: {
        totalUsers: totalCount.data().count,
        paidSubscriptions: paidCount.data().count,
        freeTrials: trialCount.data().count,
      },
    });
  } catch (error) {
    if (error instanceof AdminRequestError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("Failed to load admin customer data.", error);
    return NextResponse.json(
      { error: "Unable to load customer data. Please try again." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const actor = await requireAdmin(request);
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Request body must be valid JSON." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "A request body is required." },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;
    const uid = data.uid;
    const action = data.action;
    const reason = data.reason;

    if (
      typeof uid !== "string" ||
      uid.length === 0 ||
      uid.length > 256 ||
      uid.includes("/")
    ) {
      return NextResponse.json({ error: "Invalid customer ID." }, { status: 400 });
    }

    if (
      typeof reason !== "undefined" &&
      (typeof reason !== "string" || reason.length > 500)
    ) {
      return NextResponse.json(
        { error: "Reason must be 500 characters or fewer." },
        { status: 400 }
      );
    }

    const trimmedReason =
      typeof reason === "string" ? reason.trim() : "";
    const userRef = adminFirestore.collection("users").doc(uid);
    const transactionRef = userRef.collection("transactions").doc();

    if (action === "grant") {
      const validTill = data.valid_till;
      const validTillTimestamp =
        typeof validTill === "string" ? Date.parse(validTill) : Number.NaN;
      const quotas: SubscriptionQuotas = {
        total_customers: 0,
        total_staffs: 0,
        total_visitors: 0,
        total_products: 0,
      };

      for (const field of QUOTA_FIELDS) {
        const value = data[field];
        if (
          typeof value !== "number" ||
          !Number.isSafeInteger(value) ||
          value < 0
        ) {
          return NextResponse.json(
            { error: `Enter a non-negative whole number for ${field}.` },
            { status: 400 }
          );
        }
        quotas[field] = value;
      }

      if (
        !Number.isFinite(validTillTimestamp) ||
        validTillTimestamp <= Date.now()
      ) {
        return NextResponse.json(
          { error: "Subscription expiry must be a valid future date and time." },
          { status: 400 }
        );
      }

      const subscription = await adminFirestore.runTransaction(async (tx) => {
        const userSnapshot = await tx.get(userRef);
        if (!userSnapshot.exists) {
          throw new AdminRequestError("Customer not found.", 404);
        }

        const previous = userSnapshot.get("subscription");
        const previousSubscription =
          previous && typeof previous === "object"
            ? (previous as Record<string, unknown>)
            : null;
        const createdOn = new Date().toISOString();
        const previousPaidSubscriptionIsActive =
          (previousSubscription?.type === "SUBSCRIPTION" ||
            previousSubscription?.type === "PAID") &&
          (getValidTillTimestamp(previousSubscription.valid_till) ?? 0) >
            Date.now();
        const nextSubscription = {
          type: "SUBSCRIPTION",
          subscribedOn: previousPaidSubscriptionIsActive
            ? readString(previousSubscription.subscribedOn) ?? createdOn
            : createdOn,
          valid_till: new Date(validTillTimestamp).toISOString(),
          ...quotas,
        };

        tx.update(userRef, { subscription: nextSubscription });
        tx.create(transactionRef, {
          transactionId: transactionRef.id,
          type: previousPaidSubscriptionIsActive
            ? "ADMIN_SUBSCRIPTION_UPDATED"
            : "ADMIN_SUBSCRIPTION_GRANTED",
          status: "completed",
          createdOn,
          createdBy: { uid: actor.uid, email: actor.email ?? null },
          reason: trimmedReason || null,
          previousSubscription: previousSubscription ?? null,
          subscription: nextSubscription,
        });

        return nextSubscription;
      });

      return NextResponse.json({
        message: "Subscription updated successfully.",
        subscription,
      });
    }

    if (action === "cancel") {
      const result = await adminFirestore.runTransaction(async (tx) => {
        const userSnapshot = await tx.get(userRef);
        if (!userSnapshot.exists) {
          throw new AdminRequestError("Customer not found.", 404);
        }

        const previous = userSnapshot.get("subscription");
        const previousSubscription =
          previous && typeof previous === "object"
            ? (previous as Record<string, unknown>)
            : null;
        const expiry = getValidTillTimestamp(previousSubscription?.valid_till);
        if (!previousSubscription || !expiry || expiry <= Date.now()) {
          throw new AdminRequestError(
            "This customer does not have an active subscription to cancel.",
            409
          );
        }

        const createdOn = new Date().toISOString();
        tx.update(userRef, { subscription: null });
        tx.create(transactionRef, {
          transactionId: transactionRef.id,
          type: "ADMIN_SUBSCRIPTION_CANCELLED",
          status: "completed",
          createdOn,
          createdBy: { uid: actor.uid, email: actor.email ?? null },
          reason: trimmedReason || null,
          previousSubscription,
          subscription: null,
        });

        return { cancelledOn: createdOn };
      });

      return NextResponse.json({
        message: "Subscription cancelled and access removed.",
        ...result,
      });
    }

    return NextResponse.json(
      { error: "Action must be either grant or cancel." },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof AdminRequestError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("Failed to update admin subscription.", error);
    return NextResponse.json(
      { error: "Unable to update the subscription. Please try again." },
      { status: 500 }
    );
  }
}
