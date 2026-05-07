import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { resetPassword, verifyResetToken } from "@/services/apiAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const tokenQuery = useQuery({
    queryKey: ["verify-reset-token", token],
    queryFn: () => verifyResetToken({ token }),
    enabled: Boolean(token),
    retry: false,
  });

  const resetMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: (response) => {
      toast.success(response?.message || "Password reset successfully.");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to reset password.");
    },
  });

  useEffect(() => {
    if (!token) {
      toast.error("Reset token is missing.");
    }
  }, [token]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      toast.error("Reset token is missing.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    resetMutation.mutate({ token, newPassword, confirmPassword });
  }

  const tokenInvalid = Boolean(tokenQuery.error);
  const canSubmit = Boolean(token) && !tokenInvalid && !tokenQuery.isLoading;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/95 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle>Create New Password</CardTitle>
          <CardDescription>
            {tokenQuery.isLoading
              ? "Verifying reset token..."
              : tokenInvalid
                ? "This reset link is invalid or expired."
                : "Enter a new password for your admin account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                disabled={!canSubmit || resetMutation.isPending}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={!canSubmit || resetMutation.isPending}
                required
              />
            </div>
            <Button className="w-full" type="submit" disabled={!canSubmit || resetMutation.isPending}>
              {resetMutation.isPending ? "Resetting..." : "Reset Password"}
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link to="/login">Back to login</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
