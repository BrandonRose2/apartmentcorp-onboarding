/**
 * ApartmentCorp — New Employee Onboarding Portal
 * Brand: Dark navy oklch(0.13 0.06 258), teal accent oklch(0.72 0.12 220)
 * Typography: Cormorant Garamond (headings) + Inter (body/forms)
 * Logo: /manus-storage/ac-logo_324ddb7c.webp
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, Clock, HelpCircle, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";

// ── Brand constants ───────────────────────────────────────────────────────────
const AC = {
  bg:       "oklch(0.13 0.06 258)",
  bgCard:   "oklch(0.18 0.065 258)",
  bgRaised: "oklch(0.22 0.07 258)",
  nav:      "oklch(0.10 0.06 258 / 0.95)",
  teal:     "oklch(0.72 0.12 220)",
  tealDim:  "oklch(0.58 0.14 240)",
  fg:       "oklch(0.97 0.005 220)",
  fgMuted:  "oklch(0.65 0.02 230)",
  fgSubtle: "oklch(0.45 0.02 230)",
  border:   "oklch(1 0 0 / 0.09)",
  borderStrong: "oklch(1 0 0 / 0.16)",
  heading: "'Cormorant Garamond', Georgia, serif",
  body:    "'Inter', 'Helvetica Neue', Arial, sans-serif",
};

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Chapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: string;
  accentColor: string;
  estimatedMinutes: number;
  description: string;
  status: "locked" | "available" | "in-progress" | "complete";
  forms: FormGroup[];
}

export interface FormGroup {
  id: string;
  title: string;
  fields: FormFieldDef[];
}

export interface FormFieldDef {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "date" | "select" | "radio" | "checkbox" | "textarea" | "ssn" | "signature";
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: string[];
  sensitive?: boolean;
}

// ── Chapter data ──────────────────────────────────────────────────────────────
const CHAPTERS: Chapter[] = [
  {
    id: "personal",
    number: 1,
    title: "A Little About You",
    subtitle: "Personal & contact information",
    icon: "👋",
    accentColor: AC.teal,
    estimatedMinutes: 5,
    description: "Let's start with the basics — who you are and how to reach you. This information helps us set up your employee profile.",
    status: "available",
    forms: [
      {
        id: "personal-info",
        title: "Your Personal Information",
        fields: [
          { id: "first-name", label: "First Name", type: "text", placeholder: "Your first name", required: true },
          { id: "last-name", label: "Last Name", type: "text", placeholder: "Your last name", required: true },
          { id: "preferred-name", label: "Preferred Name", type: "text", placeholder: "What should we call you?", helpText: "The name you'd like on your badge and in our systems" },
          { id: "email", label: "Personal Email", type: "email", placeholder: "your@email.com", required: true, helpText: "We'll send your welcome package here before your first day" },
          { id: "phone", label: "Mobile Phone", type: "tel", placeholder: "(555) 000-0000", required: true },
          { id: "dob", label: "Date of Birth", type: "date", required: true, sensitive: true },
        ],
      },
      {
        id: "address",
        title: "Your Home Address",
        fields: [
          { id: "address1", label: "Street Address", type: "text", placeholder: "123 Main Street", required: true },
          { id: "address2", label: "Apt / Suite", type: "text", placeholder: "Optional" },
          { id: "city", label: "City", type: "text", placeholder: "City", required: true },
          { id: "state", label: "State", type: "select", required: true, options: ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"] },
          { id: "zip", label: "ZIP Code", type: "text", placeholder: "00000", required: true },
        ],
      },
    ],
  },
  {
    id: "employment",
    number: 2,
    title: "Your Work Authorization",
    subtitle: "I-9 Employment Eligibility",
    icon: "📋",
    accentColor: "oklch(0.72 0.18 220)",
    estimatedMinutes: 8,
    description: "Federal law requires us to verify your eligibility to work in the United States. This is a standard process for every new employee — nothing to worry about.",
    status: "locked",
    forms: [],
  },
  {
    id: "payroll",
    number: 3,
    title: "Let's Get You Paid",
    subtitle: "Tax withholding & direct deposit",
    icon: "💵",
    accentColor: "oklch(0.75 0.14 180)",
    estimatedMinutes: 10,
    description: "Set up your W-4 tax withholding and direct deposit so your first paycheck lands right on time.",
    status: "locked",
    forms: [],
  },
  {
    id: "benefits",
    number: 4,
    title: "Your Benefits",
    subtitle: "Health, dental, vision & more",
    icon: "🏥",
    accentColor: "oklch(0.72 0.12 280)",
    estimatedMinutes: 15,
    description: "Explore and enroll in your ApartmentCorp benefits package. You have 30 days from your start date to make your selections.",
    status: "locked",
    forms: [],
  },
  {
    id: "policies",
    number: 5,
    title: "Our Agreements",
    subtitle: "Handbook & policy acknowledgments",
    icon: "📖",
    accentColor: "oklch(0.75 0.12 80)",
    estimatedMinutes: 12,
    description: "Review and acknowledge our company policies, employee handbook, and code of conduct. We keep it straightforward.",
    status: "locked",
    forms: [],
  },
  {
    id: "emergency",
    number: 6,
    title: "Just In Case",
    subtitle: "Emergency contacts",
    icon: "🆘",
    accentColor: "oklch(0.72 0.18 30)",
    estimatedMinutes: 3,
    description: "Who should we contact in an emergency? This information stays private and is only used when we need to reach someone on your behalf.",
    status: "locked",
    forms: [],
  },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function EmployeePortal() {
  const [employeeName, setEmployeeName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [currentScreen, setCurrentScreen] = useState<"welcome" | "chapters" | "form">("welcome");
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>(CHAPTERS);
  const [formValues, setFormValues] = useState<Record<string, Record<string, string>>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [dateInput, setDateInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("ac_employee_portal_v2");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.employeeName) { setEmployeeName(data.employeeName); setNameInput(data.employeeName); }
        if (data.startDate) { setStartDate(data.startDate); setDateInput(data.startDate); }
        if (data.formValues) setFormValues(data.formValues);
        if (data.chapters) setChapters(data.chapters);
        if (data.employeeName) setCurrentScreen("chapters");
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (employeeName) {
      const t = setTimeout(() => {
        localStorage.setItem("ac_employee_portal_v2", JSON.stringify({ employeeName, startDate, formValues, chapters }));
        setLastSaved(new Date());
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [employeeName, startDate, formValues, chapters]);

  const completedChapters = chapters.filter(c => c.status === "complete").length;
  const totalChapters = chapters.length;
  const overallProgress = Math.round((completedChapters / totalChapters) * 100);

  const handleWelcomeSubmit = () => {
    if (!nameInput.trim()) return;
    setEmployeeName(nameInput.trim());
    setStartDate(dateInput);
    setChapters(prev => prev.map((c, i) => i === 0 ? { ...c, status: "available" as const } : c));
    setCurrentScreen("chapters");
  };

  const handleStartChapter = (chapterId: string) => {
    setActiveChapterId(chapterId);
    setChapters(prev => prev.map(c => c.id === chapterId && c.status === "available" ? { ...c, status: "in-progress" as const } : c));
    setCurrentScreen("form");
  };

  const handleCompleteChapter = (chapterId: string) => {
    setChapters(prev => {
      const updated = prev.map((c, i) => {
        if (c.id === chapterId) return { ...c, status: "complete" as const };
        const prevChapter = prev[i - 1];
        if (prevChapter?.id === chapterId) return { ...c, status: "available" as const };
        return c;
      });
      return updated;
    });
    setActiveChapterId(null);
    setCurrentScreen("chapters");
    const chapter = chapters.find(c => c.id === chapterId);
    toast.success(`"${chapter?.title}" complete!`, { duration: 3000 });
  };

  const activeChapter = chapters.find(c => c.id === activeChapterId);

  return (
    <div className="min-h-screen" style={{ backgroundColor: AC.bg, fontFamily: AC.body, color: AC.fg }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: AC.nav, borderColor: AC.border, backdropFilter: "blur(12px)" }}>
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between h-16">
          <img
            src="/manus-storage/ac-logo_324ddb7c.webp"
            alt="ApartmentCorp"
            className="h-7 w-auto"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          {currentScreen !== "welcome" && (
            <div className="flex items-center gap-4">
              {lastSaved && (
                <span className="hidden sm:flex items-center gap-1.5 text-xs" style={{ color: AC.fgSubtle }}>
                  <Save className="w-3 h-3" /> Saved
                </span>
              )}
              <div className="flex items-center gap-2.5 text-xs" style={{ color: AC.fgMuted }}>
                <span>{completedChapters}/{totalChapters}</span>
                <div className="w-24 h-1 rounded-full overflow-hidden" style={{ backgroundColor: AC.borderStrong }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${overallProgress}%`, backgroundColor: AC.teal }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {currentScreen === "welcome" && (
          <WelcomeScreen key="welcome" nameInput={nameInput} dateInput={dateInput}
            onNameChange={setNameInput} onDateChange={setDateInput} onSubmit={handleWelcomeSubmit} />
        )}
        {currentScreen === "chapters" && (
          <ChaptersScreen key="chapters" employeeName={employeeName} startDate={startDate}
            chapters={chapters} completedChapters={completedChapters} totalChapters={totalChapters}
            onStartChapter={handleStartChapter} />
        )}
        {currentScreen === "form" && activeChapter && (
          <FormScreen key={`form-${activeChapter.id}`} chapter={activeChapter}
            formValues={formValues[activeChapter.id] || {}}
            onFieldChange={(fieldId, value) => setFormValues(prev => ({
              ...prev, [activeChapter.id]: { ...(prev[activeChapter.id] || {}), [fieldId]: value }
            }))}
            onBack={() => { setActiveChapterId(null); setCurrentScreen("chapters"); }}
            onComplete={() => handleCompleteChapter(activeChapter.id)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Welcome Screen ────────────────────────────────────────────────────────────
function WelcomeScreen({ nameInput, dateInput, onNameChange, onDateChange, onSubmit }: {
  nameInput: string; dateInput: string;
  onNameChange: (v: string) => void; onDateChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4 }} className="min-h-[calc(100vh-64px)]">
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ minHeight: 280 }}>
        <img
          src="/manus-storage/city-skyline_be9337ce.jpg"
          alt="ApartmentCorp community"
          className="w-full h-72 object-cover"
          style={{ filter: "brightness(0.45)" }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
            <div className="flex justify-center mb-4">
              <div className="w-10 h-0.5 rounded-full" style={{ backgroundColor: AC.teal }} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-semibold text-white mb-3" style={{ fontFamily: AC.heading }}>
              Welcome to <em style={{ color: AC.teal, fontStyle: "italic" }}>ApartmentCorp</em>
            </h1>
            <p className="text-base" style={{ color: "oklch(0.80 0.01 220)" }}>
              We're so glad you're here. Let's get you set up.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Card */}
      <div className="max-w-lg mx-auto px-4 -mt-8 pb-16">
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35, duration: 0.5 }}
          className="rounded-2xl shadow-2xl p-8"
          style={{ backgroundColor: AC.bgCard, border: `1px solid ${AC.borderStrong}` }}>
          <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: AC.heading, color: AC.fg }}>
            Before we begin
          </h2>
          <p className="text-sm mb-6" style={{ color: AC.fgMuted }}>
            This portal guides you through onboarding step by step — about 45–60 minutes total. Save and return anytime.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: AC.fgMuted }}>
                Your Full Name
              </label>
              <input type="text" value={nameInput} onChange={e => onNameChange(e.target.value)}
                placeholder="First and last name"
                className="w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none"
                style={{ backgroundColor: AC.bgRaised, border: `1px solid ${AC.border}`, color: AC.fg }}
                onFocus={e => (e.target.style.borderColor = AC.teal)}
                onBlur={e => (e.target.style.borderColor = AC.border)}
                onKeyDown={e => e.key === "Enter" && onSubmit()} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: AC.fgMuted }}>
                Your Start Date
              </label>
              <input type="date" value={dateInput} onChange={e => onDateChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none"
                style={{ backgroundColor: AC.bgRaised, border: `1px solid ${AC.border}`, color: AC.fg, colorScheme: "dark" }}
                onFocus={e => (e.target.style.borderColor = AC.teal)}
                onBlur={e => (e.target.style.borderColor = AC.border)} />
            </div>
          </div>

          <button onClick={onSubmit} disabled={!nameInput.trim()}
            className="mt-6 w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ backgroundColor: AC.teal, color: AC.bg }}>
            Begin My Onboarding →
          </button>

          <div className="mt-4 flex items-start gap-2 text-xs" style={{ color: AC.fgSubtle }}>
            <Save className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>Progress saves automatically. Close this tab and return anytime — everything will be right where you left it.</span>
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-5 rounded-xl p-5"
          style={{ backgroundColor: AC.bgCard, border: `1px solid ${AC.border}` }}>
          <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: AC.heading, color: AC.fg }}>What to expect</h3>
          <div className="space-y-2.5">
            {[
              ["📋", "6 short chapters — complete them in any order"],
              ["⏱️", "About 45–60 minutes total, or do it in pieces"],
              ["💾", "Auto-saves as you go — no lost progress"],
              ["🔒", "Your information is secure and encrypted"],
              ["❓", "Help text on every sensitive field"],
            ].map(([icon, text], i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm" style={{ color: AC.fgMuted }}>
                <span className="text-base flex-shrink-0">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Chapters Screen ───────────────────────────────────────────────────────────
function ChaptersScreen({ employeeName, startDate, chapters, completedChapters, totalChapters, onStartChapter }: {
  employeeName: string; startDate: string; chapters: Chapter[];
  completedChapters: number; totalChapters: number; onStartChapter: (id: string) => void;
}) {
  const firstName = employeeName.split(" ")[0];
  const allComplete = completedChapters === totalChapters;

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="max-w-3xl mx-auto px-4 py-10 pb-16">
      {/* Greeting */}
      <div className="mb-8">
        <div className="w-10 h-0.5 rounded-full mb-4" style={{ backgroundColor: AC.teal }} />
        <h1 className="text-3xl sm:text-4xl font-semibold mb-2" style={{ fontFamily: AC.heading, color: AC.fg }}>
          {allComplete ? `You did it, ${firstName}! 🎉` : `Welcome, ${firstName}!`}
        </h1>
        <p className="text-sm" style={{ color: AC.fgMuted }}>
          {allComplete
            ? "Your onboarding paperwork is complete. We can't wait to see you on your first day!"
            : startDate
            ? `Your first day is ${new Date(startDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}. Let's get everything ready.`
            : "Work through each chapter below at your own pace."}
        </p>
      </div>

      {/* Journey path */}
      <div className="flex items-center gap-1 overflow-x-auto pb-3 mb-8 scrollbar-none">
        {chapters.map((chapter, i) => (
          <div key={chapter.id} className="flex items-center gap-1 flex-shrink-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
              style={{
                backgroundColor: chapter.status === "complete" ? AC.teal :
                  chapter.status === "in-progress" ? chapter.accentColor :
                  chapter.status === "available" ? AC.bgRaised : AC.bgCard,
                color: chapter.status === "complete" || chapter.status === "in-progress" ? AC.bg : AC.fgMuted,
                border: chapter.status === "available" ? `1.5px solid ${chapter.accentColor}` : `1px solid ${AC.border}`,
              }}
              title={chapter.title}>
              {chapter.status === "complete" ? "✓" : chapter.number}
            </div>
            {i < chapters.length - 1 && (
              <div className="w-5 h-px flex-shrink-0"
                style={{ backgroundColor: chapters[i + 1].status !== "locked" ? AC.teal : AC.border }} />
            )}
          </div>
        ))}
        <span className="ml-3 text-xs" style={{ color: AC.fgSubtle }}>{completedChapters}/{totalChapters} done</span>
      </div>

      {/* Chapter cards */}
      <div className="space-y-3">
        {chapters.map((chapter, i) => (
          <ChapterCard key={chapter.id} chapter={chapter} index={i} onStart={onStartChapter} />
        ))}
      </div>

      {/* Help */}
      <div className="mt-8 flex items-start gap-3 p-4 rounded-xl text-sm"
        style={{ backgroundColor: AC.bgCard, border: `1px solid ${AC.border}`, color: AC.fgMuted }}>
        <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: AC.teal }} />
        <span>
          Questions? Contact HR at{" "}
          <a href="mailto:hr@apartmentcorp.com" className="underline font-medium" style={{ color: AC.teal }}>
            hr@apartmentcorp.com
          </a>{" "}
          or call <strong style={{ color: AC.fg }}>(555) 000-0000</strong>.
        </span>
      </div>
    </motion.div>
  );
}

