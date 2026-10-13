import {
  AdminRequestError,
  adminFirestore,
  requireAdmin,
} from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const resources = [
  "customers",
  "visitors",
  "staff",
  "products",
  "domains",
  "cards",
  "appointments",
  "notifications",
  "orders",
] as const;
type Resource = (typeof resources)[number];

function collectionName(resource: Resource): string {
  return resource === "staff" ? "staffs" : resource;
}

const editableFields: Record<Resource, readonly string[]> = {
  customers: ["name", "email", "phone", "address", "gender", "medical_issues"],
  visitors: ["name", "email", "phone", "address", "gender", "medical_issues"],
  staff: ["name", "email", "phone", "address", "gender", "about"],
  products: [
    "name",
    "price",
    "in_stock",
    "flavour",
    "is_available",
    "type",
    "thumbnail",
  ],
  domains: ["is_active", "subscription.valid_till"],
  cards: ["status"],
  appointments: [],
  notifications: [],
  orders: [],
};

function validId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 256 &&
    !value.includes("/")
  );
}

function resourceFrom(value: unknown): Resource | null {
  return typeof value === "string" && resources.includes(value as Resource)
    ? (value as Resource)
    : null;
}

function cleanValue(value: unknown): string | number | boolean | null {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) return value;
  throw new AdminRequestError(
    "Editable values must be strings, numbers, booleans, or null.",
    400,
  );
}

async function getOwnedRefs(uid: string, resource: Resource) {
  const userRef = adminFirestore.collection("users").doc(uid);
  if (
    ["customers", "visitors", "products", "orders"].includes(resource)
  ) {
    return (await userRef.collection(collectionName(resource)).get()).docs.map((doc) => ({
      id: doc.id,
      ref: doc.ref,
      data: doc.data(),
    }));
  }
  if (resource === "staff") {
    const staffDocs = (await userRef.collection("staffs").get()).docs;
    const result = staffDocs.map((doc) => ({
      id: doc.id,
      ref: doc.ref,
      data: doc.data(),
    }));
    for (let index = 0; index < result.length; index += 30) {
      const batch = result.slice(index, index + 30);
      const snapshot = await adminFirestore
        .collection("domains")
        .where("staff_id", "in", batch.map(({ id }) => id))
        .get();
      for (const domain of snapshot.docs) {
        const staff = result.find(({ id }) => id === domain.data().staff_id);
        if (!staff) continue;
        staff.data = {
          ...staff.data,
          domain_id: domain.id,
          domain_is_active: domain.data().is_active !== false,
          domain_name: domain.id,
        };
      }
    }
    return result;
  }
  if (resource === "notifications") {
    const doc = await adminFirestore.collection("notifications").doc(uid).get();
    return doc.exists
      ? [{ id: doc.id, ref: doc.ref, data: doc.data() ?? {} }]
      : [];
  }

  const staffSnapshot = await userRef.collection("staffs").get();
  const staffIds = staffSnapshot.docs.map((doc) => doc.id);
  if (resource === "domains") {
    const result = [];
    for (let index = 0; index < staffIds.length; index += 30) {
      const ids = staffIds.slice(index, index + 30);
      if (!ids.length) continue;
      const snapshot = await adminFirestore
        .collection("domains")
        .where("staff_id", "in", ids)
        .get();
      result.push(
        ...snapshot.docs.map((doc) => ({
          id: doc.id,
          ref: doc.ref,
          data: doc.data(),
        })),
      );
    }
    return result;
  }
  if (resource === "cards") {
    const result = [];
    for (const staffId of staffIds) {
      const doc = await adminFirestore.collection("cards").doc(staffId).get();
      if (doc.exists)
        result.push({ id: doc.id, ref: doc.ref, data: doc.data() ?? {} });
    }
    return result;
  }
  if (resource === "appointments") {
    const result = [];
    for (const staffId of staffIds) {
      const doc = await adminFirestore
        .collection("appointments")
        .doc(staffId)
        .get();
      if (doc.exists)
        result.push({ id: doc.id, ref: doc.ref, data: doc.data() ?? {} });
    }
    return result;
  }
  return [];
}

