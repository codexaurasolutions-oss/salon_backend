import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Lock, User, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";

export default function SimpleAdminAccess() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || "");
  const [password, setPassword] = useState(searchParams.get('password') || "");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading, login, signOut } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      const userType = user.user_type;
      const salonRole = user.salon_role;

      if (userType === 'admin' || userType === 'super_admin') {
        toast({ title: "Welcome Super Admin!", description: "Redirecting to admin dashboard..." });
        navigate("/super-admin/dashboard");
      } else if (userType === 'salon_owner' || (salonRole && ['owner', 'manager'].includes(salonRole))) {
        toast({ title: "Welcome!", description: "Redirecting to salon dashboard..." });
        navigate("/salon/dashboard");
      } else if (salonRole === 'staff') {
        toast({ title: "Welcome!", description: "Redirecting to staff dashboard..." });
        navigate("/staff/dashboard");
      } else if (userType === 'customer') {
        // Customer shouldn't be here - sign them out
        toast({
          title: "Access Denied",
          description: "Only administrators and salon partners are allowed here.",
          variant: "destructive",
        });
        signOut();
      }
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting admin/partner login...');
      // login() calls fetchUser() internally which updates user state
      // The useEffect above will watch for user state and redirect automatically
      await login(email.trim(), password);
      // Do NOT navigate here — let the useEffect handle redirect after user state is set
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin & Partner Access</CardTitle>
          <p className="text-muted-foreground">
            Enter your credentials to access your management dashboard
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This portal is restricted to platform administrators and salon partners.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@salon.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing In..." : "Access Portal"}
            </Button>
          </form>



          <div className="text-center">
            <Button variant="link" onClick={() => navigate("/")} className="text-sm">
              ← Back to Website
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
