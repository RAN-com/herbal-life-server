"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Grid2X2,
  LogOut,
  Package,
  RefreshCw,
  Search,
  Shield,
  UserRound,
  UserRoundPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { auth } from "@/firebase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import ResourceManager from "@/component/admin/resource-manager";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AdminCustomer = {
  uid: string;
  name: string | null;
  email: string | null;
  city: string | null;
  locality: string | null;
  createdOn: string | null;
  is_active?: boolean;
  subscription: {
    type: string | null;
    subscribedOn: string | null;
    valid_till: string | null;
    total_customers: number;
    total_staffs: number;
    total_visitors: number;
    total_products: number;
  } | null;
};

type DashboardMetrics = {
  totalUsers: number;
  paidSubscriptions: number;
  freeTrials: number;
};

type CustomerPage = {
  users: AdminCustomer[];
  nextCursor: string | null;
  metrics: DashboardMetrics;
};

type AccessState = "checking" | "signedOut" | "ready" | "denied" | "error";
type Section =
  | "overview"
  | "customers"
  | "subscriptions"
  | "customers-data"
  | "visitors"
  | "staff"
  | "products"
  | "domains"
  | "cards"
  | "appointments"
  | "notifications"
  | "orders";

const PAGE_SIZE = 25;
const navigation = [
  { id: "overview", label: "Overview", icon: Grid2X2 },
  { id: "customers", label: "Customers", icon: Users },
  { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
  { id: "customers-data", label: "Customer records", icon: UserRound },
  { id: "visitors", label: "Visitors", icon: UserRoundPlus },
  { id: "staff", label: "Staff", icon: Users },
  { id: "products", label: "Products", icon: Package },
  { id: "domains", label: "Domains", icon: Shield },
  { id: "cards", label: "Cards", icon: CreditCard },
  { id: "appointments", label: "Appointments", icon: Activity },
  { id: "notifications", label: "Notifications", icon: Activity },
  { id: "orders", label: "Orders", icon: CreditCard },
] as const;

type SubscriptionForm = {
  validTill: string;
  total_customers: string;
  total_staffs: string;
  total_visitors: string;
  total_products: string;
  reason: string;
};

class DashboardRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "DashboardRequestError";
  }
}

async function readApiResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  const body = await response.text();

  try {
    return JSON.parse(body) as T;
  } catch {
    const message = response.ok
      ? `The server returned an invalid response (HTTP ${response.status}).`
      : `${fallbackMessage} The server returned a non-JSON response (HTTP ${response.status}); check the Vercel function logs.`;
    throw new DashboardRequestError(message, response.status);
  }
}

function isSubscriptionActive(
  subscription: AdminCustomer["subscription"],
): boolean {
  if (!subscription?.valid_till) return false;
  const expiry = Date.parse(subscription.valid_till);
  return Number.isFinite(expiry) && expiry > Date.now();
}

