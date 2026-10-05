/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, useEffect } from "react";
import Header from "./components/Header";
import EvaluationReport from "./components/EvaluationReport";
import { DIAGNOSTIC_QUESTIONS, getLocalized } from "./data";
import { CompanyMetadata, QuestionnaireAnswers, IndexEvaluation } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { collection, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";
import SubmissionsViewer from "./components/SubmissionsViewer";
import { 
  ClipboardList, 
  Send, 
  RotateCcw, 
  Cpu, 
  Play, 
  Info, 
  Activity,
  Briefcase,
  Target,
  ChevronDown,
  ChevronUp,
  Database,
  BookOpen,
  Loader2
} from "lucide-react";

export default function App() {
  const [showDbViewer, setShowDbViewer] = useState(false);
  const [language, setLanguage] = useState<"cs" | "en">("cs");
  const [expandedGroup, setExpandedGroup] = useState<string>("readiness");

  // Smooth scroll tracking when transitioning between accordion groups
  useEffect(() => {
    if (expandedGroup) {
      // 1. Quick initial scroll to align direction
      const firstTimer = setTimeout(() => {
        const el = document.getElementById(`group-section-${expandedGroup}`);
        if (el) {
          const yOffset = -120; // safe padding below the sticky header
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 60);

      // 2. Definitive scroll when collapse/expand anim finishes to prevent layout shift jumps
      const secondTimer = setTimeout(() => {
        const el = document.getElementById(`group-section-${expandedGroup}`);
        if (el) {
          const yOffset = -120;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 320);

      return () => {
        clearTimeout(firstTimer);
        clearTimeout(secondTimer);
      };
    }
  }, [expandedGroup]);
  
  // App primary states loaded synchronously from localStorage to prevent mounting race conditions
  const [metadata, setMetadata] = useState<CompanyMetadata>(() => {
    try {
      const saved = localStorage.getItem("resoneti_metadata");
      return saved ? JSON.parse(saved) : { companyName: "", industry: "", size: "", role: "" };
    } catch {
      return { companyName: "", industry: "", size: "", role: "" };
    }
  });

  const [userEmail, setUserEmail] = useState<string>(() => {
    try {
      return localStorage.getItem("resoneti_userEmail") || "";
    } catch {
      return "";
    }
  });

  // Default state holding q1 to q38
  const initialAnswers = () => {
    const defaultAnswers: any = {
      barrier: "",
      experience: ""
    };
    for (let i = 1; i <= 38; i++) {
      defaultAnswers[`q${i}`] = 3; // "Spíše souhlasím"
      defaultAnswers[`q${i}_comm`] = "";
    }
    return defaultAnswers as QuestionnaireAnswers;
  };

  const [answers, setAnswers] = useState<QuestionnaireAnswers>(() => {
    try {
      const saved = localStorage.getItem("resoneti_answers");
      return saved ? JSON.parse(saved) : initialAnswers();
    } catch {
      return initialAnswers();
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadMessageIndex, setLoadMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<IndexEvaluation | null>(() => {
    try {
      const saved = localStorage.getItem("resoneti_evaluation");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Simplified robust persistence effects
  useEffect(() => {
    if (metadata.companyName || metadata.industry || metadata.size || metadata.role) {
      localStorage.setItem("resoneti_metadata", JSON.stringify(metadata));
    }
  }, [metadata]);

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem("resoneti_userEmail", userEmail);
    }
  }, [userEmail]);

  useEffect(() => {
    localStorage.setItem("resoneti_answers", JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    if (evaluation) {
      localStorage.setItem("resoneti_evaluation", JSON.stringify(evaluation));
    } else {
      localStorage.removeItem("resoneti_evaluation");
    }
  }, [evaluation]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (id) {
      setIsLoading(true);
      setError(null);
      const docRef = doc(db, "submissions", id);
      getDoc(docRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.metadata) {
              setMetadata(data.metadata);
            } else {
              setMetadata({
                companyName: data.companyName || "",
                industry: data.industry || "",
                size: data.size || "",
                role: data.role || ""
              });
            }
            if (data.userEmail) {
              setUserEmail(data.userEmail);
            }
            if (data.answers) {
              setAnswers(data.answers);
            }
            if (data.evaluation) {
              setEvaluation(data.evaluation);
            }
            // Scroll to report anchor on restore
            setTimeout(() => {
              document.getElementById("evaluation-report-anchor")?.scrollIntoView({ behavior: "smooth" });
            }, 800);
          }
        })
        .catch((err) => {
          console.error("Error restoring submission from URL:", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setTimeout(() => {
        const el = document.getElementById("identifikace-firmy");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 600);
    }
  }, []);

  // Grouped questions to match the Resoneti index pillars perfectly
  const questionGroups = [
    {
      id: "readiness",
      title: {
        cs: "R1: READINESS (Připravenost)",
        en: "R1: READINESS (Readiness)"
      },
      desc: {
        cs: "Hodnotí strategické základy, definici úspěchu, governance a zkušenosti organizace s řízením změn (otázky 1-10).",
        en: "Evaluates strategic foundations, definition of success, governance, and the organization's experience with change management (questions 1-10)."
      },
      questionIds: Array.from({ length: 10 }, (_, i) => `q${i + 1}`)
    },
    {
      id: "response",
      title: {
        cs: "R2: RESPONSE (Reakce & Zapojení)",
        en: "R2: RESPONSE (Response & Engagement)"
      },
      desc: {
        cs: "Hodnotí aktivní vedení změny, sponzorství, komunikaci a plánované zapojení lidí (otázky 1-10).",
        en: "Evaluates active change leadership, sponsorship, communication, and planned engagement of people (questions 1-10)."
      },
      questionIds: Array.from({ length: 10 }, (_, i) => `q${i + 11}`)
    },
    {
      id: "resistance",
      title: {
        cs: "R3: RESISTANCE (odpor vůči změně)",
        en: "R3: RESISTANCE (Resistance to Change)"
      },
      desc: {
        cs: "Hodnotí připravenost řídit emoční stránku změny, zapojení manažerů a podpůrnou kulturu (otázky 1-10).",
        en: "Evaluates readiness to manage the emotional side of change, manager engagement, and a supportive culture (questions 1-10)."
      },
      questionIds: Array.from({ length: 10 }, (_, i) => `q${i + 21}`)
    },
    {
      id: "results",
      title: {
        cs: "R4: RESULTS (Výsledky & Udržitelnost)",
        en: "R4: RESULTS (Results & Sustainability)"
      },
      desc: {
        cs: "Hodnotí projektovou realizaci, řízení rizik, zdroje a mechanismy pro měření a udržení změn (otázky 1-8).",
        en: "Evaluates project execution, risk management, resources, and mechanisms for measuring and sustaining changes (questions 1-8)."
      },
      questionIds: Array.from({ length: 8 }, (_, i) => `q${i + 31}`)
    }
  ];

  // Array of helpful messages to display while AI is running
  const loadingStages = language === "cs" ? [
    "Právě probíhá expertní vyhodnocování Resoneti indexu...",
    "AI konzultant mapuje firemní symptomy rezistence a nálady...",
    "Kalkulujeme skóre Připravenosti, Reakce, Odolnosti a Výsledků...",
    "Vytváříme okamžitý tiskový report a návrh kroků k realizaci pro lídry...",
    "Kompilujeme čisté sémantické podklady pro export do PDF..."
  ] : [
    "Expert evaluation of the Resoneti Index is currently underway...",
    "AI consultant is mapping corporate symptoms of resistance and morale...",
    "Calculating Readiness, Response, Resistance, and Results scores...",
    "Creating an instant print report and actionable steps for leaders...",
    "Compiling clean semantic data for export to PDF..."
  ];


  const handleScoreChange = (questionId: keyof QuestionnaireAnswers, score: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: score
    }));
  };

  const handleCommentChange = (questionId: string, commentVal: string) => {
    setAnswers(prev => ({
      ...prev,
      [`${questionId}_comm`]: commentVal
    }));
  };

  const handleMetadataChange = (field: keyof CompanyMetadata, value: string) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setMetadata({
      companyName: "",
      industry: "",
      size: "",
      role: ""
    });
    setAnswers(initialAnswers());
    setEvaluation(null);
    setError(null);
    localStorage.removeItem("resoneti_metadata");
    localStorage.removeItem("resoneti_userEmail");
    localStorage.removeItem("resoneti_answers");
    localStorage.removeItem("resoneti_evaluation");
  };

  // Triggers API evaluation endpoint
  const handleSubmitEvaluation = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setLoadMessageIndex(0);

    // Dynamic rotation of loading statements
    const interval = setInterval(() => {
      setLoadMessageIndex(prev => (prev + 1) % loadingStages.length);
    }, 2500);

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          metadata,
          userEmail
        })
      });

      const data = await response.json();
      if (data.success && data.evaluation) {
        setEvaluation(data.evaluation);
        
        // Save the submission and evaluated results securely inside Firestore
        const newDocRef = doc(collection(db, "submissions"));
        try {
          await setDoc(newDocRef, {
            companyName: metadata.companyName,
            industry: metadata.industry || "",
            size: metadata.size || "",
            role: metadata.role || "",
            userEmail: userEmail || "",
            answers: answers,
            evaluation: data.evaluation,
            createdAt: serverTimestamp()
          });
          console.log("Submission was securely saved into Firestore with document ID:", newDocRef.id);
          
          // Save the ID in the URL without reloading, so it survives navigation
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set("id", newDocRef.id);
          window.history.pushState(null, "", newUrl.toString());
        } catch (dbErr: any) {
          console.error("Failed to save submission to Firestore database:", dbErr);
          // Conform to Firebase security rules error guidelines
          handleFirestoreError(dbErr, OperationType.CREATE, "submissions/" + newDocRef.id);
        }

        // Scroll smoothly to report content
        setTimeout(() => {
          document.getElementById("evaluation-report-anchor")?.scrollIntoView({ behavior: "smooth" });
        }, 120);
      } else {
        setError(data.error || "Při vyhodnocení došlo k neznámé chybě.");
      }
    } catch (err: any) {
      setError(err instanceof Error && err.message.startsWith("{") ? "Chyba ukládání dat do databáze." : "Nepodařilo se navázat spojení se serverem. Zkontrolujte připojení.");
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream-light/60 flex flex-col font-sans text-brand-slate selection:bg-brand-lime/30 selection:text-brand-slate">
      {/* Decorative ambient background flares */}
      <div className="no-print absolute top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-300px] left-[15%] w-[600px] h-[600px] bg-brand-lime/10 rounded-full blur-3xl"></div>
        <div className="absolute top-[-250px] right-[10%] w-[500px] h-[550px] bg-brand-cream-dark/20 rounded-full blur-3xl"></div>
      </div>

      {/* Styled Header */}
      <Header 
        onOpenAdmin={() => setShowDbViewer(true)} 
        userEmail={userEmail} 
        setUserEmail={setUserEmail} 
        language={language}
        setLanguage={setLanguage}
      />

      {/* Primary diagnostic workspace wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">

        <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Controls, inputs, and questionnaire (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6">

            <motion.form
              onSubmit={handleSubmitEvaluation}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
                  {/* Section: Company characteristics */}
                  <div id="identifikace-firmy" className="scroll-mt-32 bg-white border border-brand-cool-gray rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 border-b border-brand-cream-dark pb-3 mb-4">
                      <Briefcase className="w-5 h-5 text-brand-slate" />
                      <h2 className="text-sm font-bold text-brand-slate font-display uppercase tracking-wider">
                        {language === "cs" ? "1. Identifikace hodnocené firmy" : "1. Firm Identification"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-brand-slate/60 uppercase tracking-wider font-mono block mb-1.5">
                          {language === "cs" ? "Název společnosti *" : "Company Name *"}
                        </label>
                        <input
                          type="text"
                          required
                          value={metadata.companyName}
                          onChange={(e) => handleMetadataChange("companyName", e.target.value)}
                          placeholder={language === "cs" ? "Např. Astra pojišťovna, a.s." : "e.g. Astra Insurance, Ltd."}
                          className="w-full text-xs p-2.5 bg-brand-cream-light/30 border border-brand-cool-gray rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-slate/25"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-brand-slate/60 uppercase tracking-wider font-mono block mb-1.5">
                          E-mail *
                        </label>
                        <input
                          type="email"
                          required
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          placeholder={language === "cs" ? "Např. novak@astra.cz" : "e.g. novak@astra.com"}
                          className="w-full text-xs p-2.5 bg-brand-cream-light/30 border border-brand-cool-gray rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-slate/25 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-brand-slate/60 uppercase tracking-wider font-mono block mb-1.5">
                          {language === "cs" ? "Odvětví / Sektor" : "Industry / Sector"}
                        </label>
                        <input
                          type="text"
                          value={metadata.industry}
                          onChange={(e) => handleMetadataChange("industry", e.target.value)}
                          placeholder={language === "cs" ? "Např. Strojírenství / Služby / IT" : "e.g. Engineering / Services / IT"}
                          className="w-full text-xs p-2.5 bg-brand-cream-light/30 border border-brand-cool-gray rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-slate/25"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-brand-slate/60 uppercase tracking-wider font-mono block mb-1.5">
                          {language === "cs" ? "Velikost firmy" : "Company size"}
                        </label>
                        <select
                          value={metadata.size}
                          onChange={(e) => handleMetadataChange("size", e.target.value)}
                          className="w-full text-xs p-2.5 bg-brand-cream-light/30 border border-brand-cool-gray rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-slate/25"
                        >
                          <option value="">{language === "cs" ? "Vyberte počet zaměstnanců..." : "Select number of employees..."}</option>
                          <option value="Mikro (1-9 zaměstnanců)">{language === "cs" ? "Mikro (1-9 zaměstnanců)" : "Micro (1-9 employees)"}</option>
                          <option value="Malá (10-49 zaměstnanců)">{language === "cs" ? "Malá (10-49 zaměstnanců)" : "Small (10-49 employees)"}</option>
                          <option value="Střední (50-249 zaměstnanců)">{language === "cs" ? "Střední (50-249 zaměstnanců)" : "Medium (50-249 employees)"}</option>
                          <option value="Velká (250+ zaměstnanců)">{language === "cs" ? "Velká (250+ zaměstnanců)" : "Large (250+ employees)"}</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-brand-slate/60 uppercase tracking-wider font-mono block mb-1.5">
                          {language === "cs" ? "Vaše role ve firmě" : "Your Role in the Company"}
                        </label>
                        <input
                          type="text"
                          value={metadata.role}
                          onChange={(e) => handleMetadataChange("role", e.target.value)}
                          placeholder={language === "cs" ? "Např. Change Manager / COO / Vlastník" : "e.g. Change Manager / COO / Owner"}
                          className="w-full text-xs p-2.5 bg-brand-cream-light/30 border border-brand-cool-gray rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-slate/25"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Questionnaire body */}
                  <div className="bg-white border border-brand-cool-gray rounded-2xl p-5 sm:p-6 shadow-xs">
                    <div className="flex items-center gap-2.5 border-b border-brand-cream-dark pb-3 mb-5">
                      <ClipboardList className="w-5 h-5 text-brand-slate" />
                      <h2 className="text-sm font-bold text-brand-slate font-display uppercase tracking-wider">
                        {language === "cs" ? "2. Resoneti index - otázky" : "2. Resoneti index - questions"}
                      </h2>
                    </div>

                    <div className="space-y-4">
                      {questionGroups.map((group) => {
                        const isExpanded = expandedGroup === group.id;
                        return (
                          <div key={group.id} id={`group-section-${group.id}`} className="scroll-mt-32 border border-brand-cool-gray rounded-xl overflow-hidden transition-all bg-brand-cream-light/20">
                            {/* Accordion trigger header */}
                            <button
                              type="button"
                              onClick={() => setExpandedGroup(isExpanded ? "" : group.id)}
                              className="w-full text-left p-4 flex items-center justify-between gap-4 font-mono select-none cursor-pointer bg-brand-cream-dark/20 hover:bg-brand-cream-dark/40 transition-colors"
                            >
                              <div className="space-y-1">
                                <h3 className="text-xs font-bold text-brand-slate uppercase tracking-wider">
                                  {getLocalized(group.title, language)}
                                </h3>
                                <p className="text-[10px] text-brand-slate/70 font-normal leading-normal max-w-xl">
                                  {getLocalized(group.desc, language)}
                                </p>
                              </div>
                              <span className="text-brand-slate/50">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </span>
                            </button>

                            {/* Collapsible questionnaire body */}
                            <AnimatePresence initial={false}>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25, ease: "easeInOut" }}
                                  className="border-t border-brand-cool-gray p-4 space-y-6 bg-white"
                                >
                                  {group.questionIds.map((qId) => {
                                    const qDef = DIAGNOSTIC_QUESTIONS.find((q) => q.id === qId);
                                    if (!qDef) return null;

                                    const currentScore = (answers as any)[qId] || 3;
                                    const currentGroupSelection = qDef.answers.find((a) => a.value === currentScore);

                                    return (
                                      <div key={qId} className="space-y-3 bg-brand-cream-light/20 border border-brand-cool-gray rounded-xl p-4">
                                        <div>
                                          <h4 className="text-xs font-bold text-brand-slate leading-normal font-display">
                                            {getLocalized(qDef.title, language)}
                                          </h4>
                                          <p className="text-xs text-brand-slate/85 leading-relaxed mt-1">
                                            {getLocalized(qDef.description, language)}
                                          </p>
                                        </div>

                                        {/* Score evaluation radio groups 1 to 4 */}
                                        <div className="flex items-center gap-1.5 max-w-xs pt-1">
                                          {[1, 2, 3, 4].map((val) => (
                                            <button
                                              key={val}
                                              type="button"
                                              onClick={() => handleScoreChange(qId as keyof QuestionnaireAnswers, val)}
                                              className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center border transition-all cursor-pointer ${
                                                currentScore === val
                                                  ? "bg-brand-slate border-brand-slate text-brand-lime shadow-xs scale-105"
                                                  : "bg-white border-brand-cool-gray text-brand-slate hover:border-brand-slate/50 hover:bg-brand-cream-light/30"
                                              }`}
                                            >
                                              {val}
                                            </button>
                                          ))}
                                          <span className="text-[9px] text-brand-slate/50 font-mono tracking-wider ml-2.5">
                                            {currentGroupSelection ? getLocalized(currentGroupSelection.text, language) : `Úroveň ${currentScore}`}
                                          </span>
                                        </div>

                                        {/* Immediate dynamic description display under choice */}
                                        {currentGroupSelection && (
                                          <div className="bg-white border border-brand-cool-gray p-2.5 rounded-lg text-xs leading-relaxed text-brand-slate border-l-2 border-l-brand-slate font-mono text-[10.5px]">
                                            <span className="font-bold text-brand-slate/80">{language === "cs" ? "Stav v praxi:" : "Status in practice:"}</span> {getLocalized(currentGroupSelection.text, language)}
                                          </div>
                                        )}

                                        {/* Qualitative comments per key */}
                                        <div>
                                          <textarea
                                            value={(answers as any)[`${qId}_comm`] || ""}
                                            onChange={(e) => handleCommentChange(qId, e.target.value)}
                                            placeholder={language === "cs" ? "Upřesňující postřehy k tomuto bodu (nepovinné)..." : "Specific insights on this point (optional)..."}
                                            rows={2}
                                            className="w-full text-xs p-2 bg-white border border-brand-cool-gray rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand-slate"
                                          ></textarea>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Open supplement questions section */}
                  <div className="bg-white border border-brand-cool-gray rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 border-b border-brand-cream-dark pb-3 mb-4">
                      <Target className="w-5 h-5 text-brand-slate" />
                      <h2 className="text-sm font-bold text-brand-slate font-display uppercase tracking-wider">
                        {language === "cs" ? "3. Kvalitativní okolnosti" : "3. Qualitative Circumstances"}
                      </h2>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[11px] font-bold text-brand-slate/60 uppercase tracking-wider block mb-1.5 leading-normal">
                          {language === "cs" 
                            ? "A. Co vnímáte ve vaší firmě jako největší překážku pro hladké zapracování technologií?" 
                            : "A. What do you see in your company as the biggest obstacle to smooth technology adoption?"}
                        </label>
                        <textarea
                          value={answers.barrier || ""}
                          onChange={(e) => setAnswers(prev => ({ ...prev, barrier: e.target.value }))}
                          placeholder={language === "cs" 
                            ? "Např. generační bariéra, chaos v zavedení systémů, vyhoření lidí ze změn..." 
                            : "e.g. generational barrier, chaos in system deployment, people burned out from change..."}
                          rows={3}
                          className="w-full text-xs p-2.5 bg-brand-cream-light/30 border border-brand-cool-gray rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-slate/25"
                        ></textarea>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-brand-slate/60 uppercase tracking-wider block mb-1.5 leading-normal">
                          {language === "cs" 
                            ? "B. Uveďte konkrétní příklad, jak u vás v poslední době proběhl nějaký softwarový přechod." 
                            : "B. Give a specific example of how a recent software transition went in your company."}
                        </label>
                        <textarea
                          value={answers.experience || ""}
                          onChange={(e) => setAnswers(prev => ({ ...prev, experience: e.target.value }))}
                          placeholder={language === "cs" 
                            ? "Např. zavedení nového CRM od stolu, které polovina firmy bojkotuje a píše maily..." 
                            : "e.g. roll-out of a new CRM from the top, which half the company boycotted and uses email instead..."}
                          rows={3}
                          className="w-full text-xs p-2.5 bg-brand-cream-light/30 border border-brand-cool-gray rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-slate/25"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Panel controls reset or submit */}
                  <div className="flex flex-col gap-3 pt-2">
                    <div className="flex items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="bg-brand-cream-dark/40 hover:bg-brand-cream-dark text-brand-slate font-bold text-xs py-3 px-5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{language === "cs" ? "Smazat odpovědi" : "Clear answers"}</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-brand-slate hover:bg-brand-slate/90 disabled:bg-brand-cream-dark/50 text-brand-lime font-bold text-xs py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-transform cursor-pointer shadow-md select-none transform active:scale-98"
                      >
                        <span className="text-white">{language === "cs" ? "Spustit diagnostiku Resoneti index" : "Run Resoneti index diagnostics"}</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-right text-[11px] font-mono font-bold text-brand-slate/80 flex items-center justify-end gap-2 mt-1 animate-pulse"
                      >
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-slate" />
                        <span>{language === "cs" ? "AI konzultant vyhodnocuje Resoneti index..." : "AI consultant is evaluating Resoneti index..."}</span>
                      </motion.div>
                    )}
                  </div>
                </motion.form>
          </div>

          {/* RIGHT COLUMN: Diagnostic loading, result display, or idle panel */}
          <div className="lg:col-span-5 h-full sticky top-24">
            <div className="h-full">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  /* Animated premium loading card block */
                  <motion.div
                    key="loading-panel"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-brand-slate border border-brand-slate/20 rounded-3xl p-8 text-center text-white flex flex-col items-center justify-center min-h-[500px] shadow-2xl relative overflow-hidden"
                  >
                    {/* Glowing mesh decorations */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand-lime/10 rounded-full blur-2xl animate-pulse"></div>
                    
                    <div className="relative mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-brand-lime/15 border border-brand-lime/20 flex items-center justify-center text-brand-lime absolute inset-0 animate-ping opacity-25"></div>
                      <div className="w-16 h-16 rounded-2xl bg-brand-lime border border-brand-lime/20 flex items-center justify-center text-brand-slate shadow-xl relative animate-spin [animation-duration:8s]">
                        <Cpu className="w-8 h-8 text-brand-slate" />
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-white tracking-wide font-display mb-2">
                      {language === "cs" ? "Konzultant vyhodnocuje Resoneti index" : "Consultant is evaluating Resoneti index"}
                    </h4>
                    
                    {/* Sliding informative progress stages */}
                    <p className="text-xs text-brand-cream-light/80 max-w-xs leading-relaxed min-h-[40px] font-mono px-4">
                      {loadingStages[loadMessageIndex]}
                    </p>

                    <div className="w-36 bg-brand-slate/50 h-1.5 rounded-full overflow-hidden mt-6 border border-white/10">
                      <div className="bg-brand-lime h-full w-2/3 rounded-full animate-[progress_10s_infinite_ease-in-out]"></div>
                    </div>
                  </motion.div>
                ) : error ? (
                  /* Error feedback block */
                  <motion.div
                    key="error-panel"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-rose-50 border border-rose-250 rounded-3xl p-6 text-center space-y-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto animate-bounce">
                      <Info className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-rose-900 text-sm">{language === "cs" ? "Chyba při komunikaci" : "Communication error"}</h4>
                      <p className="text-xs text-rose-800 leading-relaxed mt-1">
                        {error}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="bg-rose-900 hover:bg-rose-950 text-white font-semibold text-xs py-1.5 px-4 rounded-xl cursor-pointer"
                    >
                      {language === "cs" ? "Zavřít" : "Close"}
                    </button>
                  </motion.div>
                ) : evaluation ? (
                  /* Output complete assessment preview card */
                  <motion.div
                    key="evaluation-preview"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white border border-brand-cool-gray rounded-3xl p-6 shadow-sm space-y-4 text-center cursor-default hover:border-brand-slate/30 transition-colors"
                  >
                    <div className="w-12 h-12 bg-brand-cream-dark/60 text-brand-slate rounded-full flex items-center justify-center mx-auto">
                      <Activity className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-brand-slate/50 tracking-wider block font-mono">
                        {language === "cs" ? "ÚSPĚŠNĚ GENEROVÁNO" : "SUCCESSFULLY GENERATED"}
                      </span>
                      <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-mono text-[9px] font-bold mt-1.5 bg-emerald-50 px-2.5 py-1 rounded-full w-fit mx-auto">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {language === "cs" ? "BEZPEČNĚ ULOŽENO V DATABÁZI" : "SECURELY STORED IN DATABASE"}
                      </div>
                      <h3 className="font-bold text-brand-slate font-display mt-2.5 text-sm">
                        {language === "cs" ? "Report RESONETI Indexu" : "RESONETI Index Report"}
                      </h3>
                      <p className="text-xs text-brand-slate/70 leading-relaxed mt-1.5">
                        {language === "cs" ? (
                          <>
                            Prohlédněte si manažerský přehled pro společnost <span className="font-bold text-brand-slate">{evaluation.companyName}</span> s dosaženým Resoneti indexem <span className="font-bold text-brand-slate text-sm pr-1">{evaluation.overallScore}%</span>. Kompletní PDF report se načetl pod formulářem.
                          </>
                        ) : (
                          <>
                            Review the managerial overview for <span className="font-bold text-brand-slate">{evaluation.companyName}</span> with a reached Resoneti index of <span className="font-bold text-brand-slate text-sm pr-1">{evaluation.overallScore}%</span>. The full report has loaded below the form.
                          </>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        document.getElementById("evaluation-report-anchor")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="bg-brand-slate hover:bg-brand-slate/90 text-brand-lime font-bold text-xs py-2 px-5 rounded-xl flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span className="text-white">{language === "cs" ? "Sjet k reportu" : "Scroll to report"}</span>
                    </button>
                  </motion.div>
                ) : (
                  /* Idle status display block */
                  <motion.div
                    key="idle-panel"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-dotted bg-brand-cream-light/30 border border-dashed border-brand-cool-gray rounded-3xl p-8 py-10 text-center text-brand-slate/60 min-h-[500px] flex flex-col items-center justify-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-brand-cream-dark/40 flex items-center justify-center text-brand-slate mx-auto mb-4 border border-brand-cool-gray">
                      <ClipboardList className="w-7 h-7" />
                    </div>
                    <h4 className="text-brand-slate font-bold text-sm font-display leading-tight">
                      {language === "cs" ? "Čekání na spuštění diagnostiky" : "Awaiting diagnostics"}
                    </h4>
                    <p className="text-xs text-brand-slate/70 max-w-xs leading-relaxed mt-2 px-4">
                      {language === "cs" 
                        ? "Vyplňte odpovědi v interaktivním formuláři pro okamžité spuštění vyhodnocení." 
                        : "Fill in the answers in the interactive form to instantly start the evaluation."}
                    </p>
                    
                    <div className="mt-8 border-t border-brand-cool-gray pt-6 w-full max-w-xs text-left leading-normal space-y-3.5">
                      <div className="flex gap-3 text-xs">
                        <span className="w-5 h-5 bg-brand-cream-dark text-brand-slate rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                        <p className="text-[11px] text-brand-slate/80">
                          {language === "cs" ? (
                            <>
                              <span className="font-semibold text-brand-slate">Ušetříte statisíce korun</span> za nepoužívané licence a drahý čas lídrů.
                            </>
                          ) : (
                            <>
                              <span className="font-semibold text-brand-slate">Save hundreds of thousands</span> on unused licenses and leaders' valuable time.
                            </>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-3 text-xs">
                        <span className="w-5 h-5 bg-brand-cream-dark text-brand-slate rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                        <p className="text-[11px] text-brand-slate/80">
                          {language === "cs" ? (
                            <>
                              <span className="font-semibold text-brand-slate">Předejdete rezistenci</span> včasným zapojením a srozumitelností změny.
                            </>
                          ) : (
                            <>
                              <span className="font-semibold text-brand-slate">Prevent resistance</span> through early engagement and clear change communication.
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Anchor point to anchor scrolling */}
        <div id="evaluation-report-anchor" className="pt-2"></div>

        {/* RESULTS SECTION: Report view rendered dynamically */}
        {evaluation && (
          <div className="mt-12 bg-white border border-brand-cool-gray rounded-3xl p-6 sm:p-8 shadow-md">
            <EvaluationReport evaluation={evaluation} language={language} />
          </div>
        )}
      </main>

      {/* Corporate humanizing footer */}
      <footer className="no-print border-t border-brand-cool-gray bg-white mt-16 text-brand-slate/50 py-6 text-xs text-center border-b border-brand-cream-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10.5px]">
          <p>© {new Date().getFullYear()} RESONETI. {language === "cs" ? "Všechna práva vyhrazena. Diagnostický index lidské transformace - Resoneti index." : "All rights reserved. Diagnostic Index of Human Transformation - Resoneti Index."}</p>
          <div className="flex gap-6">
            <a href="https://resoneti.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-slate underline">
              RESONETI.com
            </a>
            <span className="text-brand-cool-gray">|</span>
            <span>RESONETI INDEX</span>
            <span className="text-brand-cool-gray">|</span>
            <button
              onClick={() => setShowDbViewer(true)}
              className="hover:text-brand-slate hover:underline cursor-pointer flex items-center gap-1 font-semibold text-brand-slate"
            >
              {language === "cs" ? "📊 Přehled odpovědí" : "📊 Submissions"}
            </button>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-slate/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center text-white select-none"
          >
            {/* Glowing active mesh back lighting */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-brand-lime/10 rounded-full blur-3xl animate-pulse"></div>

            <div className="relative mb-8 max-w-md flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-brand-lime/15 border border-brand-lime/20 flex items-center justify-center text-brand-lime absolute inset-0 animate-ping opacity-25"></div>
              <div className="w-20 h-20 rounded-2xl bg-brand-lime border border-brand-lime/20 flex items-center justify-center text-brand-slate shadow-2xl relative animate-spin [animation-duration:6s] mb-8">
                <Cpu className="w-10 h-10 text-brand-slate animate-pulse" />
              </div>

              <h3 className="text-xl font-bold text-white font-display tracking-wide mb-3 px-4">
                {language === "cs" ? "AI konzultant vyhodnocuje Resoneti index" : "AI consultant is evaluating Resoneti index"}
              </h3>

              <div className="w-full min-h-[64px] flex items-center justify-center px-6">
                <p className="text-sm text-brand-cream-light/90 font-mono leading-relaxed max-w-xs md:max-w-md">
                  {loadingStages[loadMessageIndex]}
                </p>
              </div>

              <div className="w-48 bg-white/10 h-2 rounded-full overflow-hidden mt-6 border border-white/5 mx-auto">
                <div className="bg-brand-lime h-full w-2/3 rounded-full animate-[progress_10s_infinite_ease-in-out]"></div>
              </div>

              <span className="text-[10px] text-brand-cream-light/60 font-mono mt-5 uppercase tracking-wider block">
                {language === "cs" ? "Generování trvá typicky několik sekund..." : "Generation typically takes a few seconds..."}
              </span>
            </div>
          </motion.div>
        )}

        {showDbViewer && (
          <SubmissionsViewer
            onSelectEvaluation={(evalData) => setEvaluation(evalData)}
            onClose={() => setShowDbViewer(false)}
            language={language}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
