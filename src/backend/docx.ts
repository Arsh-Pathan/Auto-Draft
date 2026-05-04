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
  VerticalAlign,
  WidthType,
} from "docx";
import type { ReportPayload } from "@/types/report";
import { formatDateShort } from "@/utils/formatDate";
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

function headerCell(text: string, opts: { rowSpan?: number; width?: number; alignLeft?: boolean } = {}): TableCell {
  return new TableCell({
    rowSpan: opts.rowSpan,
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
    children: [
      new Paragraph({
        alignment: opts.alignLeft ? AlignmentType.LEFT : AlignmentType.CENTER,
        children: [new TextRun({ text, bold: true, font: "Calibri", size: 24 })],
      }),
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
        font: "Calibri",
        underline: { type: UnderlineType.SINGLE },
      }),
    ],
  });
}

function bodyParagraph(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 120 },
    children: [new TextRun({ text, font: "Calibri", size: 24 })],
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, font: "Calibri", size: 24 })],
  });
}

function captionPara(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 200 },
    children: [
      new TextRun({ text, italics: true, font: "Calibri", size: 20 }),
    ],
  });
}

async function buildHeaderBlock(): Promise<(Paragraph | Table)[]> {
  try {
    const logoPng = await readFile(join(process.cwd(), "public", "logo.png"));
    
    const noBorder = {
      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    };

    const headerLayoutTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: noBorder,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new ImageRun({
                      data: logoPng,
                      transformation: { width: 140, height: 140 },
                      type: "png",
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 75, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  spacing: { after: 60 },
                  children: [new TextRun({ text: "DHOLE PATIL COLLEGE OF ENGINEERING", bold: true, size: 30, font: "Calibri" })],
                }),
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  spacing: { after: 40 },
                  children: [new TextRun({ text: "Accredited with Grade A+ by NAAC", bold: true, size: 16, font: "Calibri" })],
                }),
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  spacing: { after: 40 },
                  children: [new TextRun({ text: "ISO 9001:2015 Certified Institute, Approved by A.I.C.T.E New Delhi,", bold: true, size: 16, font: "Calibri" })],
                }),
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  spacing: { after: 120 },
                  children: [new TextRun({ text: "D.T.E. Govt of Maharashtra and Affiliated to Savitribai Phule Pune University, Pune.", bold: true, size: 16, font: "Calibri" })],
                }),
              ],
            }),
          ],
        }),
      ],
    });

    return [
      headerLayoutTable,
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 180 },
        border: { bottom: BORDER },
        children: [
          new TextRun({
            text: `${CLUB_NAME} Activity Report`,
            bold: true,
            font: "Calibri",
            size: 21,
          }),
        ],
      }),
    ];
  } catch (err) {
    return [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: `${CLUB_NAME} Activity Report`,
            bold: true,
            font: "Calibri",
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
      new TableRow({
        children: [
          headerCell("ACA/R / 56", { width: 25, alignLeft: true }),
          headerCell("Dhole Patil College of Engineering", { rowSpan: 2, width: 50 }),
          headerCell(`AcademicYear:${meta.academicYear}`, { width: 25, alignLeft: true }),
        ],
      }),
      new TableRow({
        children: [
          headerCell("Rev: 00", { alignLeft: true }),
          headerCell(`Semester: ${meta.semester}`, { alignLeft: true }),
        ],
      }),
      new TableRow({
        children: [
          headerCell("Date: 15.12.2016", { alignLeft: true }),
          headerCell("Report"),
          headerCell(`Date- ${formatDateShort(meta.date)}`, { alignLeft: true }),
        ],
      }),
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
        font: "Calibri",
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
                      font: "Calibri",
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
          run: { font: "Calibri", size: 24 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.PORTRAIT },
            margin: { top: 1080, bottom: 1200, left: 1080, right: 1080 },
            borders: {
              pageBorders: {
                display: "allPages",
                offsetFrom: "page",
              },
              pageBorderTop: { style: BorderStyle.DOUBLE, size: 24, color: "000000", space: 24 },
              pageBorderBottom: { style: BorderStyle.DOUBLE, size: 24, color: "000000", space: 24 },
              pageBorderLeft: { style: BorderStyle.DOUBLE, size: 24, color: "000000", space: 24 },
              pageBorderRight: { style: BorderStyle.DOUBLE, size: 24, color: "000000", space: 24 },
            },
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