function localDateTimeValue(date: Date): string {
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function subscriptionFormFor(
  subscription: AdminCustomer["subscription"],
): SubscriptionForm {
  return {
    validTill:
      subscription?.valid_till &&
      Number.isFinite(Date.parse(subscription.valid_till))
        ? localDateTimeValue(new Date(subscription.valid_till))
        : "",
    total_customers: subscription ? String(subscription.total_customers) : "",
    total_staffs: subscription ? String(subscription.total_staffs) : "",
    total_visitors: subscription ? String(subscription.total_visitors) : "",
    total_products: subscription ? String(subscription.total_products) : "",
    reason: "",
  };
}

async function requestCustomerPage(
  cursor: string | null,
  token: string,
): Promise<CustomerPage> {
  const search = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const response = await fetch(`/api/admin/users${search}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const result = await readApiResponse<CustomerPage & { error?: string }>(
    response,
    "Unable to load customer data.",
  );

  if (!response.ok) {
    throw new DashboardRequestError(
      result.error ?? "Unable to load customer data.",
      response.status,
    );
  }

  return result;
}

async function updateSubscription(
  token: string,
  payload: Record<string, unknown>,
) {
  const response = await fetch("/api/admin/users", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const result = await readApiResponse<{
    error?: string;
    message?: string;
  }>(response, "Unable to update subscription.");
  if (!response.ok) {
    throw new Error(result.error ?? "Unable to update subscription.");
  }
  return result;
}

function planLabel(type: string | null | undefined) {
  if (type === "PAID") return "Paid";
  if (type === "FREE_TRAIL") return "Free trial";
  return type || "No plan";
}

function PlanBadge({ type }: { type: string | null | undefined }) {
  const variant =
    type === "PAID"
      ? "default"
      : type === "FREE_TRAIL"
        ? "secondary"
        : "outline";
  return <Badge variant={variant}>{planLabel(type)}</Badge>;
}

function SubscriptionStatusBadge({
  subscription,
}: {
  subscription: AdminCustomer["subscription"];
}) {
  if (!subscription) {
    return <Badge variant="outline">No subscription</Badge>;
  }

  return (
    <Badge
      variant={isSubscriptionActive(subscription) ? "default" : "secondary"}
    >
      {isSubscriptionActive(subscription) ? "Active" : "Expired"}
    </Badge>
  );
}

function CustomerRows({
  customers,
  section,
  emptyMessage,
  onManage,
}: {
  customers: AdminCustomer[];
  section: Section;
  emptyMessage: string;
  onManage: (customer: AdminCustomer) => void;
}) {
  if (!customers.length) {
    return (
      <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
        <Users className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="font-medium">No customers found</p>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </CardContent>
    );
  }

  return (
    <>
      <div className="space-y-3 p-4 lg:hidden">
        {customers.map((customer) => (
          <Card key={customer.uid}>
            <CardContent className="space-y-4 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {(customer.name || customer.email || "?")
                      .trim()
                      .slice(0, 1)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {customer.name || "Unnamed customer"}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {customer.email || "No email provided"}
                  </p>
                </div>
                <PlanBadge type={customer.subscription?.type} />
              </div>
              <Separator />
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div className="min-w-0">
                  <dt className="text-muted-foreground">Location</dt>
                  <dd className="mt-1 truncate font-medium">
                    {[customer.locality, customer.city]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Valid until</dt>
                  <dd className="mt-1 font-medium">
                    {customer.subscription?.valid_till || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Access</dt>
                  <dd className="mt-1">
                    <SubscriptionStatusBadge
                      subscription={customer.subscription}
                    />
                  </dd>
                </div>
                {section === "overview" && (
                  <div className="col-span-2 min-w-0">
                    <dt className="text-muted-foreground">Customer ID</dt>
                    <dd className="mt-1 truncate font-mono text-xs">
                      {customer.uid}
                    </dd>
                  </div>
                )}
              </dl>
              <Button
                variant={
                  isSubscriptionActive(customer.subscription)
                    ? "outline"
                    : "default"
                }
                className="w-full"
                onClick={() => onManage(customer)}
              >
                {isSubscriptionActive(customer.subscription)
                  ? "Manage subscription"
                  : "Grant subscription"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Customer</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valid until</TableHead>
              <TableHead className="pr-6 text-right">Customer ID</TableHead>
              <TableHead className="pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.uid}>
                <TableCell className="pl-6">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {(customer.name || customer.email || "?")
                          .trim()
                          .slice(0, 1)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {customer.name || "Unnamed customer"}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {customer.email || "No email provided"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {[customer.locality, customer.city]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </TableCell>
                <TableCell>
                  <PlanBadge type={customer.subscription?.type} />
                </TableCell>
                <TableCell>
                  <SubscriptionStatusBadge
                    subscription={customer.subscription}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {customer.subscription?.valid_till || "—"}
                </TableCell>
                <TableCell className="pr-6 text-right font-mono text-xs text-muted-foreground">
                  {customer.uid}
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <Button
                    size="sm"
                    variant={
                      isSubscriptionActive(customer.subscription)
                        ? "outline"
                        : "default"
                    }
                    onClick={() => onManage(customer)}
                  >
                    {isSubscriptionActive(customer.subscription)
                      ? "Manage"
                      : "Grant"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
  trend?: "up" | "down";
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
        <CardDescription>{title}</CardDescription>
        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <CardTitle className="text-2xl">{value}</CardTitle>
        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          {trend === "up" ? (
            <ArrowUpRight className="size-3 text-emerald-600" />
          ) : trend === "down" ? (
            <ArrowDownRight className="size-3 text-amber-600" />
          ) : null}
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function LoadingDashboard() {
  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <Skeleton className="size-12 rounded-full" />
          <Skeleton className="mt-2 h-5 w-48" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  const [access, setAccess] = useState<AccessState>("checking");
  const [section, setSection] = useState<Section>("overview");
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<AdminCustomer | null>(null);
  const [subscriptionForm, setSubscriptionForm] = useState<SubscriptionForm>(
    () => subscriptionFormFor(null),
  );
  const [subscriptionSaving, setSubscriptionSaving] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadPage = useCallback(async (cursor: string | null, token: string) => {
    setLoading(true);
    setError("");
    try {
      const page = await requestCustomerPage(cursor, token);
      setCustomers(page.users);
      setNextCursor(page.nextCursor);
      setMetrics(page.metrics);
      setAccess("ready");
      return true;
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Something went wrong.";
      setError(message);
      setAccess(
        caught instanceof DashboardRequestError && caught.status === 403
          ? "denied"
          : "error",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setAdminUser(user);
      setCustomers([]);
      setMetrics(null);
      setCursorHistory([null]);
      setSearch("");

      if (!user) {
        setAccess("signedOut");
        return;
      }

      setAccess("checking");
      try {
        await loadPage(null, await user.getIdToken(true));
      } catch {
        setError("Unable to verify your account. Please sign in again.");
        setAccess("error");
      }
    });
  }, [loadPage]);

  const visibleCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    const rows =
      section === "subscriptions"
        ? customers.filter((customer) => customer.subscription)
        : customers;
    if (!query) return rows;

    return rows.filter((customer) =>
      [
        customer.name,
        customer.email,
        customer.city,
        customer.locality,
        customer.uid,
      ]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [customers, search, section]);

  async function changePage(
    cursor: string | null,
    direction: "next" | "previous",
  ) {
    if (!adminUser) return;
    try {
      if (await loadPage(cursor, await adminUser.getIdToken())) {
        setCursorHistory((history) =>
          direction === "next" ? [...history, cursor] : history.slice(0, -1),
        );
        setSearch("");
      }
    } catch {
      setError("Unable to refresh your session. Please sign in again.");
      setAccess("error");
    }
  }

  async function refreshPage() {
    if (!adminUser) return;
    try {
      await loadPage(
        cursorHistory[cursorHistory.length - 1] ?? null,
        await adminUser.getIdToken(),
      );
    } catch {
      setError("Unable to refresh your session. Please sign in again.");
      setAccess("error");
    }
  }

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setPassword("");
    } catch (caught) {
      const code =
        typeof caught === "object" && caught && "code" in caught
          ? String(caught.code)
          : "";
      setLoginError(
        code === "auth/invalid-credential"
          ? "The email or password is incorrect."
          : caught instanceof Error
            ? caught.message
            : "Unable to sign in. Please try again.",
      );
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
    setSection("overview");
  }

  function openSubscriptionManager(customer: AdminCustomer) {
    setSelectedCustomer(customer);
    setSubscriptionForm(subscriptionFormFor(customer.subscription));
    setSubscriptionError("");
    setSuccessMessage("");
    setCancelConfirmOpen(false);
  }

  async function handleGrantSubscription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!adminUser || !selectedCustomer) return;
    setSubscriptionSaving(true);
    setSubscriptionError("");

    const quotas = {
      total_customers: Number(subscriptionForm.total_customers),
      total_staffs: Number(subscriptionForm.total_staffs),
      total_visitors: Number(subscriptionForm.total_visitors),
      total_products: Number(subscriptionForm.total_products),
    };
    if (
      Object.values(quotas).some(
        (value) => !Number.isSafeInteger(value) || value < 0,
      )
    ) {
      setSubscriptionError(
        "Enter a non-negative whole number for every quota.",
      );
      setSubscriptionSaving(false);
      return;
    }

    try {
      const response = await updateSubscription(await adminUser.getIdToken(), {
        action: "grant",
        uid: selectedCustomer.uid,
        valid_till: new Date(subscriptionForm.validTill).toISOString(),
        ...quotas,
        reason: subscriptionForm.reason,
      });
      setSuccessMessage(response.message ?? "Subscription updated.");
      setSelectedCustomer(null);
      await refreshPage();
    } catch (caught) {
      setCancelConfirmOpen(false);
      setSubscriptionError(
        caught instanceof Error
          ? caught.message
          : "Unable to update the subscription.",
      );
    } finally {
      setSubscriptionSaving(false);
    }
  }

  async function handleCancelSubscription() {
    if (!adminUser || !selectedCustomer) return;
    setSubscriptionSaving(true);
    setSubscriptionError("");
    try {
      const response = await updateSubscription(await adminUser.getIdToken(), {
        action: "cancel",
        uid: selectedCustomer.uid,
        reason: subscriptionForm.reason,
      });
      setSuccessMessage(response.message ?? "Subscription cancelled.");
      setCancelConfirmOpen(false);
      setSelectedCustomer(null);
      await refreshPage();
    } catch (caught) {
      setCancelConfirmOpen(false);
      setSubscriptionError(
        caught instanceof Error
          ? caught.message
          : "Unable to cancel the subscription.",
      );
    } finally {
      setSubscriptionSaving(false);
    }
  }

  if (access === "checking") {
    return <LoadingDashboard />;
  }

  if (access === "signedOut") {
    return (
      <main className="flex min-h-svh items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-3">
            <Avatar className="size-12 rounded-xl">
              <AvatarFallback className="rounded-xl bg-primary text-primary-foreground">
                <Shield className="size-5" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-2xl">
                Sign in to your workspace
              </CardTitle>
              <CardDescription>
                Use an administrator account to access customer and subscription
                information.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSignIn}>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email address</Label>
                <Input
                  id="admin-email"
                  required
                  autoComplete="username"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  required
                  autoComplete="current-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                />
              </div>
              {loginError && (
                <Alert variant="destructive">
                  <Activity />
                  <AlertTitle>Sign in failed</AlertTitle>
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" disabled={loginLoading} className="w-full">
                {loginLoading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Access is restricted to accounts approved by your Firebase
              administrator.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (access === "denied" || access === "error") {
    const denied = access === "denied";
    return (
      <main className="flex min-h-svh items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>
              {denied
                ? "Administrator access required"
                : "Couldn’t load dashboard"}
            </CardTitle>
            <CardDescription>
              {denied
                ? "This account is signed in, but it does not have the administrator role."
                : error || "Please try again in a moment."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end gap-2">
            {!denied && (
              <Button variant="outline" onClick={refreshPage}>
                <RefreshCw />
                Retry
              </Button>
            )}
            <Button variant="secondary" onClick={handleSignOut}>
              <LogOut />
              Sign out
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const sectionTitle =
    section === "overview"
      ? "Overview"
      : section === "customers"
        ? "Customers"
        : section === "subscriptions"
          ? "Subscriptions"
          : (navigation.find((item) => item.id === section)?.label ??
            "Records");
  const page = cursorHistory.length;

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="size-9 rounded-lg">
              <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                <Activity className="size-4" />
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">RAN INFOTECH</span>
              <span className="truncate text-xs text-muted-foreground">
                Admin workspace
              </span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map(({ id, label, icon: Icon }) => (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton
                      isActive={section === id}
                      onClick={() => {
                        setSection(id);
                        setSearch("");
                      }}
                    >
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                    {id === "customers" && metrics && (
                      <SidebarMenuBadge>{metrics.totalUsers}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Separator className="mb-2" />
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="size-8">
              <AvatarFallback>
                {(adminUser?.displayName || adminUser?.email || "A")
                  .slice(0, 1)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {adminUser?.displayName || adminUser?.email}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                Administrator
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              onClick={handleSignOut}
            >
              <LogOut />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-h-svh min-w-0">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mx-1 h-4" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{sectionTitle}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshPage}
            disabled={loading}
          >
            <RefreshCw className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </header>

        <main className="mx-auto w-full max-w-7xl min-w-0 space-y-6 p-4 sm:p-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {section === "overview"
                ? `Welcome${adminUser?.displayName ? `, ${adminUser.displayName.split(" ")[0]}` : ""}`
                : sectionTitle}
            </h1>
            <p className="text-sm text-muted-foreground">
              {section === "overview"
                ? "Here’s an overview of your customers and plans."
                : section === "customers"
                  ? "Browse customer accounts and their current plan details."
                  : section === "subscriptions"
                    ? "Review the subscription plans currently recorded for customers."
                    : "Safely manage verified records for the selected center user."}
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <Activity />
              <AlertTitle>Unable to load customer data</AlertTitle>
              <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
                <span>{error}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshPage}
                  disabled={loading}
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert>
              <CheckCircle2 />
              <AlertTitle>Subscription updated</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {section === "overview" && (
            <section
              aria-label="Customer metrics"
              className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 xl:grid-cols-4"
            >
              <MetricCard
                title="Total customers"
                value={metrics?.totalUsers ?? "—"}
                description="Customer accounts in Firestore"
                icon={Users}
              />
              <MetricCard
                title="Paid plan records"
                value={metrics?.paidSubscriptions ?? "—"}
                description="Accounts assigned a paid plan"
                icon={CreditCard}
              />
              <MetricCard
                title="Free trials"
                value={metrics?.freeTrials ?? "—"}
                description="Accounts on a free trial"
                icon={Activity}
              />
              <MetricCard
                title="Customers on this page"
                value={customers.length}
                description={`${PAGE_SIZE} records per page`}
                icon={Grid2X2}
              />
            </section>
          )}

          {section !== "overview" &&
            section !== "customers" &&
            section !== "subscriptions" &&
            adminUser && (
              <ResourceManager
                users={customers}
                resource={section === "customers-data" ? "customers" : section}
                onUserStatusChange={refreshPage}
              />
            )}

          {(section === "overview" ||
            section === "customers" ||
            section === "subscriptions") && (
            <Card className="min-w-0">
              <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <CardTitle>
                    {section === "overview"
                      ? "Customer snapshot"
                      : section === "subscriptions"
                        ? "Subscription accounts"
                        : "Customer directory"}
                  </CardTitle>
                  <CardDescription>
                    {section === "overview"
                      ? "Customer and plan information from your account records."
                      : `Page ${page} · ${PAGE_SIZE} records per page`}
                  </CardDescription>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
                    <Search
                      className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search this page"
                      aria-label="Search customers on this page"
                      className="pl-9"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Refresh customer list"
                    onClick={refreshPage}
                    disabled={loading}
                  >
                    <RefreshCw className={loading ? "animate-spin" : ""} />
                  </Button>
                </div>
              </CardHeader>

              {loading && customers.length === 0 ? (
                <CardContent className="space-y-3">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Skeleton key={index} className="h-14 w-full" />
                  ))}
                </CardContent>
              ) : (
                <CustomerRows
                  customers={
                    section === "overview"
                      ? visibleCustomers.slice(0, 8)
                      : visibleCustomers
                  }
                  section={section}
                  onManage={openSubscriptionManager}
                  emptyMessage={
                    search
                      ? "Try another name, email, or customer ID on this page."
                      : section === "subscriptions"
                        ? "There are no subscriptions on this page."
                        : "Customer records will appear here when available."
                  }
                />
              )}

              <Separator />
              <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Search applies to the current page of {PAGE_SIZE} records.
                </p>
                <div className="flex items-center justify-end gap-2">
                  <span className="mr-2 text-sm text-muted-foreground">
                    Page {page}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Previous page"
                    onClick={() =>
                      void changePage(
                        cursorHistory[cursorHistory.length - 2] ?? null,
                        "previous",
                      )
                    }
                    disabled={page === 1 || loading}
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Next page"
                    onClick={() =>
                      nextCursor && void changePage(nextCursor, "next")
                    }
                    disabled={!nextCursor || loading}
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </SidebarInset>

      <Dialog
        open={selectedCustomer !== null}
        onOpenChange={(open) => {
          if (!open && !subscriptionSaving) {
            setSelectedCustomer(null);
            setSubscriptionError("");
          }
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {isSubscriptionActive(selectedCustomer?.subscription ?? null)
                ? "Manage subscription"
                : "Grant subscription"}
            </DialogTitle>
            <DialogDescription>
              {selectedCustomer?.name || selectedCustomer?.email || "Customer"}
              {" · "}
              Paid access is stored as <code>SUBSCRIPTION</code>. Saving applies
              the new expiry and all four feature quotas immediately.
            </DialogDescription>
          </DialogHeader>

          <form id="subscription-form" onSubmit={handleGrantSubscription}>
            <div className="grid gap-4 py-2 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="subscription-expiry">Access through</Label>
                <Input
                  id="subscription-expiry"
                  type="datetime-local"
                  required
                  min={localDateTimeValue(new Date())}
                  value={subscriptionForm.validTill}
                  onChange={(event) =>
                    setSubscriptionForm((form) => ({
                      ...form,
                      validTill: event.target.value,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Set the exact date and time this customer&apos;s access ends.
                </p>
              </div>
              {(
                [
                  ["total_customers", "Customers"],
                  ["total_staffs", "Staff"],
                  ["total_visitors", "Visitors"],
                  ["total_products", "Products"],
                ] as const
              ).map(([field, label]) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={`quota-${field}`}>{label} limit</Label>
                  <Input
                    id={`quota-${field}`}
                    type="number"
                    min="0"
                    step="1"
                    required
                    inputMode="numeric"
                    value={subscriptionForm[field]}
                    onChange={(event) =>
                      setSubscriptionForm((form) => ({
                        ...form,
                        [field]: event.target.value,
                      }))
                    }
                  />
                </div>
              ))}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="subscription-reason">
                  Admin note (optional)
                </Label>
                <Textarea
                  id="subscription-reason"
                  maxLength={500}
                  value={subscriptionForm.reason}
                  onChange={(event) =>
                    setSubscriptionForm((form) => ({
                      ...form,
                      reason: event.target.value,
                    }))
                  }
                  placeholder="Add a note for the subscription audit history"
                  rows={3}
                />
              </div>
            </div>

            {subscriptionError && (
              <Alert variant="destructive" className="mb-4">
                <Activity />
                <AlertTitle>Update failed</AlertTitle>
                <AlertDescription>{subscriptionError}</AlertDescription>
              </Alert>
            )}
          </form>

          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between">
            {isSubscriptionActive(selectedCustomer?.subscription ?? null) ? (
              <Button
                type="button"
                variant="destructive"
                disabled={subscriptionSaving}
                onClick={() => setCancelConfirmOpen(true)}
              >
                Cancel subscription
              </Button>
            ) : (
              <span />
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                disabled={subscriptionSaving}
                onClick={() => setSelectedCustomer(null)}
              >
                Close
              </Button>
              <Button
                type="submit"
                form="subscription-form"
                disabled={subscriptionSaving}
              >
                {subscriptionSaving ? "Saving…" : "Save subscription"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={cancelConfirmOpen}
        onOpenChange={(open) => {
          if (!subscriptionSaving) setCancelConfirmOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              This immediately removes subscription access for{" "}
              {selectedCustomer?.name || selectedCustomer?.email || "this user"}
              . Their subscription record will be saved to the admin transaction
              history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={subscriptionSaving}>
              Keep subscription
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={subscriptionSaving}
              onClick={(event) => {
                event.preventDefault();
                void handleCancelSubscription();
              }}
            >
              {subscriptionSaving ? "Cancelling…" : "Cancel immediately"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
