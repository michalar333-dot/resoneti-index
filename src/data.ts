import { PresetProfile } from "./types";

export type Language = "cs" | "en";

export const getLocalized = (
  val: string | { cs: string; en: string },
  language: Language
) => {
  if (typeof val === "string") return val;
  return val[language];
};

export interface QuestionDefinition {
  id: string;
  category: "readiness" | "response" | "resistance" | "results";
  title: string | { cs: string; en: string };
  description: string | { cs: string; en: string };
  answers: {
    value: number;
    text: string | { cs: string; en: string };
  }[];
}

const COMMON_LIKERT_ANSWERS: { value: number; text: { cs: string; en: string } }[] = [
  { value: 4, text: { cs: "Zcela souhlasím — Stav je optimální a proces je stabilně zaveden.", en: "Strongly agree — State is optimal and the process is stably implemented." } },
  { value: 3, text: { cs: "Spíše souhlasím — Funguje to, avšak objevují se drobné mezery.", en: "Agree — It works, but there are minor gaps." } },
  { value: 2, text: { cs: "Spíše nesouhlasím — Existují podstatné nedostatky v realizaci.", en: "Disagree — There are significant gaps in implementation." } },
  { value: 1, text: { cs: "Zcela nesouhlasím — Kritické místo; tato oblast je zcela opomíjena.", en: "Strongly disagree — Critical area; this area is completely overlooked." } }
];

