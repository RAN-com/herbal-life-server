import nextEnv from "@next/env";
import { applicationDefault, cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

nextEnv.loadEnvConfig(process.cwd());

const email = process.argv[2];
if (!email) {
  console.error("Usage: npm run admin:set -- <admin-email>");
  process.exitCode = 1;
} else {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    let credential = applicationDefault();

    if (serviceAccountJson) {
      let serviceAccount;
      try {
        serviceAccount = JSON.parse(serviceAccountJson);
      } catch {
        throw new Error(
          "FIREBASE_SERVICE_ACCOUNT_JSON must contain valid JSON.",
        );
      }

      if (
        !serviceAccount ||
        typeof serviceAccount.project_id !== "string" ||
        typeof serviceAccount.client_email !== "string" ||
        typeof serviceAccount.private_key !== "string"
      ) {
        throw new Error(
          "FIREBASE_SERVICE_ACCOUNT_JSON is missing project_id, client_email, or private_key.",
        );
      }

      credential = cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
      });
    }

    initializeApp({
      credential,
      projectId: process.env.FIREBASE_PROJECT_ID ?? "nutrition-7b61a",
    });

    const auth = getAuth();
    const user = await auth.getUserByEmail(email);
    await auth.setCustomUserClaims(user.uid, {
      ...user.customClaims,
      admin: true,
    });
    console.log(`Granted admin access to ${email}.`);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "app/invalid-credential"
    ) {
      console.error(
        [
          "Firebase Admin could not find Google Application Default Credentials.",
          "For local development, run `gcloud auth application-default login`,",
          "or set GOOGLE_APPLICATION_CREDENTIALS to a service-account JSON file",
          "for the Firebase project. Keep that file outside the repository.",
          "The Google account or service account also needs permission to manage Firebase Authentication users.",
        ].join(" "),
      );
    } else if (error instanceof Error) {
      console.error(`Unable to grant admin access: ${error.message}`);
    } else {
      console.error("Unable to grant admin access due to an unknown error.");
    }
    process.exitCode = 1;
  }
}
