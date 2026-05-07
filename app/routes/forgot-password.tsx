import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "@/services/apiAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [emailAddress, setEmailAddress] = useState("");

  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (response) => {
      toast.success(response?.message || "Password reset instructions sent.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to send reset instructions.");
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!emailAddress.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    mutation.mutate({ emailAddress: emailAddress.trim() });
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/95 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Enter your admin email to receive reset instructions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="emailAddress">Email address</Label>
              <Input
                id="emailAddress"
                type="email"
                value={emailAddress}
                onChange={(event) => setEmailAddress(event.target.value)}
                disabled={mutation.isPending}
                required
              />
            </div>
            <Button className="w-full" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Sending..." : "Send Reset Link"}
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
