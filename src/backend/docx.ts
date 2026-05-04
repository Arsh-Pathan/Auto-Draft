import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  ImageRun,
  Packer,
  PageOrientation,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  UnderlineType,
  WidthType,
} from "docx";
import type { ReportPayload } from "@/types/report";
import { formatDateLong } from "@/utils/formatDate";
import { scaleToMaxWidth, type ProcessedImage } from "@/services/imagePipeline";
import { CLUB_NAME } from "@/utils/constants";

type CellOpts = { bold?: boolean; shaded?: boolean; width?: number };

const BORDER = {
  style: BorderStyle.SINGLE,
  size: 6,
  color: "000000",
};

const ALL_BORDERS = {
  top: BORDER,
  bottom: BORDER,
  left: BORDER,
  right: BORDER,
};

function cell(text: string, opts: CellOpts = {}): TableCell {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.shaded ? { fill: "F3F4F6" } : undefined,
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: opts.bold, font: "Times New Roman", size: 22 })],
      }),
    ],
  });
}

function headerRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      cell(label, { bold: true, shaded: true, width: 30 }),
      cell(value, { width: 70 }),
    ],
  });
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 26,
        font: "Times New Roman",
        underline: { type: UnderlineType.SINGLE },
      }),
    ],
  });
}

function bodyParagraph(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 120 },
    children: [new TextRun({ text, font: "Times New Roman", size: 24 })],
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, font: "Times New Roman", size: 24 })],
  });
}

function captionPara(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 200 },
    children: [
      new TextRun({ text, italics: true, font: "Times New Roman", size: 20 }),
    ],
  });
}

async function buildHeaderBlock(): Promise<Paragraph[]> {
  try {
    const headerPng = await readFile(join(process.cwd(), "public", "report-header.png"));
    const width = 520;
    const height = Math.round((width * 432) / 2417);

    return [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new ImageRun({
            data: headerPng,
            transformation: { width, height },
            type: "png",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 180 },
        border: { bottom: BORDER },
        children: [
          new TextRun({
            text: `${CLUB_NAME} Activity Report`,
            bold: true,
            font: "Times New Roman",
            size: 21,
          }),
        ],
      }),
    ];
  } catch {
    return [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: `${CLUB_NAME} Activity Report`,
            bold: true,
            font: "Times New Roman",
            size: 24,
          }),
        ],
      }),
    ];
  }
}

export async function buildDocx(
  payload: ReportPayload,
  images: ProcessedImage[]
): Promise<Buffer> {
  const { meta, ai, signatories, photographs } = payload;
  const headerBlock = await buildHeaderBlock();

  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: BORDER,
      bottom: BORDER,
      left: BORDER,
      right: BORDER,
      insideHorizontal: BORDER,
      insideVertical: BORDER,
    },
    rows: [
      headerRow("Academic Year", meta.academicYear),
      headerRow("Semester", meta.semester),
      headerRow("Event Title", meta.title),
      headerRow("Date", formatDateLong(meta.date)),
      headerRow("Venue", meta.venue),
      headerRow("Participants", meta.participants),
      headerRow("ACA/R No.", meta.acaRNo),
      headerRow("Rev No.", meta.revNo),
    ],
  });

  const titleParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 360, after: 240 },
    children: [
      new TextRun({
        text: meta.title,
        bold: true,
        size: 32,
        font: "Times New Roman",
        underline: { type: UnderlineType.SINGLE },
      }),
    ],
  });

  const photoBlocks: Paragraph[] = [];
  if (images.length) {
    photoBlocks.push(sectionHeading("Photographs:"));
    images.forEach((img, i) => {
      const photo = photographs[i];
      const { width, height } = scaleToMaxWidth(img.width, img.height, 420);
      photoBlocks.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 60 },
          children: [
            new ImageRun({
              data: img.buffer,
              transformation: { width, height },
              type: img.mime === "image/png" ? "png" : "jpg",
            } as ConstructorParameters<typeof ImageRun>[0]),
          ],
        })
      );
      photoBlocks.push(captionPara(photo?.caption || `Photograph ${i + 1}`));
    });
  }

  const signatureTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    rows: [
      new TableRow({
        children: [signatories.advisor, signatories.sdpHead, signatories.principal].map(
          (name) =>
            new TableCell({
              width: { size: 33, type: WidthType.PERCENTAGE },
              borders: {
                top: BORDER,
                bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 100 },
                  children: [
                    new TextRun({
                      text: name,
                      bold: true,
                      font: "Times New Roman",
                      size: 22,
                    }),
                  ],
                }),
              ],
            })
        ),
      }),
    ],
  });

  const doc = new Document({
    creator: "AutoReport",
    title: meta.title,
    styles: {
      default: {
        document: {
          run: { font: "Times New Roman", size: 24 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.PORTRAIT },
            margin: { top: 1080, bottom: 1200, left: 1080, right: 1080 },
          },
        },
        children: [
          ...headerBlock,
          headerTable,
          titleParagraph,
          sectionHeading("Overview"),
          bodyParagraph(ai.overview),
          sectionHeading("Program Details"),
          bodyParagraph(ai.programDetails.description),
          ...ai.programDetails.bullets.map(bullet),
          sectionHeading("Overall Outcome"),
          bodyParagraph(ai.outcome),
          ...photoBlocks,
          new Paragraph({ spacing: { before: 480 }, children: [] }),
          signatureTable,
        ],
      },
    ],
  });

  void Footer; // referenced for future header/footer use
  void HeadingLevel;
  void ALL_BORDERS;

  return await Packer.toBuffer(doc);
}
