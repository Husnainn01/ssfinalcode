"use client";
import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
  const showEllipsis = totalPages > 5;
  const pages = showEllipsis 
    ? currentPage > 3 
      ? currentPage > totalPages - 2 
        ? [1, '...', totalPages - 2, totalPages - 1, totalPages]
        : [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
      : [1, 2, 3, 4, 5, '...', totalPages]
    : Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <Pagination className="my-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            className={currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>

        {pages.map((page, index) => (
          <PaginationItem key={index}>
            {page === '...' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                onClick={() => onPageChange(page)}
                isActive={currentPage === page}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext 
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            className={currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationComponent;
