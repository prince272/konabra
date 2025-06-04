import React from "react";
import { Button } from "@heroui/button";
import { Pagination } from "@heroui/pagination";
import { Spinner } from "@heroui/spinner";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table";
import { cn } from "@heroui/theme";
import { Icon } from "@iconify-icon/react";
import { Category } from "@/services/category-service";

interface CategoriesTableProps {
  categories: Category[];
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  onReload?: () => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onPageChange?: (page: number) => void;
}

const CategoriesTable: React.FC<CategoriesTableProps> = ({
  categories,
  page,
  pageSize,
  totalPages,
  isLoading = false,
  isError = false,
  errorMessage,
  emptyMessage,
  onReload,
  onEdit,
  onDelete,
  onPageChange
}) => {
  return (
    <Table
      aria-label="Categories table"
      removeWrapper
      className="flex flex-1"
      classNames={{
        thead: "sticky top-0 z-10 bg-content1",
        tfoot: "sticky bottom-0 z-10 bg-content1"
      }}
      bottomContent={
        <div className="mt-auto flex w-full justify-center pt-4">
          <Pagination
            isCompact
            showControls
            showShadow
            color="primary"
            page={page}
            total={totalPages}
            onChange={(newPage) => onPageChange?.(newPage)}
          />
        </div>
      }
    >
      <TableHeader>
        <TableColumn>NAME</TableColumn>
        <TableColumn>DESCRIPTION</TableColumn>
        <TableColumn className="text-right">ACTIONS</TableColumn>
      </TableHeader>
      <TableBody
        isLoading={isLoading}
        loadingContent={
          <div className="flex h-64 flex-1 items-center justify-center">
            <Spinner size="lg" color="primary" />
          </div>
        }
        emptyContent={
          isError ? (
            <div className="flex h-64 flex-1 flex-col items-center justify-center text-center">
              <Icon icon="solar:bone-broken-broken" className="mb-4 text-6xl text-foreground-300" />
              <p className="mb-2 text-foreground-500">An error occurred</p>
              <p className="mb-4 text-sm text-foreground-400">
                {errorMessage || "Something went wrong. Please try again later."}
              </p>
              {onReload && (
                <Button color="primary" variant="solid" onPress={onReload}>
                  Reload
                </Button>
              )}
            </div>
          ) : (
            <div className="flex h-64 flex-1 flex-col items-center justify-center text-center">
              <Icon icon="solar:list-cross-broken" className="mb-4 text-6xl text-foreground-300" />
              <p className="mb-2 text-foreground-500">No categories found</p>
              <p className="text-sm text-foreground-400">
                {emptyMessage || "No matching results. Please try a different keyword."}
              </p>
            </div>
          )
        }
      >
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell className="text-nowrap">{category.name}</TableCell>
            <TableCell>
              <div
                className={cn(
                  "line-clamp-2 truncate text-wrap",
                  !category.description?.trim() && "italic text-default-400"
                )}
              >
                {category.description?.trim() || "No description"}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-2">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => onEdit(category)}
                  aria-label="Edit category"
                >
                  <Icon icon="solar:edit-broken" />
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={() => onDelete(category)}
                  aria-label="Delete category"
                >
                  <Icon icon="solar:trash-bin-broken" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CategoriesTable;
