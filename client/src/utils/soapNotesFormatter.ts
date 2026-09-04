export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  clinicianName: string;
  date: string;
}

export function formatSOAPNote(note: SOAPNote): string {
  return `[SOAP CLINICAL PROGRESS NOTE]
Date: ${note.date} | Clinician: ${note.clinicianName}
S (Subjective): ${note.subjective}
O (Objective):  ${note.objective}
A (Assessment): ${note.assessment}
P (Plan):        ${note.plan}`;
}
