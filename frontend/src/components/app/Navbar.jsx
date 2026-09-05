import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Moon, Sun, Menu, X, Sparkles, LogOut } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";

const links = [
  { to: "/home", label: "Dashboard" },
  { to: "/generate", label: "Idea Generator" },
  { to: "/community", label: "Community" },
];

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const doLogout = () => { logout(); navigate("/auth"); };

  return (
    <header className="sticky top-0 z-40 glass grain">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link to={user ? "/home" : "/"} className="flex items-center gap-2" data-testid="brand-link">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <div className="font-extrabold tracking-tight text-lg">ProjectPulse<span className="text-primary">.AI</span></div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Final-Year Ideator</div>
          </div>
        </Link>

        {user && (
          <nav className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                data-testid={`nav-${l.label.toLowerCase().replace(/\s/g,'-')}`}
                className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"}`}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <button
            data-testid="theme-toggle-button"
            aria-label="Toggle theme"
            onClick={toggle}
            className="h-9 w-9 rounded-md border border-border hover:bg-secondary flex items-center justify-center transition-colors"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/60 border border-border">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white text-xs flex items-center justify-center font-bold">
                  {user.name?.[0]?.toUpperCase() || "S"}
                </div>
                <span className="text-sm font-medium" data-testid="user-name-badge">{user.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={doLogout} data-testid="logout-btn" className="hidden sm:inline-flex">
                <LogOut className="h-4 w-4 mr-1" /> Logout
              </Button>
              <button className="md:hidden h-9 w-9 rounded-md border border-border flex items-center justify-center" onClick={() => setOpen(o => !o)} data-testid="mobile-menu-btn">
                {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </>
          ) : (
            <Link to="/auth" data-testid="nav-login-btn">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>

      {user && open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur">
          <nav className="px-4 py-3 space-y-1">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}
                className={({isActive}) => `block px-3 py-2 rounded-md text-sm ${isActive ? "bg-secondary" : "hover:bg-secondary/60"}`}>
                {l.label}
              </NavLink>
            ))}
            <button onClick={doLogout} className="w-full text-left px-3 py-2 rounded-md text-sm text-destructive hover:bg-secondary/60" data-testid="mobile-logout-btn">Logout</button>
          </nav>
        </div>
      )}
    </header>
  );
}
