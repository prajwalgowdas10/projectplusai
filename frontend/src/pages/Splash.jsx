import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Splash() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => {
      navigate(user ? "/home" : "/auth");
    }, 5000);
    return () => clearTimeout(t);
  }, [user, loading, navigate]);

  const skip = () => navigate(user ? "/home" : "/auth");

  return (
    <div className="relative min-h-screen overflow-hidden bg-background grain">
      {/* Animated blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute top-40 right-0 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-500 via-violet-500 to-emerald-500 flex items-center justify-center shadow-2xl shadow-blue-500/40 mb-8"
        >
          <Sparkles className="h-12 w-12 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-3xl"
        >
          Welcome to <span className="text-gradient">ProjectPulse AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-5 max-w-xl text-base sm:text-lg text-muted-foreground"
        >
          Transforming tech interests into impactful capstones — AI-crafted final-year project ideas with tailored roadmaps.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-10 flex items-center gap-4"
        >
          <button
            onClick={skip}
            data-testid="splash-skip-btn"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Skip to App
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </motion.div>

        {/* Progress bar */}
        <div className="mt-10 w-56 h-1 rounded-full bg-secondary overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 5, ease: "linear" }}
            className="h-full bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500"
            data-testid="splash-progress"
          />
        </div>
        <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">Initializing your workspace…</p>
      </div>
    </div>
  );
}