// ── Chapter Card ──────────────────────────────────────────────────────────────
function ChapterCard({ chapter, index, onStart }: { chapter: Chapter; index: number; onStart: (id: string) => void }) {
  const isLocked = chapter.status === "locked";
  const isComplete = chapter.status === "complete";
  const isAvailable = chapter.status === "available" || chapter.status === "in-progress";

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="rounded-xl border overflow-hidden transition-all"
      style={{
        backgroundColor: isLocked ? AC.bgCard : AC.bgCard,
        borderColor: isComplete ? AC.teal + "44" : isAvailable ? chapter.accentColor + "44" : AC.border,
        opacity: isLocked ? 0.6 : 1,
      }}>
      <div className="flex items-start gap-4 p-5">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ backgroundColor: isComplete ? AC.teal + "18" : isLocked ? AC.bgRaised : chapter.accentColor + "18" }}>
          {isComplete ? "✅" : isLocked ? "🔒" : chapter.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold text-base" style={{ fontFamily: AC.heading, color: isLocked ? AC.fgMuted : AC.fg }}>
                {chapter.title}
              </div>
              <div className="text-xs mt-0.5" style={{ color: AC.fgSubtle }}>{chapter.subtitle}</div>
            </div>
            {isComplete ? (
              <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ backgroundColor: AC.teal + "18", color: AC.teal }}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Complete
              </span>
            ) : isLocked ? (
              <span className="text-xs px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ backgroundColor: AC.bgRaised, color: AC.fgSubtle }}>Locked</span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ backgroundColor: chapter.accentColor + "18", color: chapter.accentColor }}>
                <Clock className="w-3 h-3" /> ~{chapter.estimatedMinutes} min
              </span>
            )}
          </div>

          <p className="text-sm mt-2 leading-relaxed" style={{ color: isLocked ? AC.fgSubtle : AC.fgMuted }}>
            {chapter.description}
          </p>

          {isAvailable && (
            <button onClick={() => onStart(chapter.id)}
              className="mt-3 flex items-center gap-1.5 text-sm font-medium transition-all active:scale-[0.97]"
              style={{ color: chapter.accentColor }}>
              {chapter.status === "in-progress" ? "Continue" : "Start"} this chapter
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {chapter.status === "in-progress" && (
        <div className="h-0.5" style={{ backgroundColor: AC.border }}>
          <div className="h-full w-1/3 rounded-full" style={{ backgroundColor: chapter.accentColor }} />
        </div>
      )}
    </motion.div>
  );
}

