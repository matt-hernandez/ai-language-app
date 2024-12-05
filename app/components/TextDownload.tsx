import { useEffect, useRef } from "react";

export default function TextDownload({ csvContent }: { csvContent: string }) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const hasClickedRef = useRef(false);

  useEffect(() => {
    setTimeout(() => {
      if (linkRef.current && !hasClickedRef.current) {
        linkRef.current.click();
        hasClickedRef.current = true;
      }
    }, 200);
  }, []);

  return <a style={{ display: "none" }} href={`data:text/csv;charset=utf-8,${csvContent}`} download="approved-phrases.txt" ref={linkRef}>Download Text File</a>;
}
