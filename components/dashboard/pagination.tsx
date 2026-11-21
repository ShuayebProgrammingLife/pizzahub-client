import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pagination({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 pt-2">
      <Button
        variant="secondary"
        size="sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" /> Prev
      </Button>
      <span className="tabular text-sm text-on-surface-variant">
        Page {page} of {pages}
      </span>
      <Button
        variant="secondary"
        size="sm"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        Next <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
