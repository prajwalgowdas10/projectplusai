import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Activity, Target, GitBranch, TrendingUp, Rocket, Users } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";

function Stat({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <div className="mt-4 text-3xl font-extrabold tracking-tight">{value}</div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ projects: 0, tasks_total: 0, tasks_completed: 0, progress: 0, recent_activities: [] });
  const [projects, setProjects] = useState([]);
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [s, p, f] = await Promise.all([
          api.get("/stats"),
          api.get("/projects"),
          api.get("/community/feed"),
        ]);
        setStats(s.data);
        setProjects(p.data);
        setFeed(f.data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10" data-testid="home-page">
      {/* Hero / Profile */}
      <section className="grid md:grid-cols-12 gap-6">
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.5}}
          className="md:col-span-8 rounded-3xl border border-border bg-gradient-to-br from-blue-600 via-violet-600 to-emerald-600 text-white p-6 sm:p-8 relative overflow-hidden grain">
          <div className="absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs uppercase tracking-widest font-medium">
              <Sparkles className="h-3 w-3" /> Student Dashboard
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Hi {user?.name?.split(" ")[0]}, ready to build something remarkable?
            </h1>
            <p className="mt-3 text-white/85 max-w-xl">
              {user?.major ? `${user.major} · ` : ""}{user?.graduation_year || "Class of TBD"}. Generate a tailored capstone idea, track your roadmap, and get mentor guidance.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/generate" data-testid="cta-generate-btn">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-white/90">
                  Generate New Project Idea <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              {projects.length > 0 && (
                <Link to={`/project/${projects[0].id}`} data-testid="cta-continue-btn">
                  <Button size="lg" variant="outline" className="border-white/40 text-white bg-transparent hover:bg-white/10">
                    Continue Current Roadmap
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-4">
          <Stat icon={Rocket} label="Projects" value={stats.projects} accent="bg-blue-500" />
          <Stat icon={Target} label="Tasks Done" value={`${stats.tasks_completed}/${stats.tasks_total}`} accent="bg-emerald-500" />
        </div>
      </section>

      {/* Overall progress */}
      {stats.tasks_total > 0 && (
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h2 className="font-bold text-lg">Overall roadmap progress</h2>
            </div>
            <span className="text-sm font-mono text-muted-foreground">{stats.progress}%</span>
          </div>
          <Progress value={stats.progress} className="h-2" data-testid="overall-progress" />
        </section>
      )}

      {/* My projects + activity */}
      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg tracking-tight">My Projects</h2>
            <Link to="/generate" className="text-sm text-primary font-medium hover:underline">+ New</Link>
          </div>
          {projects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              desc="Kick off by generating your first AI-tailored final-year project idea."
              cta={<Link to="/generate"><Button data-testid="empty-generate-btn"><Sparkles className="h-4 w-4 mr-2" /> Generate ideas</Button></Link>}
            />
          ) : (
            <div className="space-y-3">
              {projects.map(p => (
                <Link key={p.id} to={`/project/${p.id}`} data-testid={`project-card-${p.id}`}
                  className="block rounded-xl border border-border p-4 hover:border-primary/60 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{p.idea?.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{p.idea?.summary}</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border border-border shrink-0">{p.idea?.difficulty}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(p.tech_stack || []).slice(0,4).map((t,i)=>(
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-mono">{String(t).split("(")[0].trim()}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="font-bold text-lg tracking-tight">Daily Activity</h2>
          </div>
          {stats.recent_activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">Log your first weekly note from a project to see it here.</p>
          ) : (
            <ul className="space-y-3">
              {stats.recent_activities.map(a => (
                <li key={a.id} className="text-sm border-l-2 border-primary/60 pl-3">
                  <div className="font-medium">{a.note}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{a.project_title} · {new Date(a.at).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Community feed */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="font-bold text-lg tracking-tight">Projects by other students</h2>
          </div>
        </div>
        {feed.length === 0 ? (
          <EmptyState
            title="The community feed is quiet — for now."
            desc="Be one of the first to publish your final-year project once you're done. Your work could inspire the next student."
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {feed.map(f => (
              <div key={f.id} className="rounded-xl border border-border p-4">
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{f.summary}</p>
                <div className="text-xs text-muted-foreground mt-3">{f.author} · {f.major}</div>
                {f.github_url && (
                  <a href={f.github_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <GitBranch className="h-3 w-3" /> View repo
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyState({ title, desc, cta }) {
  return (
    <div className="border border-dashed border-border rounded-xl p-8 text-center">
      <div className="mx-auto h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mb-3">
        <Sparkles className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">{desc}</p>
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}
