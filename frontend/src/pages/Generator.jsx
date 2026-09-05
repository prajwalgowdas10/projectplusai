import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Check, Zap } from "lucide-react";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

const DOMAIN_OPTIONS = ["AI/ML", "Web3", "Cloud & DevOps", "IoT", "Mobile", "HealthTech", "FinTech", "Cybersecurity", "AR/VR", "Data Science"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const TIMES = ["3 months", "6 months", "1 year"];
const TEAMS = ["Solo", "2-3 members", "4+ members"];
const BUDGETS = ["Low", "Medium", "High"];

function Chip({ active, onClick, children, testid }) {
  return (
    <button type="button" onClick={onClick} data-testid={testid}
      className={`text-sm px-3.5 py-1.5 rounded-full border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
      {children}
    </button>
  );
}

export default function Generator() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [ideas, setIdeas] = useState(null);
  const [sessionId, setSessionId] = useState("");

  const [interestsText, setInterestsText] = useState("");
  const [domains, setDomains] = useState([]);
  const [problem, setProblem] = useState("");
  const [languagesText, setLanguagesText] = useState("");
  const [frameworksText, setFrameworksText] = useState("");
  const [skill, setSkill] = useState("Intermediate");
  const [time, setTime] = useState("6 months");
  const [team, setTeam] = useState("Solo");
  const [budget, setBudget] = useState("Low");

  const toggleDomain = (d) => setDomains(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const validateStep = (n) => {
    if (n === 1) {
      if (!interestsText.trim() && domains.length === 0) {
        toast.error("Please share at least one interest or pick a domain");
        return false;
      }
    }
    if (n === 2) {
      if (!languagesText.trim() && !frameworksText.trim()) {
        toast.error("Please list at least one language or framework you know");
        return false;
      }
    }
    return true;
  };

  const next = () => { if (validateStep(step)) setStep(s => Math.min(3, s + 1)); };
  const back = () => setStep(s => Math.max(1, s - 1));

  const submit = async () => {
    if (!validateStep(1) || !validateStep(2)) return;
    setLoading(true);
    try {
      const payload = {
        interests: interestsText.split(/[,;\n]/).map(s=>s.trim()).filter(Boolean),
        domains,
        real_world_problem: problem,
        languages: languagesText.split(/[,;\n]/).map(s=>s.trim()).filter(Boolean),
        frameworks: frameworksText.split(/[,;\n]/).map(s=>s.trim()).filter(Boolean),
        skill_level: skill,
        timeframe: time,
        team_size: team,
        budget,
      };
      const { data } = await api.post("/ideas/generate", payload);
      setIdeas(data.ideas);
      setSessionId(data.session_id);
      toast.success(`${data.ideas.length} tailored ideas generated`);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to generate ideas");
    } finally {
      setLoading(false);
    }
  };

  const selectIdea = async (index) => {
    setSelecting(true);
    try {
      const { data } = await api.post("/ideas/select", { session_id: sessionId, idea_index: index });
      toast.success("Full roadmap ready");
      navigate(`/project/${data.id}`);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to build roadmap");
    } finally {
      setSelecting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {!ideas ? (
        <>
          <div className="mb-8">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">AI Idea Generator</div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">Tell us about you</h1>
            <p className="text-muted-foreground mt-2">Answer 3 quick steps. Our AI mentor uses only what you share — no invented skills.</p>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-2 mb-8" data-testid="stepper">
            {[1,2,3].map(n => (
              <div key={n} className="flex-1 flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= n ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {step > n ? <Check className="h-4 w-4"/> : n}
                </div>
                {n < 3 && <div className={`flex-1 h-0.5 ${step > n ? "bg-primary" : "bg-secondary"}`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} transition={{duration:0.25}}
              className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
              {step === 1 && (
                <>
                  <div>
                    <Label>Preferred domains</Label>
                    <div className="mt-2 flex flex-wrap gap-2" data-testid="domain-chips">
                      {DOMAIN_OPTIONS.map(d => (
                        <Chip key={d} testid={`domain-${d.toLowerCase().replace(/[^a-z]/g,'')}`} active={domains.includes(d)} onClick={()=>toggleDomain(d)}>{d}</Chip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="interests">Your interests (comma separated)</Label>
                    <Input id="interests" data-testid="interests-input" value={interestsText} onChange={(e)=>setInterestsText(e.target.value)} placeholder="Computer vision, sustainability, education tech" />
                  </div>
                  <div>
                    <Label htmlFor="problem">A real-world problem you'd love to solve (optional)</Label>
                    <Textarea id="problem" data-testid="problem-input" value={problem} onChange={(e)=>setProblem(e.target.value)} placeholder="Reducing food waste on university campuses..." rows={3} />
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <div>
                    <Label htmlFor="langs">Programming languages you know</Label>
                    <Input id="langs" data-testid="languages-input" value={languagesText} onChange={(e)=>setLanguagesText(e.target.value)} placeholder="Python, JavaScript, Java" />
                  </div>
                  <div>
                    <Label htmlFor="fwks">Frameworks & tools you know</Label>
                    <Input id="fwks" data-testid="frameworks-input" value={frameworksText} onChange={(e)=>setFrameworksText(e.target.value)} placeholder="React, FastAPI, PyTorch, Docker" />
                  </div>
                  <div>
                    <Label>Skill level</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {LEVELS.map(l => <Chip key={l} testid={`skill-${l.toLowerCase()}`} active={skill===l} onClick={()=>setSkill(l)}>{l}</Chip>)}
                    </div>
                  </div>
                </>
              )}
              {step === 3 && (
                <>
                  <div>
                    <Label>Available time</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {TIMES.map(t => <Chip key={t} testid={`time-${t.replace(/\s/g,'')}`} active={time===t} onClick={()=>setTime(t)}>{t}</Chip>)}
                    </div>
                  </div>
                  <div>
                    <Label>Team size</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {TEAMS.map(t => <Chip key={t} testid={`team-${t.replace(/[^a-z0-9]/gi,'')}`} active={team===t} onClick={()=>setTeam(t)}>{t}</Chip>)}
                    </div>
                  </div>
                  <div>
                    <Label>Hardware / cloud budget</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {BUDGETS.map(b => <Chip key={b} testid={`budget-${b.toLowerCase()}`} active={budget===b} onClick={()=>setBudget(b)}>{b}</Chip>)}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={back} disabled={step===1} data-testid="prev-step-btn">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            {step < 3 ? (
              <Button onClick={next} data-testid="next-step-btn">
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={submit} disabled={loading} data-testid="generate-ideas-btn">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Generate ideas
              </Button>
            )}
          </div>
        </>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Step 4 of 4</div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">Your tailored ideas</h1>
              <p className="text-muted-foreground mt-2">Pick one to get a full roadmap.</p>
            </div>
            <Button variant="outline" onClick={() => { setIdeas(null); setSessionId(""); setStep(1); }} data-testid="regenerate-btn">Regenerate</Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ideas.map((idea, i) => (
              <motion.div key={i} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
                className="rounded-2xl border border-border bg-card p-6 flex flex-col" data-testid={`idea-card-${i}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Idea {i+1}</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full border border-border">{idea.difficulty}</span>
                </div>
                <h3 className="mt-3 font-bold text-lg tracking-tight">{idea.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 flex-1">{idea.summary}</p>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Why it fits</div>
                  <p className="text-sm">{idea.why_it_fits}</p>
                </div>
                <Button onClick={() => selectIdea(i)} disabled={selecting} className="mt-5 w-full" data-testid={`select-idea-${i}`}>
                  {selecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Zap className="h-4 w-4 mr-2" />}
                  Select & Generate Roadmap
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
