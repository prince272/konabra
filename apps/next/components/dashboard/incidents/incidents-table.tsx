import React from "react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { Pagination } from "@heroui/pagination";
import { Spinner } from "@heroui/spinner";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table";
import { cn } from "@heroui/theme";
import { Icon } from "@iconify-icon/react";
import { formatDistanceToNow } from "date-fns";
import { upperFirst } from "lodash";
import { Incident, IncidentSeverities } from "@/services/incident-service";
import { Remount } from "@/components/common/remount";

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
  onDelete
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
        <TableColumn>CATEGORY</TableColumn>
        <TableColumn>TIME</TableColumn>
        <TableColumn>SEVERITY</TableColumn>
        <TableColumn>REPORTER</TableColumn>
        <TableColumn>LOCATION</TableColumn>
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
            <TableCell className="text-nowrap">{incident.category?.name}</TableCell>
            <TableCell className="text-nowrap">
              <div className="flex items-center gap-2">
                <Icon icon="solar:clock-circle-broken" width="20" height="20" />
                <Remount interval={1000}>
                  {() => {
                    return incident.reportedAt
                      ? upperFirst(
                          formatDistanceToNow(new Date(incident.reportedAt), { addSuffix: true })
                        )
                      : "N/A";
                  }}
                </Remount>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    {
                      low: "bg-secondary",
                      medium: "bg-warning",
                      high: "bg-danger"
                    }[incident.severity]
                  )}
                ></div>
                {IncidentSeverities.find((severity) => severity.value == incident.severity)?.label}
              </div>
            </TableCell>
            <TableCell className="text-nowrap">
              {incident.reportedBy ? (
                <div className="flex items-center gap-2">
                  <Icon icon="solar:user-broken" width="20" height="20" />
                  {incident.reportedBy.fullName}
                </div>
              ) : (
                "N/A"
              )}
            </TableCell>
            <TableCell className="text-nowrap">
              {incident.location ? (
                <div className="flex items-center gap-2">
                  <Icon icon="solar:map-point-broken" width="20" height="20" />
                  {incident.location}
                </div>
              ) : (
                "N/A"
              )}
            </TableCell>
            <TableCell>
              <Chip
                color={
                  (
                    {
                      pending: "secondary",
                      investigating: "warning",
                      resolved: "success",
                      falseAlarm: "default"
                    } as const
                  )[incident.status]
                }
                variant="flat"
              >
                {incident.status}
              </Chip>
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
