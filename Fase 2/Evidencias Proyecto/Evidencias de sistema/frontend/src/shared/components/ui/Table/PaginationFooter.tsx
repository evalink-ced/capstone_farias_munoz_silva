import React from "react";
import { Pagination } from "@heroui/pagination";

interface Props {
  page: number;
  pages: number;
  onChange: (newPage: number) => void;
}

const PaginationFooter: React.FC<Props> = ({ page, pages, onChange }) => (
  <div className="flex w-full justify-center">
    <Pagination
      isCompact
      showControls
      showShadow
      color="secondary"
      page={page}
      total={pages}
      onChange={onChange}
    />
  </div>
);

export default PaginationFooter;
