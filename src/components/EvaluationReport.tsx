/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { IndexEvaluation } from "../types";
import { 
  Printer, 
  Copy, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  PhoneCall, 
  BookOpen, 
  ChevronRight,
  ShieldCheck,
  CheckSquare,
  Square,
  Award
} from "lucide-react";

interface EvaluationReportProps {
  evaluation: IndexEvaluation;
  language: "cs" | "en";
}

export default function EvaluationReport({ evaluation, language }: EvaluationReportProps) {
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "htmlSource">("dashboard");
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});

  const t = (cs: string, en: string) => (language === "cs" ? cs : en);

  const toggleAction = (key: string) => {
    setCompletedActions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(evaluation.rawHtmlReport || "");
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const triggerPrint = () => {
    window.print();
  };

  // Score threshold logic for customized feedback indicators
  const getScoreInfo = (score: number) => {
    if (score >= 84) {
      return {
        label: t("VYSOKÁ PŘIPRAVENOST NA ZMĚNU", "HIGH READINESS FOR CHANGE"),
        sub: t("Skvělý transformativní základ s výtečnou strukturou a zájmem lidí.", "Great transformative foundation with excellent structure and people interest."),
        color: "text-brand-slate",
        bg: "bg-brand-cream-dark/50",
        border: "border-brand-slate/20",
        ring: "stroke-brand-lime",
        fill: "fill-brand-lime/10",
        badge: "bg-brand-lime text-brand-slate border border-brand-slate/10"
      };
    } else if (score >= 67) {
      return {
        label: t("DOBRÁ PŘIPRAVENOST, DOPORUČENÉ CÍLENÉ POSÍLENÍ V URČITÝCH OBLASTECH", "GOOD READINESS, TARGETED STRENGTHENING RECOMMENDED IN CERTAIN AREAS"),
        sub: t("Dobrý základ v lidské i technické rovině s drobnými místy k optimalizaci.", "Good foundation in human and technical terms with minor areas for optimization."),
        color: "text-brand-slate",
        bg: "bg-brand-cream-dark/40",
        border: "border-brand-cool-gray",
        ring: "stroke-brand-slate/60",
        fill: "fill-brand-slate/5",
        badge: "bg-brand-cream-dark text-brand-slate border border-brand-cool-gray"
      };
    } else if (score >= 34) {
      return {
        label: t("ZÁKLADNÍ PŘIPRAVENOST, VÝZNAMNÉ MEZERY", "BASIC READINESS, SIGNIFICANT GAPS"),
        sub: t("Solidní zápal a struktura, avšak s výrazným rizikem rezistence či nepochopení.", "Solid enthusiasm and structure, but with significant risk of resistance or misunderstanding."),
        color: "text-teal-900",
        bg: "bg-amber-50/20",
        border: "border-amber-200/40",
        ring: "stroke-amber-500",
        fill: "fill-amber-500/5",
        badge: "bg-amber-100 text-amber-900 border border-amber-200"
      };
    } else {
      return {
        label: t("VYSOKÉ RIZIKO SELHÁNÍ ZMĚNY", "HIGH RISK OF CHANGE FAILURE"),
        sub: t("Změna je prosazována čistě technokraticky a lidský faktor je kriticky opomíjen.", "Change is pushed purely technocratically and the human factor is critically overlooked."),
        color: "text-rose-850",
        bg: "bg-rose-50/50",
        border: "border-rose-200",
        ring: "stroke-rose-600",
        fill: "fill-rose-600/10",
        badge: "bg-rose-600 text-white"
      };
    }
  };

  const status = getScoreInfo(evaluation.overallScore);

  // SVG calculations for the dynamic circular score indicator
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (evaluation.overallScore / 100) * circumference;

  return (
    <div className="space-y-8">
      {/* Tab controls */}
      <div className="no-print flex items-center justify-between border-b border-brand-cool-gray pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`pb-2.5 px-4 font-bold text-xs uppercase tracking-wider transition-all relative cursor-pointer ${
              activeTab === "dashboard"
                ? "text-brand-slate font-extrabold border-b-2 border-brand-lime"
                : "text-brand-slate/50 hover:text-brand-slate"
            }`}
          >
            {t("Manažerský report Resoneti index", "Resoneti Index Executive Report")}
          </button>
          <button
            onClick={() => setActiveTab("htmlSource")}
            className={`pb-2.5 px-4 font-bold text-xs uppercase tracking-wider transition-all relative cursor-pointer ${
              activeTab === "htmlSource"
                ? "text-brand-slate font-extrabold border-b-2 border-brand-lime"
                : "text-brand-slate/50 hover:text-brand-slate"
            }`}
          >
            {t("Zdrojové HTML (do CRM/PDF šablony)", "Source HTML (for CRM/PDF template)")}
          </button>
        </div>

        {/* Action utility buttons */}
        <div className="flex gap-2">
          <button
            onClick={triggerPrint}
            className="bg-brand-slate hover:bg-brand-slate/90 text-brand-lime text-xs font-bold py-1.5 px-4 rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="text-white">{t("Tisk nebo export PDF", "Print or export PDF")}</span>
          </button>
        </div>
      </div>

      {activeTab === "dashboard" ? (
        <div className="space-y-8">
          {/* Executive Overview Bento Box */}
          <div className="bg-gradient-to-br from-white to-brand-cream-light/40 border border-brand-cool-gray rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Main Gauge Column */}
              <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-brand-cool-gray pb-6 md:pb-0 md:pr-8">
                <span className="text-[10px] font-bold text-brand-slate/50 tracking-widest font-mono uppercase mb-3">
                  {t("Celkový RESONETI Index", "Total RESONETI Index")}
                </span>
                
                {/* Styled SVG Circle Gauge */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r={radius}
                      className="stroke-brand-cream-dark"
                      strokeWidth="9"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r={radius}
                      className={`transition-all duration-1000 ease-out ${status.ring}`}
                      strokeWidth="9"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-extrabold text-brand-slate font-display">
                      {evaluation.overallScore}%
                    </span>
                    <span className="text-[9px] font-semibold text-brand-slate/50 font-mono mt-0.5 uppercase">
                      RESONETI INDEX
                    </span>
                  </div>
                </div>

                <div className={`mt-4 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider font-mono uppercase ${status.badge}`}>
                  {status.label}
                </div>
              </div>

              {/* Status and Summary Prose */}
              <div className="md:col-span-8 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-brand-slate shrink-0" />
                    <span className="text-xs font-semibold text-brand-slate uppercase tracking-wider font-mono">
                      {t("RESONETI DIAGNÓZA: ", "RESONETI DIAGNOSIS: ")}{evaluation.companyName}
                    </span>
                  </div>
                  <span className="no-print inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full px-2.5 py-0.5 text-[9.5px] font-mono font-bold select-none whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {t("Uloženo v online databázi", "Saved in online database")}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-brand-slate font-display">
                  {status.sub}
                </h3>
                <p className="text-sm text-brand-slate/80 leading-relaxed">
                  {evaluation.summary}
                </p>

                {/* Submetrics / Dimension Scores */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                  {[
                    { label: t("R1: Připravenost (Readiness)", "R1: Readiness"), val: evaluation.dimensionScores.readiness },
                    { label: t("R2: Reakce (Response)", "R2: Response"), val: evaluation.dimensionScores.response },
                    { label: t("R3: Odpor vůči změně (Resistance)", "R3: Resistance"), val: evaluation.dimensionScores.resistance },
                    { label: t("R4: Výsledky (Results)", "R4: Results"), val: evaluation.dimensionScores.results },
                  ].map((dim, idx) => (
                    <div key={idx} className="bg-white border border-brand-cool-gray rounded-xl p-3 shadow-2xs">
                      <span className="text-[10px] text-brand-slate/60 font-medium block leading-normal mb-1.5 h-7 overflow-hidden line-clamp-2">
                        {dim.label}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-bold text-brand-slate font-display">{dim.val}%</span>
                      </div>
                      <div className="w-full bg-brand-cream-dark h-1.5 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="bg-brand-slate h-full rounded-full transition-all duration-1000"
                          style={{ width: `${dim.val}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses Split Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths Column */}
            <div className="bg-brand-cream-light border border-brand-cream-dark rounded-2xl p-6">
              <div className="flex items-center gap-2.5 mb-4 border-b border-brand-cream-dark pb-3">
                <div className="w-7 h-7 bg-brand-cream-dark rounded-lg flex items-center justify-center text-brand-slate">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-brand-slate uppercase tracking-wider font-display">
                  {t("Silné stránky organizace", "Organization Strengths")}
                </h3>
              </div>

              <ul className="space-y-4">
                {evaluation.strengths.map((strength, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="w-5 h-5 bg-brand-cream-dark rounded-full text-brand-slate flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </span>
                    <p className="text-xs text-brand-slate font-medium leading-relaxed">
                      {strength}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses Column */}
            <div className="bg-brand-cream-dark/40 border border-brand-cool-gray rounded-2xl p-6">
              <div className="flex items-center gap-2.5 mb-4 border-b border-brand-cool-gray pb-3">
                <div className="w-7 h-7 bg-brand-cream-dark rounded-lg flex items-center justify-center text-brand-slate">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-brand-slate uppercase tracking-wider font-display">
                  {t("Transformační rizika a bariéry", "Transformation Risks and Barriers")}
                </h3>
              </div>

              <ul className="space-y-4">
                {evaluation.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="w-5 h-5 bg-brand-cream-dark rounded-full text-brand-slate flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-mono">
                      !
                    </span>
                    <p className="text-xs text-brand-slate/90 font-medium leading-relaxed">
                      {weakness}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended transformational Roadmap with checklists */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-slate" />
                <h3 className="text-base font-bold text-brand-slate font-display">
                  {t("Doporučení pro transformaci dle Resoneti index", "Recommendations for transformation according to Resoneti index")}
                </h3>
              </div>
              <span className="text-[10px] text-brand-slate/60 font-mono hidden sm:inline">
                {t("SPOJUJEME PM A CHANGE MANAGEMENT", "WE CONNECT PM AND CHANGE MANAGEMENT")}
              </span>
            </div>

            <div className="space-y-4">
              {evaluation.recommendations.map((rec, recIdx) => (
                <div key={recIdx} className="bg-white border border-brand-cool-gray rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-baseline gap-3">
                    <span className="text-xs font-bold bg-brand-cream-dark text-brand-slate px-2 py-1 rounded-md font-mono border border-brand-cool-gray">
                      {t("Krok X.0", "Step X.0")}{recIdx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-brand-slate font-display">
                      {rec.title}
                    </h4>
                  </div>
                  
                  <p className="text-xs text-brand-slate/85 mt-2.5 leading-relaxed pl-0 sm:pl-16">
                    {rec.description}
                  </p>

                  {/* Immediate Action Checklists */}
                  <div className="mt-4 bg-brand-cream-light/40 rounded-xl p-3.5 pl-3 sm:ml-16 border border-brand-cool-gray">
                    <span className="text-[10px] font-bold text-brand-slate/50 uppercase tracking-widest font-mono block mb-2.5">
                      {t("Návrh kroků k realizaci:", "Proposed steps for implementation:")}
                    </span>
                    <div className="space-y-2">
                      {rec.actions.map((act, actIdx) => {
                        const key = `${recIdx}-${actIdx}`;
                        const isDone = !!completedActions[key];
                        return (
                          <button
                            key={actIdx}
                            onClick={() => toggleAction(key)}
                            className="flex items-center text-left gap-3 w-full group py-1 cursor-pointer"
                          >
                            <span className="shrink-0 text-brand-slate group-hover:scale-105 transition-transform">
                              {isDone ? (
                                <CheckSquare className="w-4 h-4 fill-brand-lime/20 text-brand-slate" />
                              ) : (
                                <Square className="w-4 h-4 text-brand-slate/40 group-hover:text-brand-slate" />
                              )}
                            </span>
                            <span className={`text-xs ${isDone ? "text-brand-slate/50 line-through" : "text-brand-slate font-semibold"}`}>
                              {act}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conclusion block */}
          <div className="bg-brand-slate text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-md">
            <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-brand-lime/5 opacity-40 blur-3xl pointer-events-none"></div>
            <div className="relative z-10 space-y-4 max-w-3xl">
              <span className="text-brand-lime font-bold text-[10px] uppercase font-mono tracking-widest">
                {t("HUMÁNNÍ TRANSFORMAČNÍ METODIKA", "HUMAN TRANSFORMATION METHODOLOGY")}
              </span>
              <h4 className="text-lg font-bold text-white font-display">
                {t("Jak dál? Zaveďte principy Resoneti index do praxe", "What next? Put Resoneti index principles into practice")}
              </h4>
              <p className="text-xs text-brand-cream-light/90 leading-relaxed">
                {evaluation.conclusion}
              </p>

              {/* Company banner CTA */}
              <div className="pt-4 border-t border-brand-cool-gray/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-lime/10 border border-brand-lime/20 flex items-center justify-center text-brand-lime">
                    <PhoneCall className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{t("Domluvte si schůzku", "Book a consultation")}</h5>
                    <p className="text-[11px] text-brand-cream-light/60">{t("Vyberte si termín pro detailní rozbor výsledků nebo konzultaci na společném hovoru.", "Choose a time for a detailed analysis of the results or a consultation on a joint call.")}</p>
                  </div>
                </div>

                <a
                  href="https://bookings.cloud.microsoft/bookwithme/user/15c729a7dbbc41668ef3f6905c2ec409%40resoneti.com/meetingtype/SEKoDgMNPkqTOMPqL2K45A2?anonymous&ismsaljsauthenabled"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-brand-lime hover:bg-brand-lime/90 text-brand-slate font-bold text-xs py-2.5 px-5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer self-stretch sm:self-auto justify-center"
                >
                  <span>{t("Domluvte si schůzku", "Book a consultation")}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* HTML document source to copy paste into CRM / PDF automatic generator template */
        <div className="space-y-4">
          <div className="bg-brand-cream-dark/50 border border-brand-cool-gray p-4 rounded-xl flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-brand-slate mt-0.5 shrink-0" />
            <div className="text-xs leading-relaxed text-brand-slate">
              <p className="font-bold mb-1">{t("Připraveno ke zkopírování do PDF šablony", "Ready to copy into PDF template")}</p>
              {t("Níže vygenerovaný kód je čisté, přehledné a sémantické HTML, které je plně uzpůsobené k nahrání do vašeho konverzního PDF skriptu v šabloně RESONETI. Zachovává h1, h2, odstavce p, odrážky ul/li a silné tagy strong přesně podle specifikace.", "The code generated below is clean, clear, and semantic HTML that is fully adapted for uploading into your conversion PDF script in the RESONETI template. It preserves h1, h2, p paragraphs, ul/li bullets, and strong tags exactly according to the specification.")}
            </div>
          </div>

          <div className="relative">
            <div className="absolute top-3 right-3 z-10 flex gap-2">
              <button
                onClick={copyToClipboard}
                className="bg-brand-slate hover:bg-brand-slate/90 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                {copiedHtml ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-brand-lime" />
                    <span>{t("Zkopírováno!", "Copied!")}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t("Kopírovat HTML", "Copy HTML")}</span>
                  </>
                )}
              </button>
            </div>

            <pre className="text-xs font-mono bg-brand-slate text-brand-cream-light p-5 rounded-xl overflow-x-auto max-h-[480px] border border-brand-slate/25 leading-relaxed whitespace-pre-wrap">
              {evaluation.rawHtmlReport}
            </pre>
          </div>
        </div>
      )}

      {/* --- PRINT ONLY PAGE REPRESENTATION --- */}
      <div className="print-only hidden print:block print-page-layout">
        {/* Dynamic Cover Page */}
        <div className="print-cover-break flex flex-col justify-between h-[270mm] py-20">
          <div className="flex justify-between items-center border-b pb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-brand-slate font-display inline-flex items-center gap-1">
                RESONETI
                <span className="inline-flex items-center justify-center border border-brand-lime text-[7px] font-black w-3 h-3 rounded-full text-brand-lime leading-none select-none shrink-0" style={{ transform: "translateY(-6.5px)" }}>
                  R
                </span>
                {" "}INDEX
              </span>
            </div>
            <span className="text-xs font-semibold bg-brand-cream-dark/50 text-brand-slate font-mono px-2 py-0.5 rounded-full">
              {t("RESONETI INDEX DIAGNOSTICKÁ ZPRÁVA", "RESONETI INDEX DIAGNOSTIC REPORT")}
            </span>
          </div>

          <div className="space-y-6 my-auto text-left">
            <span className="text-xs font-bold text-brand-slate tracking-wider font-mono">
              {t("RESONETI® INDEX • KOMPLEXNÍ VYHODNOCENÍ", "RESONETI® INDEX • COMPREHENSIVE EVALUATION")}
            </span>
            <h1 className="text-4xl font-extrabold text-brand-slate font-display border-none p-0 m-0">
              {t("Připravenost na technologickou transformaci", "Readiness for technological transformation")}
            </h1>
            
            <div className="grid grid-cols-2 gap-4 max-w-2xl pt-8 border-t border-brand-cool-gray mt-8">
              <div>
                <span className="text-[10px] text-brand-slate/40 uppercase tracking-wider block font-mono">{t("Firma", "Company")}</span>
                <span className="font-bold text-brand-slate text-sm">{evaluation.companyName}</span>
              </div>
              <div>
                <span className="text-[10px] text-brand-slate/40 uppercase tracking-wider block font-mono">{t("Odvětví", "Industry")}</span>
                <span className="font-bold text-brand-slate text-xs">{evaluation.industry || t("Zpracovatelský průmysl", "Manufacturing Industry")}</span>
              </div>
              <div>
                <span className="text-[10px] text-brand-slate/40 uppercase tracking-wider block font-mono">{t("Velikost firmy", "Company size")}</span>
                <span className="font-bold text-brand-slate text-xs">{evaluation.size || t("Nezadána", "Not specified")}</span>
              </div>
              <div>
                <span className="text-[10px] text-brand-slate/40 uppercase tracking-wider block font-mono">{t("Skóre RESONETI Indexu", "RESONETI Index Score")}</span>
                <span className="font-bold text-brand-slate text-sm font-display">{evaluation.overallScore}%</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-8 text-xs text-brand-slate/50 flex justify-between">
            <span>{t("Diagnostický nástroj RESONETI® Index", "RESONETI® Index Diagnostic Tool")}</span>
            <span className="underline font-medium">www.RESONETI.com</span>
          </div>
        </div>

        {/* Core Printable Contents page */}
        <div className="space-y-6 pt-10">
          <div className="print-header hidden print:flex">
            <span className="text-xs font-bold text-brand-slate">RESONETI Index Report: {evaluation.companyName}</span>
            <span className="text-xs font-mono">Celkové skóre: {evaluation.overallScore}%</span>
          </div>

          {/* HTML Render fallback */}
          <div className="prose max-w-none text-brand-slate font-sans print-card-break" 
               dangerouslySetInnerHTML={{ __html: evaluation.rawHtmlReport }} />

          <div className="print-footer hidden print:flex">
            <span>{t("© RESONETI.com | Průvodci technologickou změnou s lidským přístupem", "© RESONETI.com | Guides to technological change with a human approach")}</span>
            <span>RESONETI.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
