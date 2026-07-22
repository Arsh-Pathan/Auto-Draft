import { z } from "zod";

export const ReportSectionSchema = z.object({
  id: z.string(),
  heading: z.string(),
  type: z.enum(["text", "bullets", "table", "image"]),
  text: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  table: z.array(z.array(z.string())).optional(),
  imageIndex: z.number().optional(),
  imageCaption: z.string().optional(),
});

export type ReportSection = z.infer<typeof ReportSectionSchema>;

export const ReportDataSchema = z.object({
  generatedTitle: z.string().optional(),
  sections: z.array(ReportSectionSchema),
});

export type ReportData = z.infer<typeof ReportDataSchema>;

export type DocType = "report" | "application" | "closing_meeting" | "project_proposal";

export type ReportMeta = {
  college: string;
  academicYear: string;
  semester: string;
  title: string;
  date: string;
  venue: string;
  participants: string;
  acaRNo: string;
  revNo: string;
  docType?: DocType;
  recipient?: string;
  senderName?: string;
  senderDesignation?: string;
  // Closing Meeting fields
  organizedBy?: string;
  facultyCoordinator?: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  eventCoordinator?: string;
  // Project Proposal fields
  projectTrack?: string;
  teamStructure?: string;
  conceptIdea?: string;
  techStack?: string;
  totalFinancialRequest?: string;
  hardwareSourcing?: string;
  labAccess?: string;
  clubLabSpace?: string;
  sprintAgreement?: string;
  vettingProtocol?: string;
  architectureLink?: string;
  sensorDiagramLink?: string;
  videoLinks?: string;
  paperLinks?: string;
  technicalLead?: string;
};

export type Photograph = {
  src: string;
  caption: string;
  width?: number;
  height?: number;
};

export type Signatories = {
  advisor: string;
  sdpHead: string;
  principal: string;
  technicalLead?: string;
  eventCoordinator?: string;
};

export type ReportPayload = {
  meta: ReportMeta;
  ai: ReportData;
  photographs: Photograph[];
  signatories: Signatories;
};

export type FormState = {
  title: string;
  date: string;
  venue: string;
  participants: string;
  highlights: string;
  rawDescription: string;
  instructions: string;
  academicYear: string;
  semester: string;
  acaRNo: string;
  revNo: string;
  advisor: string;
  sdpHead: string;
  principal: string;
  docType?: DocType;
  recipient?: string;
  senderName?: string;
  senderDesignation?: string;
  // Closing Meeting fields
  organizedBy?: string;
  facultyCoordinator?: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  eventCoordinator?: string;
  // Project Proposal fields
  projectTrack?: string;
  teamStructure?: string;
  conceptIdea?: string;
  techStack?: string;
  totalFinancialRequest?: string;
  hardwareSourcing?: string;
  labAccess?: string;
  clubLabSpace?: string;
  sprintAgreement?: string;
  vettingProtocol?: string;
  architectureLink?: string;
  sensorDiagramLink?: string;
  videoLinks?: string;
  paperLinks?: string;
  technicalLead?: string;
};
