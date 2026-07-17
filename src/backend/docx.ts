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



async function buildHeaderBlock(): Promise<(Paragraph | Table)[]> {
  try {
    const logoPng = await readFile(join(process.cwd(), "public", "logo.png"));
    
    const headerBorder = {
      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    };

    const headerLayoutTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: headerBorder,
      margins: { bottom: 200 },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.CENTER,
              margins: { left: 100, bottom: 200 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [
                    new ImageRun({
                      data: logoPng,
                      transformation: { width: 110, height: 95 },
                      type: "png",
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 75, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.CENTER,
              margins: { bottom: 200, left: 1200 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  spacing: { after: 40 },
                  children: [new TextRun({ text: "DHOLE PATIL COLLEGE OF ENGINEERING", bold: true, size: 28, font: "Calibri" })],
                }),
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  spacing: { after: 20 },
                  children: [new TextRun({ text: "Accredited with Grade A+ by NAAC", bold: true, size: 15, font: "Calibri" })],
                }),
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  spacing: { after: 20 },
                  children: [new TextRun({ text: "ISO 9001:2015 Certified Institute, Approved by A.I.C.T.E New Delhi,", bold: true, size: 15, font: "Calibri" })],
                }),
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  spacing: { after: 20 },
                  children: [new TextRun({ text: "D.T.E. Govt of Maharashtra and Affiliated to Savitribai Phule Pune University, Pune.", bold: true, size: 15, font: "Calibri" })],
                }),
              ],
            }),
          ],
        }),
      ],
    });

    return [
      headerLayoutTable,
      new Paragraph({ spacing: { after: 200 }, children: [] })
    ];
  } catch {
    return [];
  }
}


export async function buildDocx(
  payload: ReportPayload,
  images: ProcessedImage[]
): Promise<Buffer> {
  const { meta, ai, signatories, photographs } = payload;
  const headerBlock = await buildHeaderBlock();
  const isApp = meta.docType === "application";

  const docChildren: (Paragraph | Table)[] = [];

  if (isApp) {
    // Application Letter Layout
    docChildren.push(...headerBlock);

    // Date (aligned right)
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 120, after: 240 },
        children: [
          new TextRun({
            text: `Date: ${formatDateShort(meta.date)}`,
            font: "Calibri",
            size: 22, // 11pt
            bold: true,
          }),
        ],
      })
    );

    // To Recipient
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 60 },
        children: [
          new TextRun({ text: "To,", bold: true, font: "Calibri", size: 22 }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: `${meta.recipient || "The Principal,"}\nDhole Patil College of Engineering,\nPune.`,
            font: "Calibri",
            size: 22,
          }),
        ],
      })
    );

    // Subject
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 180 },
        children: [
          new TextRun({ text: "Subject: ", bold: true, font: "Calibri", size: 22 }),
          new TextRun({
            text: meta.title || "Application Request",
            bold: true,
            font: "Calibri",
            size: 22,
            underline: { type: UnderlineType.SINGLE },
          }),
        ],
      })
    );

    // Salutation
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 120 },
        children: [
          new TextRun({ text: "Respected Sir/Madam,", font: "Calibri", size: 22 }),
        ],
      })
    );
  } else {
    // Standard Report Layout
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
      keepNext: true,
      spacing: { before: 360, after: 240 },
      children: [
        new TextRun({
          text: meta.title,
          bold: true,
          size: 28, // 14pt
          font: "Calibri",
          underline: { type: UnderlineType.SINGLE },
        }),
      ],
    });

    docChildren.push(...headerBlock, headerTable, titleParagraph);
  }

  ai.sections.forEach((sec) => {
    if (sec.heading) {
      docChildren.push(
          new Paragraph({
            keepNext: true,
            spacing: { before: 360, after: 200 },
            children: [
              new TextRun({
                text: sec.heading,
                bold: true,
                size: 28, // 14pt
                font: "Calibri",
              }),
            ],
          })
      );
    }
    
    if (sec.type === "text" && sec.text) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 200 },
          children: [new TextRun({ text: sec.text, font: "Calibri", size: 24 })], // 12pt
        })
      );
    } else if (sec.type === "bullets" && sec.bullets) {
      sec.bullets.forEach((b) => {
        docChildren.push(
          new Paragraph({
            bullet: { level: 0 },
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 120 },
            children: [new TextRun({ text: b, font: "Calibri", size: 24 })], // 12pt
          })
        );
      });
    } else if (sec.type === "table" && sec.table) {
      const docxTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: ALL_BORDERS,
        rows: sec.table.map(r => new TableRow({
          children: r.map(c => new TableCell({
            borders: ALL_BORDERS,
            margins: { top: 60, bottom: 60, left: 60, right: 60 },
            children: [new Paragraph({ children: [new TextRun({ text: c, font: "Calibri", size: 24 })] })]
          }))
        }))
      });
      docChildren.push(docxTable);
      docChildren.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
    } else if (sec.type === "image" && sec.imageIndex !== undefined) {
      const photo = photographs[sec.imageIndex];
      const img = images[sec.imageIndex];
      if (img) {
        const { width, height } = scaleToMaxWidth(img.width, img.height, 420);
        docChildren.push(
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
        docChildren.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 200 },
            children: [
              new TextRun({ text: photo?.caption || "", font: "Calibri", size: 24, underline: { type: UnderlineType.SINGLE } }),
            ],
          })
        );
      }
    }
  });

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
        cantSplit: true,
        children: [
          { role: "Club Advisor", name: signatories.advisor },
          { role: "SDP Head", name: signatories.sdpHead },
          { role: "Principal", name: signatories.principal }
        ].map(
          (sig) =>
            new TableCell({
              width: { size: 33, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: sig.role,
                      bold: true,
                      font: "Calibri",
                      size: 24,
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: sig.name,
                      font: "Calibri",
                      size: 24,
                    }),
                  ],
                }),
              ],
            })
        ),
      }),
    ],
  });

  if (isApp) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({ text: "Yours faithfully,", font: "Calibri", size: 22 }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 480, after: 60 },
        children: [
          new TextRun({ text: meta.senderName || "Applicant", bold: true, font: "Calibri", size: 22 }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 240 },
        children: [
          new TextRun({ text: meta.senderDesignation || "Student", font: "Calibri", size: 22 }),
        ],
      })
    );
  }

  // Add several empty paragraphs for signing space so they can gracefully wrap across pages if needed
  const signingGap = isApp ? 2 : 5;
  for (let i = 0; i < signingGap; i++) {
    docChildren.push(new Paragraph({ text: "" }));
  }
  docChildren.push(signatureTable);

  const doc = new Document({
    creator: "AutoReport",
    title: meta.title,
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 24 },
          paragraph: {
            spacing: { line: 360 },
          },
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
              pageBorderTop: { style: BorderStyle.DOUBLE, size: 8, color: "000000", space: 16 },
              pageBorderBottom: { style: BorderStyle.DOUBLE, size: 8, color: "000000", space: 16 },
              pageBorderLeft: { style: BorderStyle.DOUBLE, size: 8, color: "000000", space: 16 },
              pageBorderRight: { style: BorderStyle.DOUBLE, size: 8, color: "000000", space: 16 },
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  void Footer;
  void HeadingLevel;
  void ALL_BORDERS;

  return await Packer.toBuffer(doc);
}
