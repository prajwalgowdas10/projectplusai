import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { GitBranch, Users, Sparkles } from "lucide-react";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";

export default function Community() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get("/community/feed").then(r => setFeed(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Community</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 flex items-center gap-3">
          <Users className="h-7 w-7 text-primary" /> Projects by other students
        </h1>
        <p className="text-muted-foreground mt-2">Real projects published by students on ProjectPulse AI.</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading…</div>
      ) : feed.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-12 text-center">
          <Sparkles className="h-6 w-6 text-primary mx-auto mb-3" />
          <h3 className="font-semibold text-lg">Be the first to publish</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">No one has published yet. Finish your capstone and share it here to inspire the next student.</p>
          <Link to="/generate"><Button className="mt-5">Generate an idea</Button></Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {feed.map(p => (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-bold text-lg tracking-tight">{p.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-4">{p.summary}</p>
              <div className="text-xs text-muted-foreground mt-4">{p.author} · {p.major}</div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(p.tech_stack || []).map((t,i)=>(<span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-secondary font-mono">{String(t).split("(")[0].trim()}</span>))}
              </div>
              {p.github_url && (
                <a href={p.github_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <GitBranch className="h-3 w-3" /> Repo
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
