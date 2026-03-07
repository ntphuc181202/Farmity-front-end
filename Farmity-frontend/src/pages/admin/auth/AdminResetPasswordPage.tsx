import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../../../api/authApi";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card, CardContent } from "../../../components/ui/card";
import Swal from "sweetalert2";

function AdminResetPasswordPage() {
  const [step, setStep] = useState<number>(1);

  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleRequestOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Email is required",
      });
      return;
    }

    try {
      setLoading(true);

      await authApi.requestResetPassword(email.trim());

      await Swal.fire({
        icon: "success",
        title: "OTP sent",
        text: "Check your email for the 6-digit OTP.",
        confirmButtonColor: "#10b981",
      });

      setStep(2);
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Request failed",
        text: "Unable to send OTP.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!otp.trim() || !newPassword.trim()) {
      Swal.fire({
        icon: "warning",
        title: "OTP and new password are required",
      });
      return;
    }

    try {
      setLoading(true);

      await authApi.confirmResetPassword({
        email,
        otp,
        newPassword,
      });

      await Swal.fire({
        icon: "success",
        title: "Password reset successful",
        text: "You can now login with your new password.",
      });

      navigate("/admin/login");
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Reset failed",
        text: "Invalid OTP or expired.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Reset Password
          </h1>
        </div>

        <Card className="backdrop-blur border-slate-800/70 shadow-lg shadow-emerald-500/5 bg-slate-900/80">
          <CardContent>
            {step === 1 && (
              <form onSubmit={handleRequestOtp} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label className="text-sm">Admin Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/login")}
                    className="text-sm text-emerald-400 hover:text-emerald-300"
                  >
                    Back to login
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleConfirmReset} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label className="text-sm">OTP</Label>
                  <Input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">New Password</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminResetPasswordPage;