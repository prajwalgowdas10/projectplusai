import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const PRESETS = [
  "How do I write a project proposal?",
  "Explain my project architecture",
  "Suggest datasets for my topic",
];

export default function Chatbot({ projectId = "" }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, open]);

  if (!user) return null;

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput("");
    setMsgs(m => [...m, { role: "user", text: q }]);
    setLoading(true);
    try {
      const { data } = await api.post("/chat", { message: q, project_id: projectId });
      setMsgs(m => [...m, { role: "ai", text: data.reply }]);
    } catch (e) {
      setMsgs(m => [...m, { role: "ai", text: "Sorry, I hit an issue. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        data-testid="chatbot-launcher"
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 via-violet-500 to-emerald-500 shadow-2xl shadow-blue-500/30 flex items-center justify-center text-white hover:scale-105 transition-transform"
        aria-label="Open AI assistant"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[92vw] sm:w-[380px] max-h-[70vh] rounded-2xl glass shadow-2xl flex flex-col overflow-hidden" data-testid="chatbot-panel">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold">Pulse Assistant</div>
              <div className="text-[11px] text-muted-foreground">Claude Sonnet 5 · Project mentor</div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 no-scrollbar">
            {msgs.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Hi {user.name?.split(" ")[0]}! I can help with your final-year project. Try:</p>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((p, i) => (
                    <button key={i} onClick={() => send(p)} data-testid={`chat-preset-${i}`}
                      className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-secondary transition-colors">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary text-foreground rounded-bl-sm"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] px-3 py-2 rounded-2xl bg-secondary text-sm caret-dot">Thinking</div>
              </div>
            )}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="border-t border-border p-2 flex gap-2">
            <input
              data-testid="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your project..."
              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button data-testid="chat-send-btn" disabled={!input.trim() || loading}
              className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
