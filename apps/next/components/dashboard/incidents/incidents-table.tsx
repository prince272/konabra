import React from "react";
import { Button } from "@heroui/button";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { Pagination } from "@heroui/pagination";
import { Spinner } from "@heroui/spinner";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table";
import { Icon } from "@iconify-icon/react";
import { Incident } from "@/services/incident-service";

interface IncidentsTableProps {
  incidents: Incident[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  onReload?: () => void;
  onEdit: (incident: Incident) => void;
  onDelete: (incident: Incident) => void;
}

const IncidentsTable: React.FC<IncidentsTableProps> = ({
  incidents,
  isLoading = false,
  isError = false,
  errorMessage,
  emptyMessage,
  onReload,
  onEdit,
  onDelete,
}) => {
  return (
    <Table
      aria-label="Incidents table"
      removeWrapper
          isHeaderSticky
      shadow="none"
      className="flex flex-1"
    >
      <TableHeader>
        <TableColumn>TITLE</TableColumn>
        <TableColumn>SEVERITY</TableColumn>
        <TableColumn>STATUS</TableColumn>
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
              <Icon
                icon="solar:danger-broken"
                width="64"
                height="64"
                className="mb-4 text-foreground-300"
              />
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
                icon="solar:folder-with-files-broken"
                width="64"
                height="64"
                className="mb-4 text-foreground-300"
              />
              <p className="mb-2 text-foreground-500">No incidents found</p>
              <p className="text-sm text-foreground-400">
                {emptyMessage || "No matching results. Please try a different filter or search."}
              </p>
            </div>
          )
        }
      >
        {(isError ? [] : incidents).map((incident) => (
          <TableRow key={incident.id}>
            <TableCell className="text-nowrap">{incident.title}</TableCell>
            <TableCell>{incident.severity}</TableCell>
            <TableCell className="capitalize">{incident.status}</TableCell>
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
                  <DropdownMenu aria-label="Incident actions" variant="flat">
                    <DropdownItem
                      key="edit"
                      onClick={() => onEdit(incident)}
                      startContent={
                        <Icon icon="solar:pen-new-square-broken" width="20" height="20" />
                      }
                    >
                      Edit
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      color="danger"
                      onClick={() => onDelete(incident)}
                      startContent={
                        <Icon icon="solar:trash-bin-trash-broken" width="20" height="20" />
                      }
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

export default IncidentsTable;
