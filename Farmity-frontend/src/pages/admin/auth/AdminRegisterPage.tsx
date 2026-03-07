import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import authApi from "../../../api/authApi";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../../components/ui/card";

const ADMIN_SECRET = import.meta.env.VITE_ADMIN_CREATION_SECRET;

function AdminRegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      await authApi.registerAdmin({
        username: username.trim(),
        email: email.trim(),
        password: password.trim(),
        adminSecret: ADMIN_SECRET,
      });

      setSuccess("Admin account created successfully. You can now log in.");
      setTimeout(() => {
        navigate("/admin/login", { replace: true });
      }, 800);
    } catch (err) {
      console.error("Register admin failed", err);
      setError(
        "Failed to create admin. Please check server configuration or secret.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center space-y-1">
          <p className="text-xs font-semibold tracking-wide text-emerald-500 uppercase">
            Stardewvalley Admin
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create admin account
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            This page is used to provision admin access.
          </p>
        </div>

        <Card className="backdrop-blur border-slate-800/70 shadow-lg shadow-emerald-500/5 bg-slate-900/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Register admin
            </CardTitle>
            <CardDescription>
              Fill in the details to create an account.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label className="text-sm">Username</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-sm text-emerald-500 dark:text-emerald-400">
                  {success}
                </p>
              )}

              <Button type="submit" disabled={loading} className="w-full mt-1">
                {loading ? "Creating..." : "Create admin"}
              </Button>
            </form>

            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 text-center">
              Already have an admin account?{" "}
              <Link
                to="/admin/login"
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Back to login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminRegisterPage;

