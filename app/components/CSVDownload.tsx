import { useEffect, useRef } from "react";

export default function CSVDownload({ csvContent }: { csvContent: string }) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const hasClickedRef = useRef(false);

  useEffect(() => {
    setTimeout(() => {
      if (linkRef.current && !hasClickedRef.current) {
        linkRef.current.click();
        hasClickedRef.current = true;
      }
    }, 500);
  }, []);

  return <a style={{ display: "none" }} href={`data:text/csv;charset=utf-8,${csvContent}`} download="approved-phrases.csv" ref={linkRef}>Download CSV</a>;
}
