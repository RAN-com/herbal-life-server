# Admin dashboard

The `/admin` page is a single-page dashboard. Its section navigation is handled
in the page, so it does not create additional UI routes. Customer and
subscription records are read through `/api/admin/users`; the API requires a
valid Firebase ID token with the `admin: true` custom claim and uses the
Firebase Admin SDK on the server. Its UI uses shadcn/ui components configured
in `components.json`; add further shadcn components with
`npx shadcn@latest add <component>`.

Administrators can grant or update a customer's paid access, set its expiry and
the customer/staff/visitor/product quotas, or cancel an active subscription.
Manual paid access is stored with type `SUBSCRIPTION`. Cancellation immediately
sets `users/{uid}.subscription` to `null`; before/after details, the admin
identity, optional note, and operation time are recorded in that user's
`transactions` subcollection. These admin changes do not create a Razorpay
charge or refund.

## Configure admin access

1. Enable the Email/Password sign-in provider in Firebase Authentication and
   create the administrator account.
2. Configure private Firebase Admin credentials for the Next.js server and the
   claim-provisioning command. Locally, put one of the following in the
   repository-root `.env.local` file (which is ignored by Git):

   ```sh
   # Option A: path to the service-account JSON file
   GOOGLE_APPLICATION_CREDENTIALS=./nutrition-7b61a-73ffdd36770d.json

   # Option B: the full service-account JSON, on one line
   FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
   ```

   Option A points to the existing root-level key file. The service-account
   JSON is a private IAM key, not the public Firebase web config or a Firebase
   user's password. Never add the JSON contents to
   `NEXT_PUBLIC_*` variables or commit the key.

   In production, configure `FIREBASE_SERVICE_ACCOUNT_JSON` using your hosting
   provider's encrypted environment variables or secret manager. Alternatively,
   use the provider's workload identity/Application Default Credentials, or
   securely mount the key file and set `GOOGLE_APPLICATION_CREDENTIALS` to its
   path. Do not rely on a project-root key file being deployed with the app.
   Set `FIREBASE_PROJECT_ID` if the project differs from `nutrition-7b61a`.
   The identity needs permission to manage Firebase Authentication users; the
   deployed server identity also needs permission to read the Firestore
   `users` collection.
3. Using trusted credentials, grant the custom claim to the administrator:

   ```sh
   npm run admin:set -- admin@example.com
   ```

   The command reads `.env.local` and sets the `admin` claim on the existing
   Firebase Authentication user. Never expose service-account credentials in
   browser code or commit them to the repository. If using Google Cloud CLI
   credentials locally instead, run `gcloud auth application-default login`.
4. Sign in at `/admin` using that account. The page refreshes the ID token so
   newly assigned claims take effect immediately.

Only users with the server-verified custom claim can read customer data. The
dashboard currently shows customer and subscription information but does not
change subscription records.