export const DIAGNOSTIC_QUESTIONS: QuestionDefinition[] = [
  // R1: Readiness (Připravenost) (1 - 10)
  {
    id: "q1",
    category: "readiness",
    title: { cs: "1. Máme jasně definovaný obchodní důvod (business case), cíle a přínosy pro tuto změnu.", en: "1. We have a clearly defined business case, goals, and benefits for this change." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q2",
    category: "readiness",
    title: { cs: "2. Máme strukturovaně popsán case for change (odůvodnění změny).", en: "2. We have a structured 'case for change' defined." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q3",
    category: "readiness",
    title: { cs: "3. Existují měřitelné ukazatele úspěchu, které budeme sledovat.", en: "3. There are measurable success indicators that we will track." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q4",
    category: "readiness",
    title: { cs: "4. Je určeno, kdo nese odpovědnost za dosažení přínosů.", en: "4. It is determined who is responsible for achieving the benefits." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q5",
    category: "readiness",
    title: { cs: "5. Role a odpovědnosti v projektu jsou jasně popsány.", en: "5. Project roles and responsibilities are clearly described." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q6",
    category: "readiness",
    title: { cs: "6. Máme stanoveno, kdo je zodpovědný za change management (lidské řízení změny).", en: "6. We have designated who is responsible for change management (the human side of change management)." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q7",
    category: "readiness",
    title: { cs: "7. Je určeno, kdo má rozhodovací pravomoc v klíčových oblastech.", en: "7. It is determined who has decision-making authority in key areas." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q8",
    category: "readiness",
    title: { cs: "8. Organizace má zkušenosti s řízením změn.", en: "8. The organization has experience in managing changes." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q9",
    category: "readiness",
    title: { cs: "9. Minulé změny byly úspěšně dokončeny a udrženy.", en: "9. Past changes were successfully completed and sustained." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q10",
    category: "readiness",
    title: { cs: "10. Máme ponaučení z minulých změn a umíme je aplikovat v současnosti.", en: "10. We have lessons learned from past changes and can apply them today." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },

  // R2: Response (Reakce & Zapojení) (11 - 20)
  {
    id: "q11",
    category: "response",
    title: { cs: "1. Máme jednoho hlavního sponzora s dostatečnou autoritou.", en: "1. We have one main sponsor with sufficient authority." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q12",
    category: "response",
    title: { cs: "2. Sponzor pravidelně komunikuje o významu a cílech změny.", en: "2. The sponsor regularly communicates about the importance and goals of the change." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q13",
    category: "response",
    title: { cs: "3. Vedení společnosti je sladěno ve vnímání důležitosti transformace a aktivně ji podporuje.", en: "3. Company leadership is aligned on the importance of the transformation and actively supports it." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q14",
    category: "response",
    title: { cs: "4. Sponzor aktivně a viditelně podporuje tuto změnu (chová se jako pravý leader změny) a je sladěn s tím, co znamená úspěch.", en: "4. The sponsor actively and visibly supports this change (acts as a true change leader) and is aligned with what success means." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q15",
    category: "response",
    title: { cs: "5. Jsou jasně identifikované skupiny zaměstnanců, které budou změnou nejvíce ovlivněny.", en: "5. Employee groups that will be most affected by the change are clearly identified." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q16",
    category: "response",
    title: { cs: "6. Lidé zasažení změnou vědí, proč je změna nutná a jaká jsou rizika, pokud k ní nedojde.", en: "6. People affected by the change know why it is necessary and what the risks are if it doesn't happen." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q17",
    category: "response",
    title: { cs: "7. Máme plán, jak těmto skupinám pomoci změnu přijmout a adaptovat se.", en: "7. We have a plan to help these groups accept and adapt to the change." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q18",
    category: "response",
    title: { cs: "8. Máme jasný komunikační plán pro jednotlivé fáze změny (kdo, co, kdy a jakým kanálem komunikuje).", en: "8. We have a clear communication plan for each stage of change (who, what, when, and through which channel)." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q19",
    category: "response",
    title: { cs: "9. Zaměstnanci dostávají dostatek informací v pravý čas, aby pochopili, proč se změna děje (nejen co se mění).", en: "9. Employees receive enough information at the right time to understand why the change is happening (not just what is changing)." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q20",
    category: "response",
    title: { cs: "10. Měříme, jak zaměstnanci na komunikaci reagují a upravujeme komunikaci dle aktuální situace.", en: "10. We measure how employees respond to communication and adjust communication based on the current situation." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },

  // R3: Resistance (Odpor vůči změně) (21 - 30)
  {
    id: "q21",
    category: "resistance",
    title: { cs: "1. Zaměstnanci se chtějí proaktivně do změny zapojit.", en: "1. Employees want to proactively get involved in the change." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q22",
    category: "resistance",
    title: { cs: "2. Zaměstnanci vědí, jak mají změnit své chování, aby změna byla úspěšná.", en: "2. Employees know how to change their behavior for the change to be successful." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q23",
    category: "resistance",
    title: { cs: "3. Máme připravený konkrétní přístup, jak identifikovat rezistenci a pracovat s ní.", en: "3. We have a specific approach ready to identify and work with resistance." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q24",
    category: "resistance",
    title: { cs: "4. Manažeři přesně vědí, jaká je jejich role v transformaci a aktivně přispívají k její realizaci.", en: "4. Managers know exactly what their role is in the transformation and actively contribute to its realization." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q25",
    category: "resistance",
    title: { cs: "5. Zaměstnanci mají veškeré dovednosti k tomu, aby mohli změnu úspěšně implementovat.", en: "5. Employees have all the skills to successfully implement the change." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q26",
    category: "resistance",
    title: { cs: "6. V organizaci existuje otevřenost ke změnám a novým způsobům práce.", en: "6. There is openness to change and new ways of working in the organization." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q27",
    category: "resistance",
    title: { cs: "7. Zaměstnanci důvěřují vedení, že změny jsou ku prospěchu organizace i jednotlivců.", en: "7. Employees trust leadership that changes are beneficial to both the organization and individuals." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q28",
    category: "resistance",
    title: { cs: "8. Spolupráce mezi týmy podporuje úspěšné zvládnutí změny (otevřeně sdílí zdroje/know-how).", en: "8. Collaboration between teams supports successful change management (openly sharing resources/know-how)." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q29",
    category: "resistance",
    title: { cs: "9. Zaměstnanci jsou do procesu transformace aktivně zapojeni a přispívají svými návrhy na posílení procesu implementace.", en: "9. Employees are actively involved in the transformation process and contribute their suggestions to strengthen the implementation process." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q30",
    category: "resistance",
    title: { cs: "10. V týmech panuje psychologické bezpečí – lidé se nebojí otevřeně sdílet obavy, pochybnosti nebo problémy související se změnou.", en: "10. There is psychological safety in teams – people are not afraid to openly share concerns, doubts, or issues related to the change." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },

  // R4: Results (Výsledky & Udržitelnost) (31 - 38)
  {
    id: "q31",
    category: "results",
    title: { cs: "1. Rozsah projektu je jasně popsán a komunikován (co je/není součástí změny).", en: "1. The project scope is clearly described and communicated (what is/is not part of the change)." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q32",
    category: "results",
    title: { cs: "2. Máme definované hlavní milníky a realistický harmonogram změny.", en: "2. We have defined key milestones and a realistic change schedule." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q33",
    category: "results",
    title: { cs: "3. Projektový management (technické řízení změny) a change management (lidské řízení změny) jsou vzájemně propojené.", en: "3. Project management (technical change management) and change management (human side of change management) are interconnected." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q34",
    category: "results",
    title: { cs: "4. Jsou k dispozici potřebné zdroje (čas, lidé, rozpočet) na change management (lidské řízení změny).", en: "4. Necessary resources (time, people, budget) are available for change management (the human side of change management)." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q35",
    category: "results",
    title: { cs: "5. Rizika spojená se změnou byla vyhodnocena a máme plán jejich mitigace.", en: "5. Risks associated with the change have been evaluated and we have a mitigation plan." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q36",
    category: "results",
    title: { cs: "6. Existuje mechanismus pro pravidelné sledování pokroku a úspěšnosti změny (nejen splnění technických parametrů, ale i míra přijetí lidmi).", en: "6. There is a mechanism for regularly monitoring the progress and success of the change (not just meeting technical parameters, but also the rate of adoption by people)." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q37",
    category: "results",
    title: { cs: "7. Máme plán, jak udržet změnu v chodu i po oficiálním ukončení projektu (sustain plan) – např. soustavné měření, sledování, jak jsou nové procesy dodržovány, odměňování úspěšných týmů).", en: "7. We have a plan to sustain the change after the official end of the project (sustain plan) – e.g., ongoing measurement, monitoring adherence to new processes, rewarding successful teams)." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  },
  {
    id: "q38",
    category: "results",
    title: { cs: "8. Identifikovali jsme možné „rychlé výhry“ (quick wins) a oslavujeme je pro budování momentum.", en: "8. We have identified possible 'quick wins' and celebrate them to build momentum." },
    description: { cs: "", en: "" },
    answers: COMMON_LIKERT_ANSWERS
  }
];

export const PRESET_PROFILES: PresetProfile[] = [
  {
    id: "pojistovna-direct",
    name: "Astra pojišťovna, a.s. (Finanční sektor)",
    label: "Astra pojišťovna, a.s.",
    description: "Tradiční pojišťovací ústav s 650 zaměstnanci naráží na obrovskou rezistenci likvidátorů a přepážkových pracovníků při přechodu na nový interní systém pro správu pojistných událostí. Lidé se bojí složitosti a komunikační toky pokulhávají.",
    metadata: {
      companyName: "Astra pojišťovna, a.s.",
      industry: "Finanční služby a Pojišťovnictví",
      size: "Velká (250+ zaměstnanců)",
      role: "Ředitelka klientského servisu"
    },
    answers: {
      q1: 2, q2: 1, q3: 2, q4: 1, q5: 2, q6: 2, q7: 1, q8: 2, q9: 2, q10: 1,
      q11: 2, q12: 1, q13: 2, q14: 1, q15: 2, q16: 1, q17: 1, q18: 1, q19: 1, q20: 1,
      q21: 1, q22: 2, q23: 1, q24: 2, q25: 2, q26: 1, q27: 2, q28: 2, q29: 1, q30: 2,
      q31: 2, q32: 2, q33: 1, q34: 1, q35: 2, q36: 1, q37: 1, q38: 1,
      barrier: "Složitost nového IT systému, strach zaměstnanců ze ztráty provizí za rychlost vyřízení a pocit obratu k horšímu bez vysvětlení smyslu.",
      experience: "Před rokem se zaváděl nový chatovací nástroj, polovina týmu jej bojkotovala a nadále komunikovala e-maily, protože nikdo nevysvětlil výhody."
    }
  },
  {
    id: "agilni-startup",
    name: "PixelBoost Digital s.r.o. (Rychlý IT startup)",
    label: "PixelBoost Digital s.r.o.",
    description: "Kreativní agentura o 45 lidech. Lidé bez potíží milují technologie, ale trpí syndromem 'změnové únavy' (change fatigue), protože zakladatel střídá nástroje každých pár měsíců bez procesních pravidel.",
    metadata: {
      companyName: "PixelBoost Digital s.r.o.",
      industry: "IT marketing a Reklama",
      size: "Malá (10-49 zaměstnanců)",
      role: "HR partner & Co-founder"
    },
    answers: {
      q1: 3, q2: 3, q3: 2, q4: 2, q5: 3, q6: 2, q7: 3, q8: 1, q9: 2, q10: 1,
      q11: 3, q12: 2, q13: 3, q14: 2, q15: 3, q16: 2, q17: 1, q18: 2, q19: 2, q20: 2,
      q21: 3, q22: 2, q23: 1, q24: 2, q25: 4, q26: 3, q27: 3, q28: 3, q29: 3, q30: 3,
      q31: 2, q32: 2, q33: 1, q34: 2, q35: 1, q36: 1, q37: 2, q38: 2,
      barrier: "Totální chaos v komunikačních kanálech (Slack, Linear, Notion, WhatsApp). Lidi už nebaví přivykat neustále jinému workflow.",
      experience: "Před třemi týdny jsme migrovali z Asany na ClickUp. Výsledkem je rozdělený tým, půlka píše tam, půlka tam a hoří termíny."
    }
  },
  {
    id: "uspesny-korporat",
    name: "FinSmart holding a.s. (Bankovní korporát)",
    label: "FinSmart holding a.s.",
    description: "Větší finanční dům o 850 lidech zavádějící Salesforce na pobočkovou síť. Perfektní projektové plánování a solidní zapojení sponzora, ale dosti napnuté operativní cíle na zisk a pomalá schvalování.",
    metadata: {
      companyName: "FinSmart holding a.s.",
      industry: "Finanční služby a Bankovnictví",
      size: "Velká (250+ zaměstnanců)",
      role: "Change Manager"
    },
    answers: {
      q1: 3, q2: 3, q3: 4, q4: 3, q5: 3, q6: 4, q7: 4, q8: 3, q9: 4, q10: 3,
      q11: 4, q12: 3, q13: 4, q14: 3, q15: 4, q16: 3, q17: 3, q18: 3, q19: 3, q20: 3,
      q21: 3, q22: 3, q23: 3, q24: 3, q25: 3, q26: 3, q27: 3, q28: 3, q29: 3, q30: 3,
      q31: 4, q32: 3, q33: 3, q34: 3, q35: 3, q36: 3, q37: 3, q38: 3,
      barrier: "Složité vnitřní schvalování, přísná omezení bezpečnosti IT a extrémní vytížení zaměstnanců denními obchodními úkoly.",
      experience: "Migrace na Office 365 proběhla v sedmi po sobě jdoucích vlnách s podporou 'SuperUsers' ambasadorů na pobočkách, což fungovalo skvěle."
    }
  }
];
