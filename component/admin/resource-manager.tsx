"use client";

import { useEffect, useMemo, useState } from "react";
import { Archive, CheckCircle2, Edit3, RotateCcw } from "lucide-react";
import { auth } from "@/firebase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type User = { uid: string; name: string | null; email: string | null; is_active?: boolean };
type Resource = "customers" | "visitors" | "staff" | "products" | "domains" | "cards" | "appointments" | "notifications" | "orders";
type Row = { id: string; data: Record<string, unknown> };

const resourceLabels: Record<Resource, string> = {
  customers: "Customers", visitors: "Visitors", staff: "Staff", products: "Products",
  domains: "Domains", cards: "Cards", appointments: "Appointments", notifications: "Notifications", orders: "Orders",
};
const fieldMap: Record<Resource, string[]> = {
  customers: ["name", "email", "phone", "address", "gender", "medical_issues"],
  visitors: ["name", "email", "phone", "address", "gender", "medical_issues"],
  staff: ["name", "email", "phone", "address", "gender", "about"],
  products: ["name", "price", "in_stock", "flavour", "is_available", "type", "thumbnail"],
  domains: ["is_active", "subscription.valid_till"],
  cards: ["status"], appointments: [], notifications: [], orders: [],
};

function valueFor(row: Row, field: string) {
  const value = field.split(".").reduce<unknown>((current, key) => (
    current && typeof current === "object" ? (current as Record<string, unknown>)[key] : undefined
  ), row.data);
  return value === null || value === undefined ? "" : String(value);
}

