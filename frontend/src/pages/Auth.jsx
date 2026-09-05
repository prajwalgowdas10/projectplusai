import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", major: "", graduation_year: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Enter a valid email";
    if (form.password.length < 6) e.password = "At least 6 characters";
    if (mode === "signup" && !form.name.trim()) e.name = "Name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === "login") await login(form.email, form.password);
      else await signup(form);
      toast.success(mode === "login" ? "Welcome back!" : "Account created");
      navigate("/home");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-blue-600 via-violet-600 to-emerald-600 p-12 items-center">
        <div className="absolute inset-0 grain opacity-30" />
        <div className="relative z-10 text-white max-w-md">
          <div className="inline-flex items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-xl">ProjectPulse.AI</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight">
            Your capstone, engineered by AI.
          </h1>
          <p className="mt-5 text-white/85 leading-relaxed">
            Get 3 tailored final-year project ideas, a phased roadmap matched to your skills, milestone tracking, and a project mentor chatbot — all in one place.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {["Skill-matched idea generation","Phased development roadmap","Milestone progress tracking","Auto-generated progress reports"].map((t,i)=>(
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-white" />
                <span className="text-white/90">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center px-6 py-10">
        <motion.div initial={{opacity:0, y:12}} animate={{opacity:1, y:0}} transition={{duration:0.5}} className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight">{mode === "login" ? "Sign in" : "Create your account"}</h2>
            <p className="text-sm text-muted-foreground mt-2">
              {mode === "login" ? "Continue building your final-year project." : "Start generating your capstone idea in minutes."}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4" data-testid="auth-form">
            {mode === "signup" && (
              <>
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" data-testid="signup-name-input" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="Alex Johnson" />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="major">Major</Label>
                    <Input id="major" data-testid="signup-major-input" value={form.major} onChange={(e)=>setForm({...form,major:e.target.value})} placeholder="Computer Science" />
                  </div>
                  <div>
                    <Label htmlFor="year">Graduation year</Label>
                    <Input id="year" data-testid="signup-year-input" value={form.graduation_year} onChange={(e)=>setForm({...form,graduation_year:e.target.value})} placeholder="2026" />
                  </div>
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" data-testid="auth-email-input" type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} placeholder="you@university.edu" />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" data-testid="auth-password-input" type="password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} placeholder="At least 6 characters" />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11" data-testid="auth-submit-btn">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <div className="mt-6 text-sm text-muted-foreground text-center">
            {mode === "login" ? (
              <>Don't have an account?{" "}
                <button data-testid="switch-to-signup" onClick={() => setMode("signup")} className="text-primary font-semibold hover:underline">Sign up</button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button data-testid="switch-to-login" onClick={() => setMode("login")} className="text-primary font-semibold hover:underline">Sign in</button>
              </>
            )}
          </div>
          <div className="mt-4 text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Back to welcome</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
