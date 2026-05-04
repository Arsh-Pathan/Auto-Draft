"use client";
import { useEffect, useMemo, useState } from "react";
import { renderReportHtml } from "@/templates/report.html";
import type { ReportPayload } from "@/types/report";

type Props = { payload: ReportPayload };

export function LivePreview({ payload }: Props) {
  const [assetBaseUrl, setAssetBaseUrl] = useState("http://localhost:3000/");
  const html = useMemo(
    () => renderReportHtml(payload, { assetBaseUrl }),
    [payload, assetBaseUrl]
  );
  const [debounced, setDebounced] = useState(html);

  useEffect(() => {
    setAssetBaseUrl(`${window.location.origin}/`);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(html), 150);
    return () => clearTimeout(id);
  }, [html]);

  return (
    <div className="rounded border border-gray-300 bg-white shadow-sm overflow-hidden h-[80vh]">
      <iframe
        title="Report preview"
        srcDoc={debounced}
        className="preview w-full h-full"
      />
    </div>
  );
}