async function getDomainRef(staffId: string) {
  const snapshot = await adminFirestore
    .collection("domains")
    .where("staff_id", "==", staffId)
    .limit(1)
    .get();
  return snapshot.docs[0]?.ref;
}

function displayData(resource: Resource, data: Record<string, unknown>) {
  if (resource === "visitors" || resource === "staff") {
    const nested = data.data;
    return nested && typeof nested === "object"
      ? { ...data, ...(nested as Record<string, unknown>) }
      : data;
  }
  return data;
}

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const params = new URL(request.url).searchParams;
    const uid = params.get("uid");
    const resource = resourceFrom(params.get("resource"));
    if (!validId(uid) || !resource) {
      return NextResponse.json(
        { error: "A valid user and resource are required." },
        { status: 400 },
      );
    }
    const rows = await getOwnedRefs(uid, resource);
    return NextResponse.json({
      resource,
      rows: rows.map(({ id, data }) => ({
        id,
        data: displayData(resource, data as Record<string, unknown>),
      })),
    });
  } catch (error) {
    if (error instanceof AdminRequestError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("Failed to load admin resource data.", error);
    return NextResponse.json(
      { error: "Unable to load resource data." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const actor = await requireAdmin(request);
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "A JSON request body is required." },
        { status: 400 },
      );
    }

    const { uid, resource, id, action, fields, valid_till, reason } =
      body as Record<string, unknown>;
    const typedResource = resourceFrom(resource);
    if (!validId(uid) || !typedResource || !validId(id)) {
      return NextResponse.json(
        { error: "A valid user, resource, and record ID are required." },
        { status: 400 },
      );
    }
    if (
      action !== "update" &&
      action !== "archive" &&
      action !== "restore" &&
      action !== "grant_access" &&
      action !== "set_domain_status"
    ) {
      return NextResponse.json(
        {
          error:
            "Action must be update, archive, restore, grant_access, or set_domain_status.",
        },
        { status: 400 },
      );
    }

    const owned = await getOwnedRefs(uid, typedResource);
    const target = owned.find((row) => row.id === id);
    if (!target)
      throw new AdminRequestError(
        "The record was not found for this center user.",
        404,
      );
    const userRef = adminFirestore.collection("users").doc(uid);
    const auditRef = userRef.collection("transactions").doc();
    const update: Record<
      string,
      string | number | boolean | null | FieldValue
    > = {};

    if (action === "set_domain_status") {
      const domainRef =
        typedResource === "staff" ? await getDomainRef(id) : undefined;
      if (!domainRef) {
        return NextResponse.json(
          { error: "Only staff with an assigned domain can be activated or deactivated." },
          { status: 400 },
        );
      }
      if (typeof body.active !== "boolean") {
        return NextResponse.json(
          { error: "A boolean domain active status is required." },
          { status: 400 },
        );
      }
      const now = new Date().toISOString();
      await adminFirestore.runTransaction(async (tx) => {
        const snapshot = await tx.get(domainRef);
        if (!snapshot.exists)
          throw new AdminRequestError("The assigned domain no longer exists.", 404);
        tx.update(domainRef, { is_active: body.active });
        tx.create(auditRef, {
          transactionId: auditRef.id,
          type: body.active
            ? "ADMIN_DOMAIN_ACTIVATED"
            : "ADMIN_DOMAIN_DEACTIVATED",
          status: "completed",
          createdOn: now,
          createdBy: { uid: actor.uid, email: actor.email ?? null },
          resource: "domains",
          recordId: domainRef.id,
          staffId: id,
          isActive: body.active,
        });
      });
      return NextResponse.json({
        message: body.active
          ? "Staff domain activated successfully."
          : "Staff domain deactivated successfully.",
      });
    }

    if (action === "grant_access") {
      if (typedResource !== "domains") {
        return NextResponse.json(
          { error: "Card access can only be granted to domains." },
          { status: 400 },
        );
      }
      if (
        typeof valid_till !== "string" ||
        !Number.isFinite(Date.parse(valid_till)) ||
        Date.parse(valid_till) <= Date.now()
      ) {
        return NextResponse.json(
          { error: "Access expiry must be a valid future date and time." },
          { status: 400 },
        );
      }
      if (
        typeof reason !== "undefined" &&
        (typeof reason !== "string" || reason.length > 500)
      ) {
        return NextResponse.json(
          { error: "Reason must be 500 characters or fewer." },
          { status: 400 },
        );
      }

      const now = new Date().toISOString();
      const subscription = {
        subscribed_on: now,
        valid_till: new Date(valid_till).toISOString(),
      };
      await adminFirestore.runTransaction(async (tx) => {
        const snapshot = await tx.get(target.ref);
        if (!snapshot.exists)
          throw new AdminRequestError("The domain no longer exists.", 404);
        tx.update(target.ref, { subscription });
        tx.create(auditRef, {
          transactionId: auditRef.id,
          type: "ADMIN_DOMAIN_ACCESS_GRANTED",
          status: "completed",
          createdOn: now,
          createdBy: { uid: actor.uid, email: actor.email ?? null },
          resource: typedResource,
          recordId: id,
          reason: typeof reason === "string" ? reason.trim() || null : null,
          subscription,
        });
      });
      return NextResponse.json({
        message: "Card access granted successfully.",
        subscription,
      });
    }

    if (action === "update") {
      if (!fields || typeof fields !== "object") {
        return NextResponse.json(
          { error: "Editable fields are required." },
          { status: 400 },
        );
      }
      const allowed = new Set(editableFields[typedResource]);
      for (const [field, value] of Object.entries(
        fields as Record<string, unknown>,
      )) {
        if (!allowed.has(field)) {
          return NextResponse.json(
            { error: `Field ${field} cannot be edited for ${typedResource}.` },
            { status: 400 },
          );
        }
        const clean = cleanValue(value);
        if (typedResource === "visitors" || typedResource === "staff") {
          update[`data.${field}`] = clean;
        } else {
          update[field] = clean;
        }
      }
      if (!Object.keys(update).length) {
        return NextResponse.json(
          { error: "At least one editable field is required." },
          { status: 400 },
        );
      }
    } else if (
      typedResource === "notifications" ||
      typedResource === "appointments" ||
      typedResource === "orders"
    ) {
      return NextResponse.json(
        { error: `${typedResource} records are read-only.` },
        { status: 409 },
      );
    } else {
      const prefix =
        typedResource === "visitors" || typedResource === "staff"
          ? "data."
          : "";
      update[`${prefix}archived`] = action === "archive";
      update[`${prefix}archivedOn`] =
        action === "archive" ? new Date().toISOString() : FieldValue.delete();
      update[`${prefix}archivedBy`] =
        action === "archive" ? actor.uid : FieldValue.delete();
    }

    await adminFirestore.runTransaction(async (tx) => {
      const snapshot = await tx.get(target.ref);
      if (!snapshot.exists)
        throw new AdminRequestError("The record no longer exists.", 404);
      tx.update(target.ref, update);
      tx.create(auditRef, {
        transactionId: auditRef.id,
        type: `ADMIN_${action.toUpperCase()}_${typedResource.toUpperCase()}`,
        status: "completed",
        createdOn: new Date().toISOString(),
        createdBy: { uid: actor.uid, email: actor.email ?? null },
        resource: typedResource,
        recordId: id,
        fields: action === "update" ? Object.keys(update) : null,
      });
    });
    const actionLabel =
      action === "archive"
        ? "archived"
        : action === "restore"
          ? "restored"
          : "updated";
    return NextResponse.json({
      message: `${typedResource} ${actionLabel} successfully.`,
    });
  } catch (error) {
    if (error instanceof AdminRequestError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("Failed to update admin resource.", error);
    return NextResponse.json(
      { error: "Unable to update the resource." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireAdmin(request);
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "A JSON request body is required." },
        { status: 400 },
      );
    }
    const { uid, resource, fields } = body as Record<string, unknown>;
    const typedResource = resourceFrom(resource);
    if (
      !validId(uid) ||
      !typedResource ||
      !["customers", "visitors", "staff", "products"].includes(typedResource)
    ) {
      return NextResponse.json(
        {
          error:
            "Only customers, visitors, staff, and products can be created.",
        },
        { status: 400 },
      );
    }
    if (!fields || typeof fields !== "object") {
      return NextResponse.json(
        { error: "Entry fields are required." },
        { status: 400 },
      );
    }
    const allowed = new Set(editableFields[typedResource]);
    const cleanFields: Record<string, string | number | boolean | null> = {};
    for (const [field, value] of Object.entries(
      fields as Record<string, unknown>,
    )) {
      if (!allowed.has(field))
        return NextResponse.json(
          { error: `Field ${field} cannot be set for ${typedResource}.` },
          { status: 400 },
        );
      cleanFields[field] = cleanValue(value);
    }
    if (typeof cleanFields.name !== "string" || !cleanFields.name.trim()) {
      return NextResponse.json(
        { error: "A name is required." },
        { status: 400 },
      );
    }
    if (
      typedResource !== "products" &&
      (typeof cleanFields.phone !== "string" || !cleanFields.phone.trim())
    ) {
      return NextResponse.json(
        { error: "A phone number is required." },
        { status: 400 },
      );
    }
    if (
      typedResource === "products" &&
      (typeof cleanFields.price !== "number" ||
        cleanFields.price < 0 ||
        typeof cleanFields.in_stock !== "number" ||
        cleanFields.in_stock < 0)
    ) {
      return NextResponse.json(
        { error: "Product price and stock must be non-negative numbers." },
        { status: 400 },
      );
    }
    const userRef = adminFirestore.collection("users").doc(uid);
    const entryId = randomUUID();
    const entryRef = userRef
      .collection(collectionName(typedResource))
      .doc(entryId);
    const auditRef = userRef.collection("transactions").doc();
    const now = new Date().toISOString();
    const record =
      typedResource === "customers"
        ? { ...cleanFields, cid: entryId, created_by: { uid }, created_at: now }
        : typedResource === "visitors"
          ? {
              data: {
                ...cleanFields,
                vid: entryId,
                created_by: uid,
                created_on: now,
              },
              records: [],
            }
          : typedResource === "staff"
            ? {
                data: {
                  ...cleanFields,
                  sid: entryId,
                  createdBy: uid,
                  uid,
                  createdOn: now,
                },
                total_appointments_recorded: 0,
                total_customers_assigned: 0,
                total_visitors_assigned: 0,
                attendance: [],
                records: [],
              }
            : {
                ...cleanFields,
                pid: entryId,
                added_by: uid,
                added_on: Date.now(),
                product_images: [],
              };
    await adminFirestore.runTransaction(async (tx) => {
      const userSnapshot = await tx.get(userRef);
      if (!userSnapshot.exists)
        throw new AdminRequestError("Customer not found.", 404);
      tx.create(entryRef, record);
      tx.create(auditRef, {
        transactionId: auditRef.id,
        type: `ADMIN_CREATE_${typedResource.toUpperCase()}`,
        status: "completed",
        createdOn: now,
        createdBy: { uid: actor.uid, email: actor.email ?? null },
        resource: typedResource,
        recordId: entryId,
      });
    });
    return NextResponse.json(
      { message: `${typedResource} created successfully.`, id: entryId },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AdminRequestError)
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    console.error("Failed to create admin resource.", error);
    return NextResponse.json(
      { error: "Unable to create the resource." },
      { status: 500 },
    );
  }
}
