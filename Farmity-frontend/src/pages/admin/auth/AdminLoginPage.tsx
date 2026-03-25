import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../../../api/authApi";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card, CardContent } from "../../../components/ui/card";
import Swal from "sweetalert2";

function AdminLoginPage() {
  const CONFLICT_MESSAGE = "This account is already logged in on another device.";
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }

    try {
      setLoading(true);

      const res = await authApi.loginAdmin({
        username: username.trim(),
        password: password.trim(),
      });

      const data = res.data as {
        userId?: string;
        username?: string;
        access_token?: string;
      };

      if (data?.access_token) {
        localStorage.setItem(
          "auth",
          JSON.stringify({
            userId: data.userId,
            username: data.username,
            access_token: data.access_token,
          }),
        );

        localStorage.setItem("isAdminLoggedIn", "true");

        await Swal.fire({
          toast: true,
          icon: "success",
          title: "Logged in successfully",
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: "#020617",
          color: "#e5e7eb",
        });

        navigate("/admin/blog", { replace: true });
      }
    } catch (err: any) {
      console.error("Login failed", err);

      const status = err?.response?.status;
      const statusCode = err?.response?.data?.statusCode;
      const rawMessage = err?.response?.data?.message;
      const backendMessage = Array.isArray(rawMessage)
        ? rawMessage.join(" ")
        : typeof rawMessage === "string"
          ? rawMessage
          : "";
      const normalizedMessage = backendMessage.toLowerCase();
      const isConflictError =
        status === 409 ||
        statusCode === 409 ||
        normalizedMessage.includes("already logged in on another device");

      if (isConflictError) {
        setError(CONFLICT_MESSAGE);
      } else if (status === 401 || statusCode === 401) {
        setError("Invalid username or password.");
      } else if (!err?.response) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Login failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        </div>

        <Card className="backdrop-blur border-slate-800/70 shadow-lg shadow-emerald-500/5 bg-slate-900/80">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label className="text-sm">Account</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-sm">Password</Label>

                  <button
                    type="button"
                    onClick={() => navigate("/admin/reset-password")}
                    className="text-xs text-emerald-400 hover:text-emerald-300"
                  >
                    Forgot password?
                  </button>
                </div>

                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={loading} className="w-full mt-1">
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminLoginPage;
