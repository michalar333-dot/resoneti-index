/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface QuestionnaireAnswers {
  q1: number;
  q1_comm?: string;
  q2: number;
  q2_comm?: string;
  q3: number;
  q3_comm?: string;
  q4: number;
  q4_comm?: string;
  q5: number;
  q5_comm?: string;
  q6: number;
  q6_comm?: string;
  q7: number;
  q7_comm?: string;
  q8: number;
  q8_comm?: string;
  q9: number;
  q9_comm?: string;
  q10: number;
  q10_comm?: string;
  q11: number;
  q11_comm?: string;
  q12: number;
  q12_comm?: string;
  q13: number;
  q13_comm?: string;
  q14: number;
  q14_comm?: string;
  q15: number;
  q15_comm?: string;
  q16: number;
  q16_comm?: string;
  q17: number;
  q17_comm?: string;
  q18: number;
  q18_comm?: string;
  q19: number;
  q19_comm?: string;
  q20: number;
  q20_comm?: string;
  q21: number;
  q21_comm?: string;
  q22: number;
  q22_comm?: string;
  q23: number;
  q23_comm?: string;
  q24: number;
  q24_comm?: string;
  q25: number;
  q25_comm?: string;
  q26: number;
  q26_comm?: string;
  q27: number;
  q27_comm?: string;
  q28: number;
  q28_comm?: string;
  q29: number;
  q29_comm?: string;
  q30: number;
  q30_comm?: string;
  q31: number;
  q31_comm?: string;
  q32: number;
  q32_comm?: string;
  q33: number;
  q33_comm?: string;
  q34: number;
  q34_comm?: string;
  q35: number;
  q35_comm?: string;
  q36: number;
  q36_comm?: string;
  q37: number;
  q37_comm?: string;
  q38: number;
  q38_comm?: string;
  barrier?: string;
  experience?: string;
  [key: string]: any;
}

export interface CompanyMetadata {
  companyName: string;
  industry: string;
  size: string;
  role: string;
}

export interface DimensionScores {
  readiness: number; // R1 Readiness (Připravenost)
  response: number;  // R2 Response (Reakce & Zapojení)
  resistance: number;// R3 Resistance (Odpor vůči změně)
  results: number;   // R4 Results (Výsledky & Udržitelnost)
}

export interface Recommendation {
  title: string;
  description: string;
  actions: string[];
}

export interface IndexEvaluation {
  companyName: string;
  industry: string;
  size: string;
  overallScore: number;
  dimensionScores: DimensionScores;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: Recommendation[];
  conclusion: string;
  rawHtmlReport: string;
}

export interface DiagnosticResult {
  success: boolean;
  mode: "offline_demo" | "gemini_api";
  evaluation: IndexEvaluation;
}

export interface PresetProfile {
  id: string;
  name: string;
  label: string;
  description: string;
  metadata: CompanyMetadata;
  answers: QuestionnaireAnswers;
}
