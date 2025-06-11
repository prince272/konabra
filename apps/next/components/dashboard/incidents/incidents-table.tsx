import React from "react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { Spinner } from "@heroui/spinner";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table";
import { cn } from "@heroui/theme";
import { formatDistanceToNow } from "date-fns";
import { upperFirst } from "lodash";
import {
  AlertTriangle,
  Clock,
  Edit,
  Folder,
  MapPin,
  MoreVertical,
  RefreshCw,
  Trash2,
  User
} from "lucide-react";
import { Incident, IncidentSeverities } from "@/services/incident-service";
import { Remount } from "@/components/common/remount";

interface IncidentsTableProps {
  incidents: Incident[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  onReload?: () => void;
  onEdit?: (incident: Incident) => void;
  onDelete?: (incident: Incident) => void;
  readOnly?: boolean;
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
  readOnly = false
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
        <TableColumn className={cn("w-16", readOnly && "hidden")}>ACTIONS</TableColumn>
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
              <AlertTriangle size={64} className="mb-4 text-foreground-300" />
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
                  startContent={<RefreshCw size={20} />}
                >
                  Reload
                </Button>
              )}
            </div>
          ) : (
            <div className="flex h-64 flex-1 flex-col items-center justify-center text-center">
              <Folder size={64} className="mb-4 text-foreground-300" />
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
                <Clock size={20} />
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
                  <User size={20} />
                  {incident.reportedBy.fullName}
                </div>
              ) : (
                "N/A"
              )}
            </TableCell>
            <TableCell className="text-nowrap">
              {incident.location ? (
                <div className="flex items-center gap-2">
                  <MapPin size={20} />
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
            <TableCell className={cn("text-right", readOnly && "hidden")}>
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
                  <DropdownMenu aria-label="Incident actions" variant="flat">
                    <DropdownItem
                      key="edit"
                      onPress={() => onEdit?.(incident)}
                      startContent={<Edit size={20} />}
                    >
                      Edit
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      color="danger"
                      onPress={() => onDelete?.(incident)}
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

export default IncidentsTable;
