import "server-only";

import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { DecodedIdToken, getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getAdminCredential() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    return applicationDefault();
  }

  let serviceAccount: unknown;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON must contain valid JSON.");
  }

  if (
    typeof serviceAccount !== "object" ||
    serviceAccount === null ||
    !("project_id" in serviceAccount) ||
    typeof serviceAccount.project_id !== "string" ||
    !("client_email" in serviceAccount) ||
    typeof serviceAccount.client_email !== "string" ||
    !("private_key" in serviceAccount) ||
    typeof serviceAccount.private_key !== "string"
  ) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON is missing project_id, client_email, or private_key."
    );
  }

  return cert({
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key,
  });
}

const adminApp =
  getApps()[0] ??
  initializeApp({
    credential: getAdminCredential(),
    projectId: process.env.FIREBASE_PROJECT_ID ?? "nutrition-7b61a",
  });

export const adminAuth = getAuth(adminApp);
export const adminFirestore = getFirestore(adminApp);

export class AdminRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "AdminRequestError";
  }
}

export async function requireAdmin(
  request: Request
): Promise<DecodedIdToken> {
  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer (.+)$/i)?.[1];

  if (!token) {
    throw new AdminRequestError("Authentication required.", 401);
  }

  let decodedToken: DecodedIdToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(token, true);
  } catch {
    throw new AdminRequestError("Your session is invalid or expired.", 401);
  }

  if (decodedToken.admin !== true) {
    throw new AdminRequestError("Administrator access required.", 403);
  }

  return decodedToken;
}
