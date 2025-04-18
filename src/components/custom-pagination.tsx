import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showPageNumbers?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showPageNumbers = true,
}: PaginationProps) {
  // Generate page numbers array with ellipsis logic
  const getPageNumbers = () => {
    const pageNumbers = [];
    const displayPages = 5; // Number of page numbers to display (odd number)
    const ellipsis = -1; // Special value to indicate ellipsis

    if (totalPages <= displayPages) {
      // Show all pages if total pages is less than displayPages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Calculate range around current page
      const leftSideCount = Math.floor((displayPages - 3) / 2);
      const rightSideCount = displayPages - 3 - leftSideCount;

      // Determine start and end page to show
      let startPage = Math.max(2, currentPage - leftSideCount);
      let endPage = Math.min(totalPages - 1, currentPage + rightSideCount);

      // Adjust for edge cases
      if (startPage <= 2) {
        endPage = Math.min(totalPages - 1, displayPages - 2);
      }

      if (endPage >= totalPages - 1) {
        startPage = Math.max(2, totalPages - displayPages + 2);
      }

      // Add ellipsis for left side
      if (startPage > 2) {
        pageNumbers.push(ellipsis);
      }

      // Add page numbers
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis for right side
      if (endPage < totalPages - 1) {
        pageNumbers.push(ellipsis);
      }

      // Always show last page
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <div
      className={cn("flex items-center justify-center space-x-2", className)}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous Page</span>
      </Button>

      {showPageNumbers &&
        getPageNumbers().map((page, index) =>
          page === -1 ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => onPageChange(page)}
              className={cn("h-9 w-9")}
            >
              {page}
            </Button>
          )
        )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next Page</span>
      </Button>
    </div>
  );
}
