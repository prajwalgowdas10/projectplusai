import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle2, Circle, Clock, ArrowLeft, Loader2, Download, Rocket, Layers, Wrench, Route, Lightbulb, Plus, Github } from "lucide-react";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";

const STATUS = ["not_started", "in_progress", "completed"];
const STATUS_LABEL = { not_started: "Not started", in_progress: "In progress", completed: "Completed" };

function nextStatus(s) { return STATUS[(STATUS.indexOf(s) + 1) % STATUS.length]; }

export default function Project() {
  const { id } = useParams();
  const [proj, setProj] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState("");
  const [report, setReport] = useState(null);
  const [genReport, setGenReport] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [ghUrl, setGhUrl] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProj(data);
    } catch { toast.error("Failed to load project"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin inline h-6 w-6" /></div>;
  if (!proj) return <div className="p-12 text-center text-muted-foreground">Project not found.</div>;

  const statusOf = (pi, ti) => proj.milestones.find(m => m.phase_index === pi && m.task_index === ti)?.status || "not_started";
  const total = proj.milestones.length || 1;
  const done = proj.milestones.filter(m => m.status === "completed").length;
  const progress = Math.round(done / total * 100);

  const toggle = async (pi, ti) => {
    const cur = statusOf(pi, ti);
    const nxt = nextStatus(cur);
    try {
      const { data } = await api.post("/projects/milestone", { project_id: id, phase_index: pi, task_index: ti, status: nxt });
      setProj(p => ({ ...p, milestones: data.milestones }));
    } catch { toast.error("Failed to update milestone"); }
  };

  const logActivity = async () => {
    if (!activity.trim()) return;
    try {
      const { data } = await api.post("/projects/activity", { project_id: id, note: activity });
      setProj(p => ({ ...p, activities: [...(p.activities||[]), data] }));
      setActivity("");
      toast.success("Activity logged");
    } catch { toast.error("Failed to log activity"); }
  };

  const buildReport = async () => {
    setGenReport(true);
    try {
      const { data } = await api.get(`/projects/${id}/report`);
      setReport(data);
    } catch { toast.error("Failed to generate report"); }
    finally { setGenReport(false); }
  };

  const downloadReport = () => {
    if (!report) return;
    const blob = new Blob([report.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `progress-report-${id.slice(0,8)}.md`; a.click();
    URL.revokeObjectURL(url);
  };

  const publish = async () => {
    try {
      await api.post("/projects/publish", { project_id: id, github_url: ghUrl });
      setProj(p => ({ ...p, published: true, github_url: ghUrl }));
      setPublishOpen(false);
      toast.success("Published to community feed");
    } catch { toast.error("Failed to publish"); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link to="/home" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" data-testid="back-home-link">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      {/* Hero */}
      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
        className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Selected Idea</span>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">{proj.idea.title}</h1>
            <p className="mt-3 text-muted-foreground max-w-3xl">{proj.idea.summary}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-mono px-2 py-1 rounded-full border border-border">{proj.idea.difficulty}</span>
            {proj.published ? (
              <span className="text-[11px] font-mono px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">Published</span>
            ) : (
              <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" data-testid="publish-btn"><Rocket className="h-4 w-4 mr-1" /> Publish</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Publish to community feed</DialogTitle></DialogHeader>
                  <p className="text-sm text-muted-foreground">Share your completed project so other students can discover it.</p>
                  <Input value={ghUrl} onChange={(e)=>setGhUrl(e.target.value)} placeholder="GitHub URL (optional)" data-testid="github-url-input" />
                  <Button onClick={publish} data-testid="confirm-publish-btn">Publish now</Button>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Overall progress</span>
            <span className="font-mono">{progress}% · {done}/{total}</span>
          </div>
          <Progress value={progress} className="h-2" data-testid="project-progress" />
        </div>
      </motion.div>

      <Tabs defaultValue="roadmap" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl" data-testid="project-tabs">
          <TabsTrigger value="roadmap" data-testid="tab-roadmap"><Route className="h-4 w-4 mr-1"/> Roadmap</TabsTrigger>
          <TabsTrigger value="features" data-testid="tab-features"><Layers className="h-4 w-4 mr-1"/> Features</TabsTrigger>
          <TabsTrigger value="tech" data-testid="tab-tech"><Wrench className="h-4 w-4 mr-1"/> Tech Stack</TabsTrigger>
          <TabsTrigger value="report" data-testid="tab-report"><Lightbulb className="h-4 w-4 mr-1"/> Report</TabsTrigger>
        </TabsList>

        <TabsContent value="roadmap" className="mt-6 space-y-6">
          {proj.roadmap.map((phase, pi) => (
            <div key={pi} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg tracking-tight">{phase.phase || `Phase ${pi+1}`}</h3>
                {phase.duration_weeks && <span className="text-xs text-muted-foreground font-mono">~{phase.duration_weeks} weeks</span>}
              </div>
              <ul className="space-y-2">
                {(phase.tasks || []).map((task, ti) => {
                  const s = statusOf(pi, ti);
                  const Icon = s === "completed" ? CheckCircle2 : s === "in_progress" ? Clock : Circle;
                  return (
                    <li key={ti}>
                      <button onClick={() => toggle(pi, ti)} data-testid={`milestone-${pi}-${ti}`}
                        className={`w-full flex items-start gap-3 text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-secondary/40 transition-colors ${s === "completed" ? "opacity-70" : ""}`}>
                        <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${s === "completed" ? "text-emerald-500" : s === "in_progress" ? "text-amber-500" : "text-muted-foreground"}`} />
                        <div className="min-w-0 flex-1">
                          <div className={`text-sm ${s === "completed" ? "line-through" : ""}`}>{task}</div>
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{STATUS_LABEL[s]}</div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Improvements */}
          {proj.improvements?.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-bold text-lg tracking-tight mb-3 flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-500" /> Differentiation ideas</h3>
              <ul className="space-y-2">
                {proj.improvements.map((imp, i) => (
                  <li key={i} className="text-sm p-3 rounded-lg bg-secondary/50 border border-border">{imp}</li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>

        <TabsContent value="features" className="mt-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-bold text-lg tracking-tight mb-4">Core features</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {proj.features.map((f, i) => (
                <div key={i} className="p-4 rounded-xl border border-border">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Feature {i+1}</div>
                  <p className="text-sm mt-1">{f}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tech" className="mt-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-bold text-lg tracking-tight mb-4">Recommended tech stack</h3>
            <ul className="space-y-2">
              {proj.tech_stack.map((t, i) => (
                <li key={i} className="p-3 rounded-lg bg-secondary/40 border border-border font-mono text-sm">{t}</li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="report" className="mt-6 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-bold text-lg tracking-tight mb-3">Log activity</h3>
            <div className="flex gap-2">
              <Input value={activity} onChange={(e)=>setActivity(e.target.value)} placeholder="e.g., Finished API auth module" data-testid="activity-input" />
              <Button onClick={logActivity} data-testid="log-activity-btn"><Plus className="h-4 w-4 mr-1"/> Log</Button>
            </div>
            {(proj.activities || []).slice().reverse().slice(0,6).map(a => (
              <div key={a.id} className="mt-3 text-sm border-l-2 border-primary/60 pl-3">
                <div>{a.note}</div>
                <div className="text-xs text-muted-foreground">{new Date(a.at).toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg tracking-tight">Automated progress report</h3>
              <div className="flex gap-2">
                <Button onClick={buildReport} disabled={genReport} data-testid="generate-report-btn">
                  {genReport ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : null}
                  Generate
                </Button>
                {report && (
                  <Button variant="outline" onClick={downloadReport} data-testid="download-report-btn">
                    <Download className="h-4 w-4 mr-1" /> Download .md
                  </Button>
                )}
              </div>
            </div>
            {report ? (
              <Textarea readOnly value={report.markdown} className="mt-4 font-mono text-xs min-h-[240px]" data-testid="report-textarea" />
            ) : (
              <p className="text-sm text-muted-foreground mt-3">Generate a faculty-ready markdown snapshot of your progress.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