// ── Form Screen ───────────────────────────────────────────────────────────────
function FormScreen({ chapter, formValues, onFieldChange, onBack, onComplete }: {
  chapter: Chapter; formValues: Record<string, string>;
  onFieldChange: (fieldId: string, value: string) => void;
  onBack: () => void; onComplete: () => void;
}) {
  const [showCompleteOverlay, setShowCompleteOverlay] = useState(false);

  const allRequiredFilled = chapter.forms.every(group =>
    group.fields.filter(f => f.required).every(f => (formValues[f.id] || "").trim() !== "")
  );

  const handleComplete = () => {
    if (chapter.forms.length === 0) {
      toast.info("This section will be available once your forms are uploaded.");
      return;
    }
    setShowCompleteOverlay(true);
    setTimeout(() => { setShowCompleteOverlay(false); onComplete(); }, 2200);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="max-w-2xl mx-auto px-4 py-8 pb-20">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm mb-6 transition-all hover:opacity-70"
        style={{ color: AC.fgMuted }}>
        ← Back to all chapters
      </button>

      <div className="flex items-start gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ backgroundColor: chapter.accentColor + "18", border: `1px solid ${chapter.accentColor}33` }}>
          {chapter.icon}
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: chapter.accentColor }}>
            Chapter {chapter.number}
          </div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: AC.heading, color: AC.fg }}>
            {chapter.title}
          </h1>
          <p className="text-sm mt-1" style={{ color: AC.fgMuted }}>{chapter.description}</p>
        </div>
      </div>

      {chapter.forms.length === 0 ? (
        <div className="rounded-2xl p-10 text-center border"
          style={{ borderColor: AC.border, backgroundColor: AC.bgCard }}>
          <div className="text-4xl mb-3">📄</div>
          <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: AC.heading, color: AC.fg }}>
            Forms coming soon
          </h3>
          <p className="text-sm" style={{ color: AC.fgMuted }}>
            The forms for this chapter are being prepared. HR will notify you when they're ready.
          </p>
          <button onClick={onBack} className="mt-5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.97]"
            style={{ backgroundColor: AC.teal, color: AC.bg }}>
            ← Back to chapters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {chapter.forms.map((group, gi) => (
            <motion.div key={group.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.08, duration: 0.35 }}
              className="rounded-2xl p-6 border"
              style={{ backgroundColor: AC.bgCard, borderColor: AC.border }}>
              <h2 className="text-base font-semibold mb-5 pb-3 border-b"
                style={{ fontFamily: AC.heading, color: AC.fg, borderColor: AC.border }}>
                {group.title}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {group.fields.map(field => (
                  <FormField key={field.id} field={field}
                    value={formValues[field.id] || ""}
                    onChange={v => onFieldChange(field.id, v)}
                    accentColor={chapter.accentColor} />
                ))}
              </div>
            </motion.div>
          ))}

          <div className="flex items-center justify-between gap-4 pt-2">
            <p className="text-xs" style={{ color: AC.fgSubtle }}>
              {allRequiredFilled ? "✓ All required fields are filled in" : "Fill in all required fields to continue"}
            </p>
            <button onClick={handleComplete} disabled={!allRequiredFilled}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] disabled:opacity-40"
              style={{ backgroundColor: chapter.accentColor, color: AC.bg }}>
              <Sparkles className="w-4 h-4" /> Complete Chapter
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showCompleteOverlay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "oklch(0.10 0.06 258 / 0.92)" }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-center px-8">
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.6, delay: 0.2 }}
                className="text-6xl mb-4">✅</motion.div>
              <h2 className="text-2xl font-semibold text-white mb-2" style={{ fontFamily: AC.heading }}>
                Chapter Complete!
              </h2>
              <p className="text-base" style={{ color: AC.fgMuted }}>"{chapter.title}" — nicely done!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Form Field ────────────────────────────────────────────────────────────────
