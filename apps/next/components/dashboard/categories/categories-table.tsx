"use client";

import React from "react";
import { Button } from "@heroui/button";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { Spinner } from "@heroui/spinner";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table";
import { cn } from "@heroui/theme";
import { AlertCircle, Edit, FileStack, MoreVertical, RefreshCw, Trash2 } from "lucide-react";
import { Category } from "@/services/category-service";

interface CategoriesTableProps {
  categories: Category[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  onReload?: () => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const CategoriesTable: React.FC<CategoriesTableProps> = ({
  categories,
  isLoading = false,
  isError = false,
  errorMessage,
  emptyMessage,
  onReload,
  onEdit,
  onDelete
}) => {
  return (
    <Table
      aria-label="Categories table"
      removeWrapper
      isHeaderSticky
      shadow="none"
      className="flex flex-1"
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
              <AlertCircle size={64} className="mb-4 text-foreground-300" />
              <p className="mb-2 text-foreground-500">An error occurred</p>
              <p className="mb-4 text-sm text-foreground-400">
                {errorMessage || "Something went wrong. Please try again."}
              </p>
              {onReload && (
                <Button
                  color="primary"
                  variant="solid"
                  radius="full"
                  onPress={onReload}
                  startContent={<RefreshCw size={20} />}
                >
                  Reload
                </Button>
              )}
            </div>
          ) : (
            <div className="flex h-64 flex-1 flex-col items-center justify-center text-center">
              <FileStack size={64} className="mb-4 text-foreground-300" />
              <p className="mb-2 text-foreground-500">No categories found</p>
              <p className="text-sm text-foreground-400">
                {emptyMessage || "No matching results. Please try a different keyword."}
              </p>
            </div>
          )
        }
      >
        {(isError ? [] : categories).map((category) => (
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
              <div className="flex justify-end">
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      radius="full"
                      aria-label="More actions"
                    >
                      <MoreVertical size={20} />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Category actions" variant="flat">
                    <DropdownItem
                      key="edit"
                      onClick={() => onEdit(category)}
                      startContent={<Edit size={20} />}
                    >
                      Edit
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      color="danger"
                      onClick={() => onDelete(category)}
                      startContent={<Trash2 size={20} />}
                    >
                      Delete
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CategoriesTable;
