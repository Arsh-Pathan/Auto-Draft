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
      <div className="h-[80vh] w-full">
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