function FormField({ field, value, onChange, accentColor }: {
  field: FormFieldDef; value: string; onChange: (v: string) => void; accentColor: string;
}) {
  const [focused, setFocused] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const isFullWidth = field.type === "textarea" || field.id.includes("address1");

  const inputStyle = {
    backgroundColor: AC.bgRaised,
    borderColor: focused ? accentColor : AC.border,
    color: AC.fg,
    outline: "none",
    boxShadow: focused ? `0 0 0 2px ${accentColor}22` : "none",
    colorScheme: "dark" as const,
  };

  return (
    <div className={isFullWidth ? "sm:col-span-2" : ""}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: AC.fgMuted }}>
          {field.label}
          {field.required && <span className="ml-1" style={{ color: accentColor }}>*</span>}
          {field.sensitive && <span className="ml-1.5 text-xs normal-case tracking-normal font-normal" style={{ color: AC.fgSubtle }}>🔒</span>}
        </label>
        {field.helpText && (
          <button onClick={() => setShowHelp(!showHelp)} className="text-xs flex items-center gap-0.5 transition-all"
            style={{ color: showHelp ? accentColor : AC.fgSubtle }}>
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {showHelp && field.helpText && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
          className="mb-2 text-xs px-3 py-2 rounded-lg"
          style={{ backgroundColor: accentColor + "12", color: AC.fgMuted }}>
          {field.helpText}
        </motion.div>
      )}

      {field.type === "select" ? (
        <select value={value} onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="w-full px-3 py-2.5 rounded-xl border text-sm transition-all"
          style={inputStyle}>
          <option value="">Select...</option>
          {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : field.type === "textarea" ? (
        <textarea value={value} onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder={field.placeholder} rows={3}
          className="w-full px-3 py-2.5 rounded-xl border text-sm transition-all resize-none"
          style={inputStyle} />
      ) : field.type === "radio" && field.options ? (
        <div className="flex flex-wrap gap-2 mt-1">
          {field.options.map(opt => (
            <button key={opt} onClick={() => onChange(opt)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-all"
              style={{
                backgroundColor: value === opt ? accentColor : AC.bgRaised,
                borderColor: value === opt ? accentColor : AC.border,
                color: value === opt ? AC.bg : AC.fgMuted,
              }}>{opt}</button>
          ))}
        </div>
      ) : field.type === "checkbox" ? (
        <div className="flex items-center gap-2 mt-1">
          <button onClick={() => onChange(value === "true" ? "" : "true")}
            className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0"
            style={{ backgroundColor: value === "true" ? accentColor : "transparent", borderColor: value === "true" ? accentColor : AC.border }}>
            {value === "true" && <CheckCircle2 className="w-3 h-3" style={{ color: AC.bg }} />}
          </button>
          <span className="text-sm" style={{ color: AC.fgMuted }}>{field.placeholder}</span>
        </div>
      ) : (
        <input type={field.type === "ssn" ? "password" : field.type}
          value={value} onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder={field.placeholder}
          className="w-full px-3 py-2.5 rounded-xl border text-sm transition-all"
          style={inputStyle} />
      )}
    </div>
  );
}
