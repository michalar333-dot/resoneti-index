import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType, auth } from "../firebase";
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { getLocalized, DIAGNOSTIC_QUESTIONS } from "../data";
import { QuestionnaireAnswers, IndexEvaluation } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  Database,
  Calendar,
  User,
  Building2,
  Tag,
  RefreshCw,
  X,
  FileText,
  MessageSquare,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Briefcase,
  Layers,
  Activity,
  ChevronDown,
  ChevronUp,
  Lock,
  ShieldAlert,
  LogOut
} from "lucide-react";

export interface SubmissionDocument {
  id: string;
  companyName: string;
  industry: string;
  size: string;
  role: string;
  userEmail?: string;
  answers: QuestionnaireAnswers;
  evaluation?: IndexEvaluation;
  createdAt?: Timestamp | null;
}

export const ALLOWED_ADMIN_EMAILS = [
  "prkpartnersmarketing@gmail.com",
  "karin.strakova@gmail.com"
];

export const isAuthorizedAdmin = (email?: string | null): boolean => {
  if (!email) return false;
  return ALLOWED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
};

interface SubmissionsViewerProps {
  onSelectEvaluation: (evaluation: IndexEvaluation) => void;
  onClose: () => void;
  language: "cs" | "en";
}

export default function SubmissionsViewer({ onSelectEvaluation, onClose, language }: SubmissionsViewerProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<SubmissionDocument | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | "all">("all");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchSubmissions = async () => {
    if (!auth.currentUser || !isAuthorizedAdmin(auth.currentUser.email)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, "submissions"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const docsArr: SubmissionDocument[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        docsArr.push({
          id: docSnap.id,
          companyName: data.companyName || "Neznámá firma",
          industry: data.industry || "",
          size: data.size || "",
          role: data.role || "",
          userEmail: data.userEmail || "",
          answers: data.answers as QuestionnaireAnswers,
          evaluation: data.evaluation,
          createdAt: data.createdAt,
        });
      });
      setSubmissions(docsArr);
      if (docsArr.length > 0 && !selectedDoc) {
        setSelectedDoc(docsArr[0]);
      }
    } catch (err: any) {
      console.error("Error fetching submissions:", err);
      setError("Nepodařilo se načíst uložená data z databáze Firestore.");
      try {
        handleFirestoreError(err, OperationType.LIST, "submissions");
      } catch (innerErr) {
        // Suppress terminal throw to keep app running
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorizedAdmin(currentUser?.email)) {
      fetchSubmissions();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const handleLogin = async () => {
    setLoginError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Auth login failed:", err);
      setLoginError("Přihlášení se nezdařilo. Zkontrolujte prosím připojení nebo to zkuste znovu.");
    }
  };

  const formatDate = (timestamp?: Timestamp | null) => {
    if (!timestamp) return "Neznámé datum";
    const d = timestamp.toDate();
    return d.toLocaleDateString("cs-CZ") + " " + d.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-700 bg-emerald-55";
    if (score >= 60) return "text-blue-700 bg-blue-55";
    if (score >= 40) return "text-amber-700 bg-amber-55";
    return "text-rose-700 bg-rose-55";
  };

  const getPillScoreColor = (val: number) => {
    switch (val) {
      case 4: return "bg-emerald-600 text-white border-emerald-600";
      case 3: return "bg-blue-600 text-white border-blue-600";
      case 2: return "bg-amber-500 text-white border-amber-500";
      case 1: return "bg-rose-600 text-white border-rose-600";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const term = filterQuery.toLowerCase();
    return (
      sub.companyName.toLowerCase().includes(term) ||
      sub.industry.toLowerCase().includes(term) ||
      sub.role.toLowerCase().includes(term)
    );
  });

  if (authLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-brand-slate/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white border border-brand-cool-gray shadow-2xl rounded-3xl p-8 max-w-sm w-full text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-brand-slate animate-spin mx-auto" />
          <p className="text-xs font-mono text-brand-slate/70">Ověřuji přihlášení...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 bg-brand-slate/40 backdrop-blur-xs flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          className="bg-brand-cream-light border border-brand-cool-gray shadow-2xl rounded-3xl p-8 max-w-md w-full relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-brand-cream-dark hover:bg-brand-cool-gray text-brand-slate transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-center space-y-6">
            <div className="w-14 h-14 bg-brand-slate text-brand-lime rounded-2xl flex items-center justify-center mx-auto border border-brand-cool-gray shadow-sm">
              <Lock className="w-6 h-6" />
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-black text-brand-slate font-display tracking-tight uppercase">
                Zabezpečený přístup
              </h3>
              <p className="text-xs text-brand-slate/75 leading-relaxed">
                Tato sekce obsahuje citlivá obchodní data a výsledky diagnostiky RESONETI Index jednotlivých firem. Přístup je omezen pouze pro registrované vlastníky aplikace.
              </p>
            </div>

            {loginError && (
              <div className="text-[10px] font-mono font-semibold text-rose-700 bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
                {loginError}
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-brand-slate hover:bg-brand-slate/90 text-brand-lime font-bold text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-sm transform active:scale-98 cursor-pointer font-mono"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.86c-.277 1.56-1.602 4.585-6.86 4.585-4.54 0-8.24-3.765-8.24-8.4s3.7-8.4 8.24-8.4c2.58 0 4.307 1.095 5.298 2.045l2.465-2.37C18.435 1.21 15.62 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.795-.085-1.4-.195-1.925H12.24z"/>
              </svg>
              Přihlásit se Google účtem
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isAuthorizedAdmin(currentUser.email)) {
    return (
      <div className="fixed inset-0 z-50 bg-brand-slate/40 backdrop-blur-xs flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          className="bg-brand-cream-light border border-brand-cool-gray shadow-2xl rounded-3xl p-8 max-w-md w-full relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-brand-cream-dark hover:bg-brand-cool-gray text-brand-slate transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-center space-y-6">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200 shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-black text-brand-slate font-display tracking-tight uppercase">
                {language === "cs" ? "Přístup zamítnut" : "Access Denied"}
              </h3>
              <p className="text-xs text-brand-slate/75 leading-relaxed">
                {language === "cs" ? (
                  <>
                    Jste přihlášeni jako <strong className="text-brand-slate font-mono">{currentUser.email}</strong>, ale tento účet nemá oprávnění k prohlížení databáze odpovědí.
                  </>
                ) : (
                  <>
                    You are signed in as <strong className="text-brand-slate font-mono">{currentUser.email}</strong>, but this account is not authorized to view the submissions database.
                  </>
                )}
              </p>
              <p className="text-[11px] text-brand-slate/60 mt-2">
                {language === "cs" ? (
                  <>
                    Do této sekce mají přístup pouze autorizovaní správci (<strong className="font-mono">prkpartnersmarketing@gmail.com</strong>, <strong className="font-mono">karin.strakova@gmail.com</strong>).
                  </>
                ) : (
                  <>
                    Only authorized administrators (<strong className="font-mono">prkpartnersmarketing@gmail.com</strong>, <strong className="font-mono">karin.strakova@gmail.com</strong>) can access this section.
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={async () => {
                  await signOut(auth);
                }}
                className="w-full bg-brand-slate hover:bg-brand-slate/90 text-brand-lime font-bold text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer font-mono"
              >
                <LogOut className="w-4 h-4" />
                {language === "cs" ? "Odhlásit se / Změnit účet" : "Sign Out / Switch Account"}
              </button>
              
              <button
                onClick={onClose}
                className="w-full bg-brand-cream-dark hover:bg-brand-cool-gray text-brand-slate font-bold text-xs py-3 px-6 rounded-xl transition-all cursor-pointer font-mono"
              >
                {language === "cs" ? "Zavřít" : "Close"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-brand-slate/40 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="bg-brand-cream-light/95 border border-brand-cool-gray shadow-2xl rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden max-h-[850px]"
      >
        {/* Header toolbar */}
        <div className="bg-brand-slate text-white p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-lime/15 rounded-xl border border-brand-lime/20 flex items-center justify-center text-brand-lime">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display tracking-tight flex items-center gap-2">
                RESONETI Index — Databáze vyplněných dotazníků
              </h2>
              <p className="text-[11px] text-brand-cream-light/60 font-mono">
                Přehled a detailní rozbor jednotlivých odpovědí uložených ve Firestore
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {currentUser && (
              <button
                onClick={async () => {
                  try {
                    await signOut(auth);
                  } catch (err) {
                    console.error("Sign out error:", err);
                  }
                }}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-white hover:text-rose-200 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono"
                title="Odhlásit se z administrátorského účtu"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Odhlásit</span>
              </button>
            )}
            <button
              onClick={fetchSubmissions}
              disabled={loading}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
              title="Aktualizovat data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline font-mono">Obnovit</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-brand-lime hover:bg-brand-lime/90 text-brand-slate hover:scale-105 transition-all cursor-pointer shadow-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workspace body */}
        <div className="flex-1 lg:grid lg:grid-cols-12 overflow-hidden bg-white">
          
          {/* LEFT LIST: Sidebar with submission history (lg:col-span-4) */}
          <div className="lg:col-span-4 border-r border-brand-cool-gray flex flex-col h-full bg-brand-cream-light/20">
            {/* Search filter input */}
            <div className="p-4 border-b border-brand-cool-gray">
              <input
                type="text"
                placeholder="Vyhledat firmu, odvětví..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-brand-cool-gray rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-slate/20"
              />
            </div>

            {/* Submissions items container scrollable */}
            <div className="flex-1 overflow-y-auto divide-y divide-brand-cool-gray">
              {loading ? (
                <div className="p-8 text-center space-y-3">
                  <RefreshCw className="w-6 h-6 text-brand-slate/40 animate-spin mx-auto" />
                  <p className="text-xs text-brand-slate/60 font-mono">Stahuji záznamy ze serveru...</p>
                </div>
              ) : error ? (
                <div className="p-6 text-center text-rose-800 space-y-2">
                  <p className="text-xs font-semibold">{error}</p>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="p-8 text-center text-brand-slate/60 space-y-1">
                  <Layers className="w-6 h-6 mx-auto text-brand-slate/30" />
                  <p className="text-xs font-bold font-display">Žádné záznamy nenalezeny</p>
                  <p className="text-[10px] leading-relaxed">Vyplňte první dotazník na hlavní obrazovce.</p>
                </div>
              ) : (
                filteredSubmissions.map((sub) => {
                  const isSelected = selectedDoc?.id === sub.id;
                  const score = sub.evaluation?.overallScore;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedDoc(sub)}
                      className={`w-full text-left p-4 transition-all flex flex-col gap-2 relative cursor-pointer ${
                        isSelected
                          ? "bg-brand-cream-dark/40 border-l-4 border-brand-slate"
                          : "hover:bg-brand-cream-light/30 border-l-4 border-transparent"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-bold text-xs text-brand-slate font-display truncate pr-1 max-w-[170px]">
                          {sub.companyName}
                        </span>
                        {score !== undefined && (
                          <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full shrink-0 font-mono ${getScoreColor(score)}`}>
                            {score}%
                          </span>
                        )}
                      </div>
                      
                      <div className="text-[10px] text-brand-slate/75 space-y-0.5">
                        {sub.industry && (
                          <div className="flex items-center gap-1 font-mono">
                            <Building2 className="w-3 h-3 text-brand-slate/40 shrink-0" />
                            <span className="truncate">{sub.industry}</span>
                          </div>
                        )}
                        {sub.role && (
                          <div className="flex items-center gap-1 font-mono">
                            <User className="w-3 h-3 text-brand-slate/40 shrink-0" />
                            <span className="truncate">{sub.role}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 font-mono text-[9px] text-brand-slate/50 pt-1 border-t border-dashed border-brand-cool-gray/50 mt-1">
                          <Calendar className="w-3 h-3 text-brand-slate/30 shrink-0" />
                          <span>{formatDate(sub.createdAt)}</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            
            {/* Total counts badges */}
            <div className="p-3 bg-brand-cream-dark/20 border-t border-brand-cool-gray flex items-center justify-between text-[10px] font-mono text-brand-slate/60">
              <span>Celkem: {submissions.length} záznamů</span>
              <span>Uloženo ve cloudu</span>
            </div>
          </div>

          {/* RIGHT VIEW: Specific details sheet (lg:col-span-8) */}
          <div className="lg:col-span-8 flex flex-col h-full bg-white overflow-y-auto">
            {selectedDoc ? (
              <div className="p-6 space-y-6">
                
                {/* Section A: Header card detail */}
                <div className="bg-brand-cream-light/40 border border-brand-cool-gray rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-brand-slate bg-brand-cream-dark px-2 py-0.5 rounded-md font-mono uppercase tracking-wider">
                        Firma
                      </span>
                      <span className="text-[10px] text-brand-slate/50 font-mono">ID: {selectedDoc.id}</span>
                    </div>
                    <h3 className="text-base font-black text-brand-slate font-display">
                      {selectedDoc.companyName}
                    </h3>
                    <p className="text-[11px] text-brand-slate/70 font-mono flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Načteno z databáze: {formatDate(selectedDoc.createdAt)}
                    </p>
                  </div>
                  
                  {/* Big Overall Index circle */}
                  {selectedDoc.evaluation && (
                    <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-brand-slate/55 font-mono tracking-wider block uppercase">
                          Celkový index
                        </span>
                        <span className="text-xs text-brand-slate/80 leading-tight block">
                          RESONETI Index
                        </span>
                      </div>
                      <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-black text-sm border font-display ${getScoreColor(selectedDoc.evaluation.overallScore)}`}>
                        <span>{selectedDoc.evaluation.overallScore}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Grid for parameters */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="bg-brand-cream-light/20 border border-brand-cool-gray rounded-xl p-3 text-xs leading-normal">
                    <span className="text-[10px] font-bold text-brand-slate/50 block font-mono">ODVĚTVÍ</span>
                    <span className="font-bold text-brand-slate mt-0.5 block">{selectedDoc.industry || "Nezadáno"}</span>
                  </div>
                  <div className="bg-brand-cream-light/20 border border-brand-cool-gray rounded-xl p-3 text-xs leading-normal">
                    <span className="text-[10px] font-bold text-brand-slate/50 block font-mono">VELIKOST FIRMY</span>
                    <span className="font-bold text-brand-slate mt-0.5 block">{selectedDoc.size || "Nezadáno"}</span>
                  </div>
                  <div className="bg-brand-cream-light/20 border border-brand-cool-gray rounded-xl p-3 text-xs leading-normal">
                    <span className="text-[10px] font-bold text-brand-slate/50 block font-mono">VYPLNIL/A ROLE</span>
                    <span className="font-bold text-brand-slate mt-0.5 block">{selectedDoc.role || "Nezadáno"}</span>
                  </div>
                  <div className="bg-brand-cream-light/20 border border-brand-cool-gray rounded-xl p-3 text-xs leading-normal">
                    <span className="text-[10px] font-bold text-brand-slate/50 block font-mono">KONTAKTNÍ E-MAIL</span>
                    <span className="font-bold text-brand-slate mt-0.5 block font-mono truncate">{selectedDoc.userEmail || "Neuveden"}</span>
                  </div>
                </div>

                {/* Score results breakdown progress bars */}
                {selectedDoc.evaluation?.dimensionScores && (
                  <div className="border border-brand-cool-gray rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-bold text-brand-slate font-display uppercase tracking-wider flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Výkonnostní pilíře (Skóre)
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                      {[
                        { key: "readiness", text: language === "cs" ? "R1: Připravenost (Readiness)" : "R1: Readiness (Readiness)", val: selectedDoc.evaluation.dimensionScores.readiness },
                        { key: "response", text: language === "cs" ? "R2: Reakce a zapojení (Response)" : "R2: Response & Engagement (Response)", val: selectedDoc.evaluation.dimensionScores.response },
                        { key: "resistance", text: language === "cs" ? "R3: Odpor vůči změně (Resistance)" : "R3: Resistance to Change (Resistance)", val: selectedDoc.evaluation.dimensionScores.resistance },
                        { key: "results", text: language === "cs" ? "R4: Výsledky a udržitelnost (Results)" : "R4: Results & Sustainability (Results)", val: selectedDoc.evaluation.dimensionScores.results },
                      ].map((item) => (
                        <div key={item.key} className="space-y-1.5 bg-brand-cream-light/10 border border-brand-cool-gray/40 rounded-xl p-3">
                          <div className="flex justify-between items-center text-[10.5px]">
                            <span className="font-bold text-brand-slate truncate">{item.text}</span>
                            <span className="font-black text-brand-slate shrink-0">{item.val}%</span>
                          </div>
                          <div className="w-full bg-brand-cream-dark h-2 rounded-full overflow-hidden">
                            <div className="bg-brand-slate h-full rounded-full" style={{ width: `${item.val}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action panel: View PDF / full AI report details */}
                {selectedDoc.evaluation && (
                  <div className="p-4 bg-brand-slate rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <h4 className="text-xs font-bold font-display tracking-wide text-brand-lime">
                        Zobrazit kompletní analýzu a PDF tisk
                      </h4>
                      <p className="text-[11px] text-brand-cream-light/75 leading-relaxed max-w-md">
                        Kliknutím na toto tlačítko se detailní textová zpráva od AI, grafy a doporučení načtou zpět na hlavní obrazovku.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (selectedDoc.evaluation) {
                          onSelectEvaluation(selectedDoc.evaluation);
                          onClose();
                          setTimeout(() => {
                            document.getElementById("evaluation-report-anchor")?.scrollIntoView({ behavior: "smooth" });
                          }, 150);
                        }
                      }}
                      className="bg-brand-lime text-brand-slate font-bold text-xs py-2.5 px-6 rounded-xl flex items-center gap-1.5 shrink-0 shadow-md hover:scale-103 transition-transform cursor-pointer"
                    >
                      <span>Otevřít report</span>
                      <ArrowRight className="w-4 h-4 text-brand-slate" />
                    </button>
                  </div>
                )}

                {/* Section B: Detail breakdown of every single answer */}
                <div className="space-y-4">
                  <div className="border-b border-brand-cool-gray pb-3">
                    <h4 className="text-xs font-bold font-display uppercase tracking-wider text-brand-slate flex items-center gap-2">
                      <Briefcase className="w-4.5 h-4.5" /> DETAILNÍ ROZBOR ODPOVĚDÍ (OTÁZKA PO OTÁZCE)
                    </h4>
                    <p className="text-[10px] text-brand-slate/60 font-mono mt-0.5 leading-normal">
                      Podívejte se, co přesně respondent vybral a jaké komentáře popsal u každé z dimenzí Indexu.
                    </p>
                  </div>

                  {/* Filter category bar for questions */}
                  <div className="flex flex-wrap gap-1.5 no-print">
                    {[
                      { id: "all", label: language === "cs" ? "Všechny" : "All" },
                      { id: "readiness", label: language === "cs" ? "R1: Připravenost" : "R1: Readiness" },
                      { id: "response", label: language === "cs" ? "R2: Reakce" : "R2: Response" },
                      { id: "resistance", label: language === "cs" ? "R3: Odpor" : "R3: Resistance" },
                      { id: "results", label: language === "cs" ? "R4: Výsledky" : "R4: Results" }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategoryFilter(cat.id)}
                        className={`text-[10px] font-mono font-bold py-1.5 px-3 rounded-lg border transition-all cursor-pointer ${
                          activeCategoryFilter === cat.id
                            ? "bg-brand-slate text-brand-lime border-brand-slate"
                            : "bg-brand-cream-light/30 border-brand-cool-gray text-brand-slate hover:bg-brand-cream-dark/30"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Question Cards */}
                  <div className="space-y-4">
                    {DIAGNOSTIC_QUESTIONS.filter(
                      (q) => activeCategoryFilter === "all" || q.category === activeCategoryFilter
                    ).map((qDef) => {
                      const value = (selectedDoc.answers as any)[qDef.id] || 3;
                      const comment = (selectedDoc.answers as any)[`${qDef.id}_comm`];
                      const matchedAnswer = qDef.answers.find((a) => a.value === value);

                      const getCategoryText = (cat: string) => {
                        switch (cat) {
                          case "readiness": return language === "cs" ? "R1 PŘIPRAVENOST" : "R1 READINESS";
                          case "response": return language === "cs" ? "R2 REAKCE & ZAPOJENÍ" : "R2 RESPONSE & ENGAGEMENT";
                          case "resistance": return language === "cs" ? "R3 ODPOR VŮČI ZMĚNĚ" : "R3 RESISTANCE TO CHANGE";
                          case "results": return language === "cs" ? "R4 VÝSLEDKY & UDRŽITELNOST" : "R4 RESULTS & SUSTAINABILITY";
                          default: return language === "cs" ? "RESONETI INDEX DIMENZE" : "RESONETI INDEX DIMENSION";
                        }
                      };

                      return (
                        <div key={qDef.id} className="border border-brand-cool-gray rounded-xl p-4 space-y-3.5 bg-brand-cream-light/10 hover:border-brand-slate/20 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 border-b border-dashed border-brand-cool-gray/50 pb-2.5">
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-bold text-brand-slate/50 font-mono block">
                                Dimenze: {getCategoryText(qDef.category)}
                              </span>
                              <h5 className="font-bold text-xs text-brand-slate font-display leading-snug">
                                {getLocalized(qDef.title, language)}
                              </h5>
                              <p className="text-xs text-brand-slate/85 leading-relaxed mt-1 font-mono">
                                {getLocalized(qDef.description, language)}
                              </p>
                            </div>
                            
                            {/* Selected score */}
                            <div className="flex items-center shrink-0 self-start sm:self-center">
                              <span className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center border font-mono ${getPillScoreColor(value)}`}>
                                {value}
                              </span>
                            </div>
                          </div>

                          {/* Selected answer text description */}
                          {matchedAnswer && (
                            <div className="text-xs bg-white border border-brand-cool-gray p-3 rounded-xl border-l-4 border-l-brand-slate font-mono text-[11px] leading-relaxed">
                              <span className="font-bold text-brand-slate/80 block mb-0.5">Diagnostický stav v praxi (Úroveň {value}):</span>
                              <p className="text-brand-slate/90">{getLocalized(matchedAnswer.text, language)}</p>
                            </div>
                          )}

                          {/* Individual qualitative comments */}
                          {comment ? (
                            <div className="bg-brand-lime/10 border border-brand-lime/20 p-3 rounded-xl flex gap-2 items-start text-xs font-mono leading-relaxed">
                              <MessageSquare className="w-4 h-4 text-brand-slate/85 mt-0.5 shrink-0" />
                              <div className="space-y-0.5">
                                <span className="font-bold text-brand-slate text-[10px] block uppercase tracking-wide">Poznámka respondenta k tomuto bodu:</span>
                                <p className="text-brand-slate/90 italic">"{comment}"</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[9.5px] italic text-brand-slate/40 block font-mono">Bez doplňujícího komentáře k bodu</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section C: Qualitative supplemental questions */}
                <div className="border border-brand-cool-gray rounded-2xl p-5 space-y-4 bg-brand-cream-light/15">
                  <h4 className="text-xs font-bold font-display uppercase tracking-wider text-brand-slate flex items-center gap-2">
                    <HelpCircle className="w-4.5 h-4.5" /> Kvalitativní okolnosti proměny
                  </h4>
                  
                  <div className="space-y-4 text-xs font-mono leading-relaxed">
                    <div className="bg-white border border-brand-cool-gray p-4 rounded-xl space-y-1.5">
                      <span className="font-bold text-brand-slate/50 text-[10px] block uppercase">
                        A. Největší vnímaná překážka pro hladké zapracování technologií:
                      </span>
                      <p className="text-brand-slate font-normal italic">
                        {selectedDoc.answers.barrier ? `"${selectedDoc.answers.barrier}"` : "Respondent nevyplnil."}
                      </p>
                    </div>

                    <div className="bg-white border border-brand-cool-gray p-4 rounded-xl space-y-1.5">
                      <span className="font-bold text-brand-slate/50 text-[10px] block uppercase">
                        B. Konkrétní příklad nedávného softwarového přechodu:
                      </span>
                      <p className="text-brand-slate font-normal italic">
                        {selectedDoc.answers.experience ? `"${selectedDoc.answers.experience}"` : "Respondent nevyplnil."}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-brand-slate/50 h-[400px]">
                <Database className="w-12 h-12 text-brand-slate/30 mb-3" />
                <h4 className="font-bold text-sm text-brand-slate font-display">Není vybrán žádný dotazník</h4>
                <p className="text-xs text-brand-slate/60 max-w-xs leading-relaxed mt-1">
                  Klikněte na jakýkoliv dokument v levém seznamu pro zobrazení detailního přehledu odpovědí.
                </p>
              </div>
            )}
          </div>

        </div>
      </motion.div>
    </div>
  );
}
