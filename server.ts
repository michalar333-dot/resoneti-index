import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { DIAGNOSTIC_QUESTIONS } from "./src/data";
import nodemailer from "nodemailer";
import "dotenv/config";

const PORT = Number(process.env.PORT) || 3000;

// Lazy-initialize Gemini AI Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("CRITICAL: GEMINI_API_KEY is not defined in the environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY_DISREGARD",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function sendReportEmail(
  toEmail: string,
  companyName: string,
  overallScore: number,
  htmlReport: string
): Promise<{ success: boolean; simulated: boolean; error?: string }> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || "RESONETI Index <no-reply@resoneti.com>";

  if (!host || !user || !pass) {
    console.log(`[Email Simulation] Real mail dispatch is not configured (SMTP_HOST is missing). Skipping.`);
    console.log(`[Email Simulation] To: ${toEmail}`);
    console.log(`[Email Simulation] Subject: Vyhodnocení RESONETI Index pro společnost ${companyName}`);
    console.log(`[Email Simulation] Body contains html and matches RESONETI standards.`);
    return { success: true, simulated: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from,
      to: toEmail,
      subject: `Vyhodnocení RESONETI Index pro společnost ${companyName}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; padding: 20px; }
    .card { max-width: 650px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #e2e8f0; border-top: 6px solid #111827; }
    .logo { font-size: 20px; font-weight: bold; color: #1e293b; margin-bottom: 25px; }
    .badge { display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: bold; margin-bottom: 20px; }
    .score-banner { background-color: #f1f5f9; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 25px; }
    .score-val { font-size: 40px; font-weight: 800; color: #111827; line-height: 1; }
    .score-label { font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 5px; }
    h1, h2, h3 { color: #0f172a; margin-top: 1.5em; }
    h1:first-of-type { margin-top: 0; }
    ul { padding-left: 20px; }
    li { margin-bottom: 8px; }
    .footer { font-size: 12px; color: #64748b; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo" style="font-weight: 900; letter-spacing: -0.05em;">RESONETI INDEX</div>
    <div class="badge">Zpráva úspěšně vygenerována</div>
    <p>Vážený zákazníku,</p>
    <p>Děkujeme za vyplnění diagnostického dotazníku <strong>RESONETI Index</strong> pro společnost <strong>${companyName}</strong>.</p>
    
    <div class="score-banner">
      <div class="score-val">${overallScore}%</div>
      <div class="score-label">ÚROVEŇ PŘIPRAVENOSTI NA ZMĚNU</div>
    </div>
    
    <div style="margin-top: 30px;">
      ${htmlReport}
    </div>
    
    <p style="margin-top: 35px;">Máte-li jakékoliv doplňující dotazy nebo byste rádi výsledky hlouběji prodiskutovali s našimi konzultanty, neváhejte si rezervovat nezávaznou bezplatnou schůzku:</p>
    <p style="text-align: center; margin: 25px 0;">
      <a href="https://bookings.cloud.microsoft/bookwithme/user/15c729a7dbbc41668ef3f6905c2ec409%40resoneti.com/meetingtype/SEKoDgMNPkqTOMPqL2K45A2?anonymous&ismsaljsauthenabled" 
         target="_blank" rel="noopener noreferrer"
         style="background-color: #111827; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
        Rezervovat schůzku pro rozbor
      </a>
    </p>

    <div class="footer">
      S úctou,<br>
      <strong>Tým RESONETI</strong><br>
      Průvodci technologickou změnou s lidským přístupem<br>
      <a href="https://www.resoneti.com" style="color: #64748b; text-decoration: underline;">www.resoneti.com</a>
    </div>
  </div>
</body>
</html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Dispatch] Email sent successfully with messageId: ${info.messageId} to ${toEmail}`);
    return { success: true, simulated: false };
  } catch (err: any) {
    console.error(`[Email Dispatch Error] Failed to send email to ${toEmail}:`, err);
    return { success: false, simulated: false, error: err?.message || String(err) };
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API endpoint for evaluating the RESONETI Index
  app.post("/api/evaluate", async (req, res): Promise<any> => {
    try {
      const { answers, metadata, rawText, userEmail } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      // Fallback response if API key is missing or dummy
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "MOCK_KEY_DISREGARD") {
        console.warn("Using fallback diagnostic data because GEMINI_API_KEY is missing or unconfigured.");
        // Simulate a delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        // Return highly polished mock feedback matching RESONETI principles dynamically
        const mockScore = answers ? calculateDeterministicScore(answers) : 68;
        const mockRatings = answers ? calculateDimensionRatings(answers) : { readiness: 75, response: 65, resistance: 55, results: 70 };
        const mockCompanyName = metadata?.companyName || "Vaše firma";

        // Group the actual user choice questions to dynamically build strengths, weaknesses, and recommendations!
        const dynamicStrengths: string[] = [];
        const dynamicWeaknesses: string[] = [];
        const dynamicRecommendations: { title: string; description: string; actions: string[] }[] = [];

        DIAGNOSTIC_QUESTIONS.forEach((q) => {
          const val = answers ? parseInt(answers[q.id], 10) : 3;
          const titleVal = typeof q.title === "string" ? q.title : q.title.cs;
          const cleanTitle = titleVal.replace(/^\d+\.\s*/, ""); // remove leading number
          const comment = answers ? answers[`${q.id}_comm`] : "";
          const commentSuffix = comment ? ` (Komentář: "${comment}")` : "";

          if (val === 3 || val === 4) {
            dynamicStrengths.push(`${cleanTitle}${commentSuffix}`);
          } else if (val === 1 || val === 2) {
            const shortTitle = titleVal;
            dynamicWeaknesses.push(`${cleanTitle}${commentSuffix}`);

            let recTitle = `Opatření pro: ${cleanTitle}`;
            let recDesc = `Zvolili jste hodnocení ${val}/4 v otázce: "${shortTitle}". K posílení této oblasti doporučujeme ošetřit lidskou složku transformace v kategorii ${q.category.toUpperCase()}.`;
            let recActions = [
              `Podniknout okamžitý rozbor s týmovými leadery pro: ${cleanTitle}`,
              `Zavést zpětnovazební smyčky a komunikovat smysl změny k odstranění tohoto rizika.`
            ];

            if (q.id === "q37") {
              recTitle = "Plán na udržení změny do budoucna";
              recDesc = "Vytvořte si plán na udržení změny do budoucna, tak aby se změna stala součástí pracovních procesů a návyků.";
              recActions = [
                "sledujte pečlivě vývoj adopce dle stanovených KPIs",
                "Sledujte chybovost a vyhodnocujte ji",
                "vyhodnocujte pravidelně spokojenost lidí v novém fungování a upravujte aktivity dle toho",
                "uplatňujte radu, jak více oslavovat úspěch k posílení morálky"
              ];
            } else if (q.id === "q38") {
              recTitle = "Sledování a prezentace drobných vítězství";
              recDesc = "Identifikovali jste rezervy v rychlých výhrách. Doporučujeme: sledujte a komunikujte quick wins.";
              recActions = [
                "Sledovat a komunikovat quick wins v jednotlivých týmech.",
                "aktivně se zaměřte na to, abyste více oslavovali úspěch"
              ];
            } else if (q.category === "results") {
              recActions = [
                "sledujte pečlivě vývoj adopce dle stanovených KPIs",
                "Sledujte chybovost a vyhodnocujte ji",
                "vyhodnocujte pravidelně spokojenost lidí v novém fungování a upravujte aktivity dle toho",
                "více oslavujte úspěch celého týmu"
              ];
            }

            dynamicRecommendations.push({
              title: recTitle,
              description: recDesc,
              actions: recActions
            });
          }
        });

        // Slice lists to match optimal report layout length while maintaining 100% adherence to 1-2 vs 3-4 rules
        const finalStrengths = dynamicStrengths.length > 0 ? dynamicStrengths.slice(0, 5) : ["Žádné (všechny odpovídající otázky měly nízké hodnocení)"];
        const finalWeaknesses = dynamicWeaknesses.length > 0 ? dynamicWeaknesses.slice(0, 5) : ["Žádná kritická transformační rizika nebyla zjištěna (všechny odpovědi jsou silné)."];
        const finalRecs = dynamicRecommendations.slice(0, 3);

        // If no weaknesses, give a high quality prevention advice (as requested by rule 3)
        if (finalRecs.length === 0) {
          finalRecs.push({
            title: "Udržování vysokého standardu transformace",
            description: "Dosáhli jste optimálního skóre ve všech hodnocených krocích. Zaměřte se na preventivní kontroly nálady a zapojení klíčových lídrů dvakrát ročně.",
            actions: [
              "Provádět pravidelné retrospektivní sdílení dobré praxe.",
              "Vytvořit dlouhodobý plán rozvoje pro motivování a zapojení lídrů změn."
            ]
          });
        }

        let verbalAssessment = "";
        let fallbackSummarySub = "";
        if (mockScore >= 84) {
          verbalAssessment = "VYSOKÁ PŘIPRAVENOST NA ZMĚNU";
          fallbackSummarySub = "Skvělý transformativní základ s výtečnou strukturou a zájmem lidí podle standardů metodiky Resoneti index.";
        } else if (mockScore >= 67) {
          verbalAssessment = "DOBRÁ PŘIPRAVENOST, DOPORUČENÉ CÍLENÉ POSÍLENÍ V URČITÝCH OBLASTECH";
          fallbackSummarySub = "Dobrý základ v lidské i technické rovině s doporučeným posílením v určitých oblastech.";
        } else if (mockScore >= 34) {
          verbalAssessment = "ZÁKLADNÍ PŘIPRAVENOST, VÝZNAMNÉ MEZERY";
          fallbackSummarySub = "Základní úroveň připravenosti, ale s významnými mezerami a riziky rezistence.";
        } else {
          verbalAssessment = "VYSOKÉ RIZIKO SELHÁNÍ ZMĚNY";
          fallbackSummarySub = "Vysoké riziko selhání technologické změny – lidská strana transformace je kriticky opomíjená.";
        }

        const dynamicHtmlReport = `
<h1>Výsledky vašeho RESONETI Indexu za společnost ${mockCompanyName} (Fallback analýza)</h1>
<p>Děkujeme za vyhodnocení. Tato zpráva zrcadlí strategickou připravenost vaší společnosti na technologické změny s důrazem na její lidskou část podle standardů metodiky RESONETI Index.</p>
<p>Vaše celkové skóre indexu činí <strong>${mockScore} %</strong> (${verbalAssessment}).</p>

<h2>Vaše silné stránky</h2>
<p>Následující oblasti vykazují vysokou úroveň připravenosti a stability (zvolené odpovědi s hodnocením 3 nebo 4):</p>
<ul>
  ${finalStrengths.map(s => `<li><strong>${s}</strong> — Oblast je hodnocena optimálně a podporuje cíle vaší transformace.</li>`).join("")}
</ul>

<h2>Prostor pro zlepšení</h2>
<p>Zde identifikujeme slabá místa nebo transformační rizika, která vyžadují vaši pozornost (zvolené odpovědi s hodnocením 1 nebo 2):</p>
<ul>
  ${finalWeaknesses.map(w => `<li><strong>${w}</strong> — Tato oblast vykazuje zvýšenou tenzi nebo nedostatečné ošetření lidské stránky změny.</li>`).join("")}
</ul>

<h2>Doporučení pro úspěšnou technologickou změnu</h2>
<p>Následující konkrétní opatření a kroky ke zlepšení jsou připraveny na základě výše zjištěných rizik a slabých stránek (s hodnocením 1 nebo 2):</p>
<ul>
  ${finalRecs.map(r => `<li>
    <strong>${r.title}:</strong> ${r.description}
    <br/><em>Doporučené kroky:</em>
    <ul>
      ${r.actions.map(act => `<li>${act}</li>`).join("")}
    </ul>
  </li>`).join("")}
</ul>

<p><strong>Závěr:</strong> Úspěšná transformace se v RESONETI neměří objemem zakoupeného softwaru, ale procentem lidí, kteří jej přijali za svůj. S cílenými kroky k humanizaci transformace můžete eliminovat skryté náklady za nevyužité licence a vyhoření týmu.</p>
        `.trim();

        const targetEmail = userEmail || metadata?.userEmail || "";
        if (targetEmail) {
          sendReportEmail(targetEmail, mockCompanyName, mockScore, dynamicHtmlReport)
            .catch(err => console.error("Async email send failed on fallback handler:", err));
        }

        return res.json({
          success: true,
          mode: "offline_demo",
          evaluation: {
            companyName: mockCompanyName,
            industry: metadata?.industry || "Služby/Výroba",
            size: metadata?.size || "Střední (50-249)",
            overallScore: mockScore,
            dimensionScores: mockRatings,
            summary: `Společnost ${mockCompanyName} má vypracovanou analýzu připravenosti. Celkový RESONETI Index dosahuje hodnoty ${mockScore}% (${verbalAssessment}). ${fallbackSummarySub}`,
            strengths: finalStrengths,
            weaknesses: finalWeaknesses,
            recommendations: finalRecs,
            conclusion: `S dosaženým výsledkem ${mockScore}% a zařazením do kategorie "${verbalAssessment}" máte jasná vodítka. Pro hlubší rozbor doporučujeme osobní diskuzi s našimi konzultanty.`,
            rawHtmlReport: dynamicHtmlReport
          }
        });
      }

      const client = getGeminiClient();

      // Group answers into lists of strengths and weaknesses based on values 1-2 and 3-4
      const strengthsQuestions: string[] = [];
      const weaknessesQuestions: string[] = [];

      if (answers) {
        DIAGNOSTIC_QUESTIONS.forEach((q) => {
          const val = answers[q.id];
          const comment = answers[`${q.id}_comm`];
          const displayStr = `Otázka ${q.id} ("${q.title}") [oblast ${q.category.toUpperCase()}] - Hodnocení ${val ?? "Nezadáno"}/4 ${comment ? `(komentář: "${comment}")` : ""}`;
          
          if (val === 1 || val === 2) {
            weaknessesQuestions.push(displayStr);
          } else if (val === 3 || val === 4) {
            strengthsQuestions.push(displayStr);
          }
        });
      }

      const companyContext = `
Zde jsou reálné odpovědi firmy z dotazníku 'RESONETI INDEX':
Název firmy: ${metadata?.companyName || "Nezadáno"}
Odvětví: ${metadata?.industry || "Nezadáno"}
Velikost firmy: ${metadata?.size || "Nezadáno"}
Uživatelská role: ${metadata?.role || "Nezadáno"}

Doplňující kontexty od uživatele:
- Hlavní vnímané překážky omezující úspěch změny (bariéry): "${rawText || ""}"

--- SEZNAM ODPOVĚDÍ ROZDĚLENÝ STRKTNĚ PODLE HODNOCENÍ (ŠKÁLA 1 - 4) ---

SILNÉ OBLASTI (Hodnocení 3 a 4):
${strengthsQuestions.length > 0 ? strengthsQuestions.map(s => `- ${s}`).join("\n") : "Žádné (všechny odpovědi jsou slabé)"}

SLABÉ OBLASTI / PROSTOR PRO ZLEPŠENÍ (Hodnocení 1 a 2):
${weaknessesQuestions.length > 0 ? weaknessesQuestions.map(w => `- ${w}`).join("\n") : "Žádné (všechny odpovědi jsou silné)"}
`;

      const prompt = `
Jsi špičkový AI konzultant, psycholog práce a transformační stratég pracující pro společnost RESONETI (https://resoneti.com).
Tvojí klíčovou specializací je provázení firem technologickými / softwarovými změnami tak, aby byly lidmi skutečně přijaté s pochopením, klidem a nadšením.
Věříš v metodiku RESONETI INDEX:
- R1: READINESS (Připravenost): strategické základy, business case, sponzorství, governance a zkušenost. (otázky 1-10)
- R2: RESPONSE (Reakce & Zapojení): aktivní vedení změny, komunikace smyslu, matice dopadů a zapojení. (otázky 11-20)
- R3: RESISTANCE (odpor vůči změně): emoční stránka změny, zapojení manažerů, důvěra ve vedení, psychologická bezpečnost. (otázky 21-30)
- R4: RESULTS (Výsledky & Udržitelnost): projektová realizace, zdroje, mitigace rizik, propojení PM a change managementu, udržitelnost (sustain plan), quick wins. (otázky 31-38)

Tvým úkolem je detailně zanalyzovat dodané odpovědi na 38 otázek a vypracovat špičkovou individuální zpětnou vazbu (RESONETI Index Report).

Pokud uživatel vložil data, vypočítej matematicky správně skóre na základě jeho odpovědí (škála 1-4):
- R1 Readiness: Průměr otázek 1-10 × 25
- R2 Response: Průměr otázek 11-20 × 25
- R3 Resistance: Průměr otázek 21-30 × 25
- R4 Results: Průměr otázek 31-38 × 25
- Celkový RESONETI Index (overallScore): Průměr všech 4 výše uvedených oblastí.

INTERPRETACE CELKOVÉHO SKÓRE (overallScore):
Při psaní shrnutí ('summary') a celkového textu 'rawHtmlReport' ohodnoť připravenost firmy podle tohoto nového klíče:
- Skóre 0 - 33 %: "VYSOKÉ RIZIKO SELHÁNÍ ZMĚNY" (vysoké riziko selhání změny, proces je technokratický a hrozí nepřijetí lidmi).
- Skóre 34 - 66 %: "ZÁKLADNÍ PŘIPRAVENOST, VÝZNAMNÉ MEZERY" (základní připravenost, ale existují kritické mezery a rizika rezistence).
- Skóre 67 - 83 %: "DOBRÁ PŘIPRAVENOST, DOPORUČENÉ CÍLENÉ POSÍLENÍ V URČITÝCH OBLASTECH" (dobrá připravenost s prostorem pro cílené posílení).
- Skóre 84 - 100 %: "VYSOKÁ PŘIPRAVENOST NA ZMĚNU" (vysoká a robustní připravenost na technologickou změnu).

Zahrň toto přesné slovní hodnocení do shrnutí i do úvodního odstavce / vyhodnocení v 'rawHtmlReport'.

${companyContext}

Vrať strukturovaný JSON (viz schema) v češtině.

STRIKTNÍ JAZYKOVÁ PRAVIDLA PRO VYHODNOCENÍ ODPOVĚDÍ (MANDATORNÍ):
1. Slovo "školení" (a jeho tvary jako "školit", "proškolení", "školící" atd.) je STRIKTNĚ ZAKÁZÁNO. Místo něj vždy a bezvýhradně použij spojení "plán zvyšování adaptace na změnu".
2. Slovo "vynikající" použij v reportu pouze a výhradně u otázek, kde uživatel odpověděl hodnotou 4 (např. "vynikající stav", "vynikající úroveň").
3. Slovo "silná" nebo "silná stránka" použij v textu pouze a opravdu jen tehdy, pokud má daná otázka hodnocení 4. Otázky s hodnocením 3 v žádném případě neoznačuj jako "silné" ani "silná stránka"!
4. Otázky s hodnocením 3 popiš v textu přirozeně, neutrálně, dobře či stabilně, ale STRIKTNĚ bez použití jakéhokoliv hodnotícího adjektiva (nepoužívej u nich slova jako: "vynikající", "silná", "skvělá", "výborná" apod.).
5. Zákaz psaného odkazu na schůzku: V textech polí 'conclusion' ani v 'rawHtmlReport' (např. v závěrečném odstavci <p><strong>Závěr:</strong>...</p>) v žádném případě neuváděj psané odkazy, URL linky (ani tagy <a> vedoucí na Bookings nebo jakékoliv jiné rezervační odkazy) ani výzvy k rezervaci schůzky. Vypusť z textu věty vyloženě pobízející k rozkliknutí rezervačního odkazu, protože rezervační tlačítka v grafickém rozhraní se vykreslují samostatně v UI. Nech v závěru pouze čisté konstatování a inspirující manažerské ujednání, které doplňuje celkový report.
6. Výskyt spojení "Doporučení pro transformaci dle metodiky 4R" nahraď termínem "Doporučení pro transformaci dle Resoneti index".
7. Užívání slova "ambasador" (či "ambasadoři", "ambasadoři změn", "skupina ambasadorů" atd.) je STRIKTNĚ ZAKÁZÁNO v celém výstupu. Místo toho doporuč zapojení "členů týmu", "manažerů" nebo "lídrů změn". Vůbec s tématem ambasadorů nepracuj.
8. Pravidla pro oblast R4 (Výsledky & Udržitelnost / Sustain):
   - Pokud uživatel u otázky 37 (sustain plan) uvedl hodnocení 1 nebo 2 (nebo pokud chybí plán udržitelnosti), musí doporučení v reportu k této otázce obsahovat přesnou formulaci: "Vytvořte si plán na udržení změny do budoucna, tak aby se změna stala součástí pracovních procesů a návyků."
   - Pokud uživatel u otázky 38 (quick wins) uvedl hodnocení 1 nebo 2 (nebo pokud chybí rychlé úspěchy), musí doporučení obsahovat radu: "sledujte a komunikujte quick wins".
   - Vždy do kroků k realizaci (actions) v oblasti R4 začleň tyto konkrétní body:
     a) "sledujte pečlivě vývoj adopce dle stanovených KPIs"
     b) "Sledujte chybovost a vyhodnocujte ji"
     c) "vyhodnocujte pravidelně spokojenost lidí v novém fungování a upravujte aktivity dle toho"
   - Do doporučení či závěru vždy zapracuj radu: "více oslavujte úspěch" (protože firmy tento aspekt v průběhu změn velmi často přehlížejí či podceňují).

STRIKTNÍ PRAVIDLA PRO VYHODNOCENÍ ODPOVĚDÍ (ŠKÁLA 1–4):
Při analýze se striktně řiď následujícím klíčem:
1. Hodnocení 1 a 2 (Slabé stránky / Prostor pro zlepšení):
   - Všechny oblasti/otázky, kde účastník zvolil odpověď s hodnotou 1 nebo 2, zařaď do sekce "Prostor pro zlepšení" (weaknesses).
   - Pouze k těmto zjištěným slabým oblastem (hodnocení 1 nebo 2) následně v sekci "Doporučení" (recommendations) navrhni konkrétní praktické kroky ke zlepšení. Každé doporučení musí přímo řešit nějakou slabou stránku z hodnocení 1 a 2.
2. Hodnocení 3 a 4 (Silné stránky):
   - Všechny oblasti/otázky, kde účastník zvolil odpověď s hodnotou 3 nebo 4, zařaď do sekce "Vaše silné stránky" (strengths).
   - K těmto silným oblastem (hodnocení 3 nebo 4) v žádném případě NEVYTVÁŘEJ na konci reportu ani v poli doporučení žádná doporučení ani akční kroky ke zlepšení. Všechna doporučení musí směřovat výhradně k vylepšení bodů s hodnocením 1 a 2.
3. Pokud by výjimečně v dotazníku nebyly žádné odpovědi s hodnotou 1 nebo 2, navrhni 1-2 doporučení zaměřená na dlouhodobou udržitelnost a stálou prevenci rizik, v opačném případě se striktně řiď doporučeními pouze pro odpovědi s hodnotou 1 a 2.

STRUKTURA JSON POLÍ:
1. 'overallScore': Musí být matematicky vypočtený celkový průměr z oblastí R1, R2, R3, R4 (zaokrouhleno na celé číslo).
2. 'dimensionScores': Musí obsahovat přesně vypočtené hodnoty pro readiness, response, resistance, results (zaokrouhlené na celé číslo).
3. 'summary': Hluboký, trefný a elegantní manažerský přehled situace (1-2 odstavce, přátelský, ale přísně profesionální konzultantský tón RESONETI). Reflektuj doplňující texty (bariéry, zkušenosti), pokud byly zadány!
4. 'strengths': Přesně identifikuj silné stránky plynoucí VÝHRADNĚ z otázek s hodnocením 3 a 4 (zahrň stručné lidské věty, ne jen jména otázek).
5. 'weaknesses': Identifikuj slabá místa nebo drahá transformační rizika plynoucí VÝHRADNĚ z otázek s hodnocením 1 a 2 (zahrň stručné lidské věty, ne jen jména otázek).
6. 'recommendations': Vygeneruj 3 až 4 praktická doporučení CÍLENÁ EXKLUZIVNĚ na body popsané v sekci 'weaknesses' (odpovědi 1 a 2). Každé doporučení musí mít 'title', detailní 'description' (JAK přesně to provést, např. sestavením plánu zvyšování adaptace na změnu) a 'actions' (pole 2 konkrétních drobných úkolů pro lídry k okamžitému spuštění, nepoužívej termín "akční kroky", ale "kroky k realizaci"). V žádném případě nevytvářej doporučení k silným stránkám (odpovědi 3 a 4).
7. 'conclusion': Závěrečné inspirativní lidské slovo s přáním zdaru (STRIKTNĚ bez jakýchkoli textových odkazů na 예약/Bookings nebo schůzky).
8. 'rawHtmlReport': Kompletní, nádherně zformátovaný HTML kód této personalizované zprávy uzpůsobený pro PDF tisk v české gramatice.
   HTML MUSÍ zachovat pevnou sémantickou strukturu nadpisů (h1, h2, p, strong, ul, li) a STRIKTNĚ dodržovat výše uvedené dělení:
   <h1>Výsledky vašeho RESONETI Indexu za společnost [Název firmy]</h1>
   <p>[Celkové zhodnocení, souhrn a analýza kontextu...]</p>
   <h2>Vaše silné stránky</h2>
   <p>Následující oblasti vykazují vysokou úroveň připravenosti a stability (zvolené odpovědi s hodnocením 3 nebo 4):</p>
   <ul>...</ul>
   <h2>Prostor pro zlepšení</h2>
   <p>Zde identifikujeme slabá místa nebo transformační rizika, která vyžadují vaši pozornost (zvolené odpovědi s hodnocením 1 nebo 2):</p>
   <ul>...</ul>
   <h2>Doporučení pro transformaci dle Resoneti index</h2>
   <p>Následující konkrétní opatření a kroky ke zlepšení jsou připraveny na základě výše zjištěných rizik a slabých stránek (s hodnocením 1 nebo 2):</p>
   <ul>...</ul>
   <p><strong>Závěr:</strong> [Závěrečné povzbuzení a inspirativní ujednání bez odkazů na schůzku nebo rezervačních URL]</p>

Do HTML nepřidávej vnější značky <html> ani <body> ani <style>. Odkazy na schůzky v HTML v žádném případě neuváděj.
`;

      const geminiModel = "gemini-3.5-flash"; // Relying on high-perf flash context

      const response = await client.models.generateContent({
        model: geminiModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              companyName: { type: Type.STRING },
              industry: { type: Type.STRING },
              size: { type: Type.STRING },
              overallScore: { type: Type.INTEGER },
              dimensionScores: {
                type: Type.OBJECT,
                properties: {
                  readiness: { type: Type.INTEGER },
                  response: { type: Type.INTEGER },
                  resistance: { type: Type.INTEGER },
                  results: { type: Type.INTEGER },
                },
                required: ["readiness", "response", "resistance", "results"],
              },
              summary: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    actions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["title", "description", "actions"],
                },
              },
              conclusion: { type: Type.STRING },
              rawHtmlReport: { type: Type.STRING, description: "Valid structural HTML formatted report containing tags: h1, h2, p, strong, ul, li" },
            },
            required: [
              "companyName",
              "overallScore",
              "dimensionScores",
              "summary",
              "strengths",
              "weaknesses",
              "recommendations",
              "conclusion",
              "rawHtmlReport",
            ],
          },
        },
      });

      const responseText = response.text || "{}";
      const parsedData = JSON.parse(responseText.trim());

      const targetEmail = userEmail || metadata?.userEmail || "";
      if (targetEmail && parsedData.rawHtmlReport) {
        sendReportEmail(
          targetEmail,
          parsedData.companyName || metadata?.companyName || "Vaše společnost",
          parsedData.overallScore || 0,
          parsedData.rawHtmlReport
        ).catch(err => console.error("Async email send failed on Gemini handler:", err));
      }

      res.json({
        success: true,
        mode: "gemini_api",
        evaluation: parsedData,
      });
    } catch (error: any) {
      console.error("Error during index evaluation:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Interní chyba při vyhodnocování dotazníku.",
      });
    }
  });

  // Supporting deterministic scoring for offline situations
  function calculateDeterministicScore(answers: any): number {
    const ratings = calculateDimensionRatings(answers);
    return Math.round((ratings.readiness + ratings.response + ratings.resistance + ratings.results) / 4);
  }

  function calculatePillarAverage(answers: any, start: number, end: number): number {
    let sum = 0;
    let count = 0;
    for (let i = start; i <= end; i++) {
      const val = parseInt(answers[`q${i}`], 10);
      if (!isNaN(val)) {
        sum += val;
        count++;
      }
    }
    if (count === 0) return 3; // default is 3 on 1-4 scale
    return sum / count;
  }

  function calculateDimensionRatings(answers: any): { readiness: number; response: number; resistance: number; results: number } {
    const r1 = Math.round(calculatePillarAverage(answers, 1, 10) * 25);
    const r2 = Math.round(calculatePillarAverage(answers, 11, 20) * 25);
    const r3 = Math.round(calculatePillarAverage(answers, 21, 30) * 25);
    const r4 = Math.round(calculatePillarAverage(answers, 31, 38) * 25);

    return {
      readiness: r1,
      response: r2,
      resistance: r3,
      results: r4,
    };
  }

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RESONETI Index Server is running on port ${PORT}`);
  });
}

startServer();
