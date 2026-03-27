import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Car } from "lucide-react";
import { useLogin } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Route } from "../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Stp Alumni - Admin Login" },
    { name: "description", content: "Stp Alumnni admin login page" },
  ];
}

const Login = () => {
  const token = localStorage.getItem("stp_token");
  if (token) return <Navigate to="/admin/dashboard" replace />;

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate, isPending } = useLogin();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    mutate(
      { emailAddress: email, password },
      {
        onSuccess: () => {
          toast.success("Login successful!");
          navigate("/admin/dashboard");
        },
        onError: (err: any) => {
          toast.error(err.message);
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-border/50 bg-card/95 backdrop-blur-sm shadow-2xl">
        <CardHeader className="space-y-4 text-center pb-2">
          {/* Logo */}
          <div className="relative mx-auto w-16 h-16 bg-stp-blue-dark rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
            {/* <Car className="w-8 h-8 text-primary-foreground" /> */}
            <img src="/logo.png"/>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Stp Admin
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Sign in to access the dashboard
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="stp@stp-alumni.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-background/50 border-border/60 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                {/* <button
                  type="button"
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </button> */}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-background/50 border-border/60 focus:border-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold shadow-lg shadow-primary/25 cursor-pointer bg-stp-blue-dark"
              disabled={isPending}
            >
              {isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* <div className="mt-6 pt-6 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              Need help?{" "}
              <a href="#" className="text-primary hover:text-primary/80 transition-colors font-medium">
                Contact support
              </a>
            </p>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