export default function ResourceManager({ users, resource, onUserStatusChange }: {
  users: User[];
  resource: Resource;
  onUserStatusChange: () => void;
}) {
  const [uid, setUid] = useState(users[0]?.uid ?? "");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState<{ row: Row; restore: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createValues, setCreateValues] = useState<Record<string, string>>({});

  const selectedUser = users.find((user) => user.uid === uid);
  const fields = fieldMap[resource];
  const readOnly = fields.length === 0;

  async function load() {
    if (!uid) return;
    setLoading(true); setError("");
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Your session has expired. Please sign in again.");
      const response = await fetch(`/api/admin/resources?uid=${encodeURIComponent(uid)}&resource=${resource}`, {
        headers: { Authorization: "Bearer " + token },
        cache: "no-store",
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Unable to load records.");
      setRows(body.rows);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load records.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, [uid, resource]); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleRows = useMemo(() => showArchived
    ? rows
    : rows.filter((row) => row.data.archived !== true && row.data.is_active !== false), [rows, showArchived]);

  function openEdit(row: Row) {
    setEditing(row);
    setValues(Object.fromEntries(fields.map((field) => [field, valueFor(row, field)])));
    setError("");
  }

  function openCreate() {
    setCreating(true);
    setCreateValues(Object.fromEntries(fields.map((field) => [
      field,
      field === "price" || field === "in_stock" ? "0" : field === "is_available" || field === "is_active" ? "true" : "",
    ])));
    setError("");
  }

  async function createRecord() {
    setSaving(true); setError("");
    const parsed: Record<string, string | number | boolean | null> = {};
    for (const field of fields) {
      const value = createValues[field] ?? "";
      if (["price", "in_stock"].includes(field)) parsed[field] = value === "" ? null : Number(value);
      else if (["is_available", "is_active"].includes(field)) parsed[field] = value === "true";
      else parsed[field] = value;
    }
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Your session has expired. Please sign in again.");
      const response = await fetch("/api/admin/resources", {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({ uid, resource, fields: parsed }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Unable to create record.");
      setCreating(false); setMessage(body.message); await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create record.");
    } finally { setSaving(false); }
  }

  async function updateRecord() {
    if (!editing) return;
    setSaving(true); setError("");
    const parsed: Record<string, string | number | boolean | null> = {};
    for (const field of fields) {
      const value = values[field] ?? "";
      if (["price", "in_stock"].includes(field)) parsed[field] = value === "" ? null : Number(value);
      else if (["is_available", "is_active"].includes(field)) parsed[field] = value === "true";
      else parsed[field] = value;
    }
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Your session has expired. Please sign in again.");
      const response = await fetch("/api/admin/resources", {
        method: "PATCH", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({ uid, resource, id: editing.id, action: "update", fields: parsed }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Unable to update record.");
      setEditing(null); setMessage(body.message); await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to update record."); }
    finally { setSaving(false); }
  }

  async function archiveRecord() {
    if (!confirm) return;
    setSaving(true); setError("");
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Your session has expired. Please sign in again.");
      const response = await fetch("/api/admin/resources", {
        method: "PATCH", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({ uid, resource, id: confirm.row.id, action: confirm.restore ? "restore" : "archive" }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Unable to change record status.");
      setConfirm(null); setMessage(body.message); await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to change record status."); }
    finally { setSaving(false); }
  }

  async function toggleUser() {
    if (!selectedUser) return;
    const action = selectedUser.is_active === false ? "activate" : "deactivate";
    if (!window.confirm(`Explicitly ${action} this center user? Linked data will be preserved.`)) return;
    const token = await auth.currentUser?.getIdToken();
    if (!token) { setError("Your session has expired. Please sign in again."); return; }
    const response = await fetch("/api/admin/users", {
      method: "PATCH", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify({ uid, action, reason: `Admin ${action} from data management` }),
    });
    const body = await response.json();
    if (!response.ok) { setError(body.error ?? "Unable to change user status."); return; }
    setMessage(body.message); onUserStatusChange();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data management</CardTitle>
        <CardDescription>Edit or archive user-scoped records without deleting history or unrelated data.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <div className="space-y-2"><Label htmlFor="resource-user">Center user</Label>
            <select id="resource-user" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={uid} onChange={(event) => setUid(event.target.value)}>
              {users.map((user) => <option key={user.uid} value={user.uid}>{user.name || user.email || user.uid}</option>)}
            </select>
          </div>
          <div className="flex items-end"><div className="rounded-md border bg-muted/40 px-3 py-2 text-sm font-medium">{resourceLabels[resource]}</div></div>
          <div className="flex items-end"><Button variant={selectedUser?.is_active === false ? "default" : "destructive"} onClick={() => void toggleUser()} disabled={!selectedUser}>{selectedUser?.is_active === false ? <RotateCcw /> : <Archive />}{selectedUser?.is_active === false ? "Activate user" : "Deactivate user"}</Button></div>
        </div>
        {error && <Alert variant="destructive"><AlertTitle>Operation failed</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        {message && <Alert><CheckCircle2 /><AlertTitle>Saved</AlertTitle><AlertDescription>{message}</AlertDescription></Alert>}
        {readOnly && <Alert><AlertTitle>Read-only related records</AlertTitle><AlertDescription>These records can be reviewed but are not edited or deleted by this dashboard.</AlertDescription></Alert>}
        <div className="flex justify-end gap-2">
          {!readOnly && <Button size="sm" onClick={openCreate}>Create {resourceLabels[resource].replace(/s$/, "")}</Button>}
          <Button variant={showArchived ? "secondary" : "outline"} size="sm" onClick={() => setShowArchived((value) => !value)}>{showArchived ? "Hide archived" : "Show archived"}</Button>
        </div>
        <div className="overflow-x-auto rounded-md border">
          <Table><TableHeader><TableRow><TableHead>Record ID</TableHead><TableHead>Summary</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {!loading && !visibleRows.length && <TableRow><TableCell colSpan={4} className="py-10 text-center text-muted-foreground">No active records found.</TableCell></TableRow>}
            {visibleRows.map((row) => { const archived = row.data.archived === true || row.data.is_active === false; return <TableRow key={row.id}><TableCell className="font-mono text-xs">{row.id}</TableCell><TableCell>{String(row.data.name ?? row.data.title ?? row.data.status ?? "Related record")}</TableCell><TableCell><Badge variant={archived ? "secondary" : "default"}>{archived ? "Archived" : "Active"}</Badge></TableCell><TableCell className="space-x-2 text-right">{!readOnly && !archived && <Button size="sm" variant="outline" onClick={() => openEdit(row)}><Edit3 />Edit</Button>} {!readOnly && <Button size="sm" variant="ghost" onClick={() => setConfirm({ row, restore: archived })}>{archived ? <RotateCcw /> : <Archive />}{archived ? "Restore" : "Archive"}</Button>}</TableCell></TableRow>; })}
          </TableBody></Table>
        </div>
        {rows.some((row) => row.data.archived === true || row.data.is_active === false) && <p className="text-xs text-muted-foreground">Archived records are preserved and excluded from the active list.</p>}
      </CardContent>
      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent><DialogHeader><DialogTitle>Edit {resourceLabels[resource]}</DialogTitle><DialogDescription>Only known safe fields are editable. Other Firestore fields remain unchanged.</DialogDescription></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">{fields.map((field) => <div className="space-y-2" key={field}><Label htmlFor={`edit-${field}`}>{field}</Label><Input id={`edit-${field}`} value={values[field] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))} /></div>)}</div>
          <DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={() => void updateRecord()} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={creating} onOpenChange={(open) => !open && setCreating(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create {resourceLabels[resource].replace(/s$/, "")}</DialogTitle><DialogDescription>This creates a new user-owned record and preserves the application’s ownership fields.</DialogDescription></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => <div className="space-y-2" key={field}><Label htmlFor={`create-${field}`}>{field}{["name", "phone", "price", "in_stock"].includes(field) ? " *" : ""}</Label><Input id={`create-${field}`} required={["name", "phone", "price", "in_stock"].includes(field)} type={["price", "in_stock"].includes(field) ? "number" : "text"} value={createValues[field] ?? ""} onChange={(event) => setCreateValues((current) => ({ ...current, [field]: event.target.value }))} /></div>)}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button><Button onClick={() => void createRecord()} disabled={saving}>{saving ? "Creating…" : "Create entry"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={Boolean(confirm)} onOpenChange={(open) => !open && setConfirm(null)}>
      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{confirm?.restore ? "Restore this record?" : "Archive this record?"}</AlertDialogTitle><AlertDialogDescription>{confirm?.restore ? "This will make the preserved record active again." : "This is a reversible deactivation. The record and its history will be preserved."}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep record</AlertDialogCancel><AlertDialogAction onClick={(event) => { event.preventDefault(); void archiveRecord(); }}>{confirm?.restore ? "Restore record" : "Archive record"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
