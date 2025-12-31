import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Role } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, ShieldCheck, ArrowLeft } from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("ADMIN");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Please use a valid work email");
      return;
    }
    login(email, role);
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-3xl border border-primary/30 bg-card/80 backdrop-blur shadow-elevated p-8 space-y-6">
        {/* Back to Home Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Admin Access</p>
            <h1 className="text-2xl font-bold text-card-foreground">Sign in to dashboard</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-card-foreground" htmlFor="email">
              Work email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@taichinerves.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-card-foreground" htmlFor="role">
              Select role
            </label>
            <Select value={role} onValueChange={(val) => setRole(val as Role)}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="EDITOR">Editor</SelectItem>
                <SelectItem value="REVIEWER">Reviewer</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Simulated roles for UI access.</p>
          </div>

          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full gap-2">
            <Lock className="h-4 w-4" />
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;



