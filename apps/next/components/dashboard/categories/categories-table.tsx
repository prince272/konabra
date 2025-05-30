import React from "react";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table";
import { Icon } from "@iconify-icon/react";
import { Category } from "@/services/category-service";

interface CategoriesTableProps {
  categories: Category[];
  isLoading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

interface CategoriesTableRowProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const CategoriesTableRow = ({ category, onEdit, onDelete }: CategoriesTableRowProps) => {
  return (
    <TableRow key={category.id}>
      <TableCell>
        <div className="flex items-center gap-2">
          <span>{category.name}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="max-w-md truncate">{category.description}</div>
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
            <Icon icon="lucide:edit" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="danger"
            onPress={() => onDelete(category)}
            aria-label="Delete category"
          >
            <Icon icon="lucide:trash" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

const CategoriesTable: React.FC<CategoriesTableProps> = ({
  categories,
  isLoading,
  onEdit,
  onDelete
}) => {
  // Render the appropriate content based on state
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <Icon icon="lucide:list-x" className="mb-4 text-6xl text-foreground-300" />
        <p className="mb-2 text-foreground-500">No categories found</p>
        <p className="text-sm text-foreground-400">
          Try adjusting your search or add a new category
        </p>
      </div>
    );
  }

  // Fix: Don't use items prop with custom row rendering
  return (
    <Table
      aria-label="Categories table"
      removeWrapper
      classNames={{
        thead: "sticky top-0 z-10 bg-content1",
        tfoot: "sticky bottom-0 z-10 bg-content1"
      }}
    >
      <TableHeader>
        <TableColumn>NAME</TableColumn>
        <TableColumn>DESCRIPTION</TableColumn>
        <TableColumn className="text-right">ACTIONS</TableColumn>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <CategoriesTableRow
            key={category.id}
            category={category}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default CategoriesTable;
