import { useEffect, useState, FormEvent } from "react";
import Swal from "sweetalert2";
import staffApi from "../../api/staffApi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

interface StaffAccount {
  _id?: string;
  id?: string;
  username?: string;
  email?: string;
  isStaff?: string[];
}

const staffModules = ["blog", "news", "media"];

function AdminStaffManager() {
  const [accounts, setAccounts] = useState<StaffAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [staffRights, setStaffRights] = useState<string[]>([]);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const ADMIN_SECRET =
    import.meta.env.VITE_ADMIN_CREATION_SECRET || "ADMIN12345";

  const fetchStaffAccounts = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await staffApi.getStaffAccounts();
      setAccounts(res.data || []);
    } catch (err) {
      console.error("Failed to load staff accounts", err);
      setError("Unable to load staff accounts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffAccounts();
  }, []);

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setStaffRights([]);
    setPermissionsOpen(false);
    setError("");
    setEditingId(null);
  };

  const handleEdit = (account: StaffAccount) => {
    setEditingId(account._id || account.id || null);
    setUsername(account.username || "");
    setEmail(account.email || "");
    setPassword("");
    setStaffRights(account.isStaff || []);
    setError("");
    setIsModalOpen(true);
  };

  const openCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !email.trim()) {
      setError("Username and email are required.");
      return;
    }

    if (!editingId && !password.trim()) {
      setError("Password is required when creating a new staff account.");
      return;
    }

    const payload = {
      username: username.trim(),
      email: email.trim(),
      adminSecret: ADMIN_SECRET,
      isStaff: staffRights,
    };

    try {
      setSaving(true);

      if (editingId) {
        await staffApi.updateStaffAccount(editingId, {
          email: payload.email,
          isStaff: payload.isStaff,
        });

        Swal.fire({
          toast: true,
          icon: "success",
          title: "Staff account updated",
          position: "top-end",
          showConfirmButton: false,
          timer: 1800,
        });
      } else {
        await staffApi.createStaffAccount({
          username: payload.username,
          password: password.trim(),
          email: payload.email,
          adminSecret: payload.adminSecret,
          isStaff: payload.isStaff,
        });

        Swal.fire({
          toast: true,
          icon: "success",
          title: "Staff account created",
          position: "top-end",
          showConfirmButton: false,
          timer: 1800,
        });
      }

      resetForm();
      setIsModalOpen(false);
      await fetchStaffAccounts();
    } catch (err) {
      console.error("Staff save failed", err);
      setError("Failed to save staff account. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (accountId: string) => {
    const result = await Swal.fire({
      title: "Delete staff account?",
      text: "This will remove the staff account permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await staffApi.deleteStaffAccount(accountId);
      setAccounts((prev) =>
        prev.filter((item) => (item._id || item.id) !== accountId),
      );
      if (editingId === accountId) {
        resetForm();
      }

      Swal.fire({
        toast: true,
        icon: "success",
        title: "Staff account deleted",
        position: "top-end",
        showConfirmButton: false,
        timer: 1800,
      });
    } catch (err) {
      console.error("Delete failed", err);
      Swal.fire("Error", "Failed to delete staff account.", "error");
    }
  };

  const filteredAccounts = accounts.filter((account) => {
    const term = search.toLowerCase();
    const usernameValue = (account.username || "").toLowerCase();
    const emailValue = (account.email || "").toLowerCase();
    const tagValue = (account.isStaff || []).join(", ").toLowerCase();
    return (
      usernameValue.includes(term) ||
      emailValue.includes(term) ||
      tagValue.includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Staff management
          </h1>
        </div>
        <Button onClick={openCreate}>+ New Staff</Button>
      </header>

      <div>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col gap-4 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg text-white">
                  Staff accounts
                </CardTitle>
                <p className="text-sm text-slate-400">
                  {accounts.length} staff account
                  {accounts.length === 1 ? "" : "s"} loaded.
                </p>
              </div>
              <Input
                className="max-w-xs"
                placeholder="Search staff..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent className="divide-y divide-slate-800">
            {loading ? (
              <div className="p-6 text-sm text-slate-400">
                Loading staff accounts…
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="p-6 text-sm text-slate-400">
                No staff accounts found.
              </div>
            ) : (
              filteredAccounts.map((account, index) => {
                const accountId = account._id || account.id || "";
                return (
                  <div
                    key={accountId}
                    className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-lg shadow-slate-950/20"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-200">
                            {account.username || "Unnamed staff"}
                          </div>
                          {/* <h3 className="text-lg font-semibold text-white">
                            {account.username || "Unnamed staff"}
                          </h3> */}
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
                            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                              Email
                            </p>
                            <p className="mt-1 text-sm text-slate-100">
                              {account.email || "-"}
                            </p>
                          </div>
                          <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
                            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                              Role
                            </p>
                            <p className="mt-1 text-sm text-slate-100">
                              {(account.isStaff || []).length > 0
                                ? (account.isStaff || []).join(", ")
                                : "No role assigned"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(account)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(accountId)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4">
          <Card className="my-8 flex w-full max-w-xl flex-col border border-slate-800 bg-slate-950">
            <CardHeader className="shrink-0 border-b border-slate-800">
              <CardTitle className="text-lg text-white">
                {editingId ? "Edit staff account" : "Create staff account"}
              </CardTitle>
            </CardHeader>

            <div className="flex-1 overflow-y-auto p-6">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-200">
                    Username
                  </label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="staff username"
                    disabled={Boolean(editingId)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-200">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@example.com"
                  />
                </div>
                {!editingId && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-200">
                      Password
                    </label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-200">
                    Staff permissions
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setPermissionsOpen((open) => !open)}
                      className="flex min-h-[2.25rem] w-full items-center justify-between rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors hover:border-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                    >
                      <span className="flex flex-wrap gap-2">
                        {staffRights.length > 0 ? (
                          staffRights.map((module) => (
                            <span
                              key={module}
                              className="rounded-full border border-sky-400/30 bg-sky-500/15 px-2 py-1 text-xs uppercase tracking-[0.12em] text-black"
                            >
                              {module}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500">Select modules</span>
                        )}
                      </span>
                      <span className="text-slate-500">▾</span>
                    </button>

                    {permissionsOpen && (
                      <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-xl">
                        {staffModules.map((module) => (
                          <label
                            key={module}
                            className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-900"
                          >
                            <span className="capitalize">{module}</span>
                            <input
                              type="checkbox"
                              checked={staffRights.includes(module)}
                              onChange={(e) => {
                                setStaffRights((prev) =>
                                  e.target.checked
                                    ? [...prev, module]
                                    : prev.filter((value) => value !== module),
                                );
                              }}
                              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                            />
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Open the dropdown and choose blog, news, or media.
                  </p>
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Update staff"
                        : "Create staff"}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default AdminStaffManager;
