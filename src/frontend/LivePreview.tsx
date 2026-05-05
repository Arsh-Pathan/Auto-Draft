"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import { renderReportHtml } from "@/templates/report.html";
import type { ReportPayload } from "@/types/report";

type Props = { 
  payload: ReportPayload;
  onPreviewEdit?: (id: string, field: string, value: any) => void;
};

export function LivePreview({ payload, onPreviewEdit }: Props) {
  const [assetBaseUrl, setAssetBaseUrl] = useState("http://localhost:3000/");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isEditingRef = useRef(false);

  const html = useMemo(() => {
    return renderReportHtml(payload, { assetBaseUrl });
  }, [payload, assetBaseUrl]);

  const [debounced, setDebounced] = useState(html);

  useEffect(() => {
    setAssetBaseUrl(`${window.location.origin}/`);
  }, []);

  useEffect(() => {
    if (isEditingRef.current) return;
    const id = setTimeout(() => setDebounced(html), 150);
    return () => clearTimeout(id);
  }, [html]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'PREVIEW_EDIT') {
        isEditingRef.current = true;
        if (onPreviewEdit) {
          onPreviewEdit(e.data.id, e.data.field, e.data.value);
        }
        setTimeout(() => { isEditingRef.current = false; }, 1000);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onPreviewEdit]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2 px-2 pt-2">
        <span className="text-sm font-medium text-gray-500">
          You can directly click and type inside this preview to make quick edits.
        </span>
      </div>
      <div className="rounded border border-gray-300 bg-[#e5e7eb] shadow-sm overflow-hidden h-[80vh]">
        <iframe
          ref={iframeRef}
          title="Report preview"
          srcDoc={debounced}
          className="preview w-full h-full"
        />
      </div>
    </div>
  );
}
