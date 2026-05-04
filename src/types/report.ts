import { z } from "zod";

export const ReportDataSchema = z.object({
  overview: z.string().min(40),
  programDetails: z.object({
    description: z.string().min(40),
    bullets: z.array(z.string().min(3)).min(3).max(12),
  }),
  outcome: z.string().min(40),
});

export type ReportData = z.infer<typeof ReportDataSchema>;

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
  academicYear: string;
  semester: string;
  acaRNo: string;
  revNo: string;
  advisor: string;
  sdpHead: string;
  principal: string;
};
