import React from "react";
import { Button } from "@heroui/button";
import { Pagination } from "@heroui/pagination";
import { Spinner } from "@heroui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from "@heroui/table";
import { cn } from "@heroui/theme";
import { Icon } from "@iconify-icon/react";
import { Role } from "@/services/identity-service";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from "@heroui/dropdown";

interface RolesTableProps {
  roles: Role[];
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  onReload?: () => void;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onPageChange?: (page: number) => void;
}

const RolesTable: React.FC<RolesTableProps> = ({
  roles,
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
      aria-label="Roles table"
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
            showShadow={false}
            radius="full"
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
              <Icon icon="solar:danger-broken" width="64" height="64" className="mb-4 text-foreground-300" />
              <p className="mb-2 text-foreground-500">An error occurred</p>
              <p className="mb-4 text-sm text-foreground-400">
                {errorMessage || "Something went wrong. Please try again later."}
              </p>
              {onReload && (
                <Button
                  color="primary"
                  variant="solid"
                  radius="full"
                  onPress={onReload}
                  startContent={<Icon icon="solar:refresh-broken" width="20" height="20" />}
                >
                  Reload
                </Button>
              )}
            </div>
          ) : (
            <div className="flex h-64 flex-1 flex-col items-center justify-center text-center">
              <Icon
                icon="solar:shield-check-broken"
                className="mb-4 text-6xl text-foreground-300"
              />
              <p className="mb-2 text-foreground-500">No roles found</p>
              <p className="text-sm text-foreground-400">
                {emptyMessage || "No matching results. Please try a different keyword."}
              </p>
            </div>
          )
        }
      >
        {(isError ? [] : roles).map((role) => (
          <TableRow key={role.id}>
            <TableCell className="text-nowrap">{role.name}</TableCell>
            <TableCell>
              <div
                className={cn(
                  "line-clamp-2 truncate text-wrap",
                  !role.description?.trim() && "italic text-default-400"
                )}
              >
                {role.description?.trim() || "No description"}
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
                      <Icon icon="material-symbols:more-vert" width="20" height="20" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Role actions" variant="flat">
                    <DropdownItem
                      key="edit"
                      onClick={() => onEdit(role)}
                      startContent={<Icon icon="solar:pen-new-square-broken" width="20" height="20" />}
                    >
                      Edit
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      color="danger"
                      onClick={() => onDelete(role)}
                      startContent={<Icon icon="solar:trash-bin-trash-broken" width="20" height="20" />}
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

export default RolesTable;
