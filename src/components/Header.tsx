/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Users, Cpu, ShieldCheck } from "lucide-react";

interface HeaderProps {
  onOpenAdmin?: () => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  language: "cs" | "en";
  setLanguage: (lang: "cs" | "en") => void;
}

export default function Header({ onOpenAdmin, userEmail, setUserEmail, language, setLanguage }: HeaderProps) {
  const showAdminButton = typeof window !== "undefined" && window.location.search.includes("admin=true");

  return (
    <header className="no-print border-b border-brand-cool-gray bg-white shadow-xs sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand Representation Logo */}
        <div className="flex items-center justify-between gap-3 w-full md:w-auto">
          <div className="flex items-center gap-3">
            {/* ... logo code ... */}
            <div className="w-10 h-10 rounded-xl bg-brand-slate flex items-center justify-center text-brand-lime shadow-md relative overflow-hidden group">
              <Users className="w-5 h-5 absolute z-10 text-brand-lime transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-brand-slate opacity-90"></div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold tracking-tighter text-brand-slate font-sans inline-flex items-center gap-1 uppercase">
                  RESONETI
                  <span className="inline-flex items-center justify-center border border-brand-slate text-[7px] font-black w-3 h-3 rounded-full text-brand-slate leading-none select-none shrink-0" style={{ transform: "translateY(-6.5px)" }}>
                    R
                  </span>
                  {" "}INDEX
                </span>
                <span className="text-xs font-semibold bg-brand-cream-dark/40 text-brand-slate font-mono px-2 py-0.5 rounded-full">
                  Index v2.5
                </span>
              </div>
              <p className="text-[10.5px] text-brand-slate/85">
                {language === "cs" ? "Diagnostický nástroj pro měření připravenosti organizace na změnu dle metodiky RESONETI® Index" : "Diagnostic tool for measuring organization readiness for change according to RESONETI® Index methodology"}
              </p>
            </div>
          </div>
          
          {/* Mobile Admin / Submissions Button */}
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="md:hidden flex items-center gap-1 bg-brand-slate text-brand-lime hover:bg-brand-slate/90 hover:scale-102 transition-all font-bold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer shadow-xs font-mono"
            >
              <span>{language === "cs" ? "📊 Odpovědi" : "📊 Submissions"}</span>
            </button>
          )}
        </div>

        {/* Brand slogan & Core CTA link */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 md:gap-5 text-xs text-brand-slate">
          {/* Language Selector */}
          <div className="flex items-center gap-1">
            <button onClick={() => setLanguage("cs")} className={`px-2 py-1 rounded ${language === "cs" ? "bg-brand-slate text-white" : "bg-brand-cream-light text-brand-slate"}`}>CS</button>
            <button onClick={() => setLanguage("en")} className={`px-2 py-1 rounded ${language === "en" ? "bg-brand-slate text-white" : "bg-brand-cream-light text-brand-slate"}`}>EN</button>
          </div>
          {/* Database / Submissions viewer Button */}
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="hidden md:flex items-center gap-1.5 bg-brand-slate text-brand-lime hover:bg-brand-slate/90 hover:scale-103 transition-all font-bold px-3 py-1.5 rounded-lg text-[11px] cursor-pointer shadow-xs font-mono"
              title={language === "cs" ? "Zobrazit všechny odeslané odpovědi a reporty" : "View all submitted responses and reports"}
            >
              <span>{language === "cs" ? "📊 Přehled odpovědí" : "📊 Submissions"}</span>
            </button>
          )}
          
          <div className="flex items-center gap-1.5 bg-brand-cream-dark/50 text-brand-slate px-3 py-1.5 rounded-lg border border-brand-cool-gray font-semibold">
            <ShieldCheck className="w-4 h-4 text-brand-slate" />
            <span>{language === "cs" ? "Lidé v srdci transformace" : "People at the heart of transformation"}</span>
          </div>
          <a
            href="https://bookings.cloud.microsoft/bookwithme/user/15c729a7dbbc41668ef3f6905c2ec409%40resoneti.com/meetingtype/SEKoDgMNPkqTOMPqL2K45A2?anonymous&ismsaljsauthenabled"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-brand-lime hover:bg-brand-lime dark:bg-brand-lime text-brand-slate hover:scale-103 transition-all font-bold px-3.5 py-1.5 rounded-lg text-[11px] cursor-pointer shadow-xs font-mono"
          >
            <span>{language === "cs" ? "📅 Rezervovat konzultaci" : "📅 Book a consultation"}</span>
          </a>
          <a
            href="https://resoneti.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-slate/80 font-bold transition-colors duration-200 underline underline-offset-4 font-mono text-[11px]"
          >
            {language === "cs" ? "Navštívit RESONETI.com" : "Visit RESONETI.com"}
          </a>
        </div>
      </div>
    </header>
  );
}
