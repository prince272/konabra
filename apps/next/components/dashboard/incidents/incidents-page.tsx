"use client";

import React, { useCallback, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { Input } from "@heroui/input";
import { Icon } from "@iconify-icon/react";
import { incidentService, Problem } from "@/services";
import { Incident, IncidentPaginatedFilter } from "@/services/incident-service";
import { useAsyncMemo, useDebouncedCallback } from "@/hooks";
import IncidentsTable from "./incidents-table";
import { AddEditIncidentModalRouter } from "./add-edit-incident-modal"; // Optional
import { DeleteIncidentModalRouter } from "./delete-incident-modal";

type IncidentPageResult = {
  items: Incident[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  problem?: Problem;
};

const IncidentsPage = () => {
  const router = useRouter();
  const [filter, setFilter] = useState<IncidentPaginatedFilter & { refresh: number }>({
    offset: 0,
    limit: 25,
    sort: "createdAt",
    order: "desc",
    search: "",
    refresh: 0
  });

  const [searchTerm, setSearchTerm] = useState("");

  const [page, isLoading] = useAsyncMemo<IncidentPageResult>(
    async (prev) => {
      const [data, problem] = await incidentService.getPaginatedIncidents(filter);

      if (problem) return { ...prev, problem };

      const pageNumber = Math.floor(filter.offset / filter.limit) + 1;
      const totalPages = Math.ceil(data.count / filter.limit);

      return {
        items: data.items,
        pageNumber,
        pageSize: filter.limit,
        totalPages,
        problem: undefined
      };
    },
    [filter],
    {
      items: [],
      pageNumber: 1,
      pageSize: filter.limit,
      totalPages: 1,
      problem: undefined
    }
  );

  const resetPage = useCallback(() => {
    setFilter((prev) => ({ ...prev, offset: 0, refresh: prev.refresh + 1 }));
  }, []);

  const updateDebouncedSearch = useDebouncedCallback(
    (value: string) => {
      setFilter((prev) => ({
        ...prev,
        search: value,
        offset: 0,
        refresh: prev.refresh + 1
      }));
    },
    [],
    500
  );

  const clearSearch = () => {
    setSearchTerm("");
    resetPage();
  };

  const updateSort = (key: string) => {
    setFilter((prev) => ({
      ...prev,
      sort: key,
      order: prev.order === "asc" ? "desc" : "asc",
      offset: 0,
      refresh: prev.refresh + 1
    }));
  };

  const changePage = (newPage: number) => {
    setFilter((prev) => ({
      ...prev,
      offset: (newPage - 1) * prev.limit,
      refresh: prev.refresh + 1
    }));
  };

  return (
    <>
      <div className="flex flex-1 flex-col space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Incidents</h1>
          <Button
            color="primary"
            radius="full"
            startContent={<Icon icon="solar:add-circle-broken" />}
            as={NextLink}
            href="#add-incident"
          >
            Add Incident
          </Button>
        </div>
        <Card className="flex-1" disableRipple shadow="none">
          <CardHeader className="flex justify-end">
            <div className="flex w-full items-center justify-end gap-4 sm:w-auto">
              <div className="w-full sm:w-72">
                <Input
                  placeholder="Search incidents..."
                  value={searchTerm}
                  onValueChange={(value) => {
                    setSearchTerm(value);
                    updateDebouncedSearch(value);
                  }}
                  onClear={clearSearch}
                  startContent={<Icon icon="solar:magnifer-broken" />}
                  size="sm"
                  isClearable
                />
              </div>
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="flat"
                    size="sm"
                    startContent={<Icon icon="solar:sort-from-top-to-bottom-broken" />}
                  >
                    Sort
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Sort options"
                  selectionMode="single"
                  selectedKeys={new Set([filter.sort || "createdAt"])}
                  onAction={(key) => updateSort(key as string)}
                >
                  <DropdownItem key="createdAt">Created At</DropdownItem>
                  <DropdownItem key="title">Title</DropdownItem>
                  <DropdownItem key="severity">Severity</DropdownItem>
                  <DropdownItem key="status">Status</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </CardHeader>
          <CardBody className="flex-1">
            <IncidentsTable
              incidents={page.items}
              isLoading={isLoading}
              isError={!!page.problem}
              errorMessage={page.problem?.message}
              onEdit={(incident) => {
                router.push(`#edit-incident-${incident.id}`);
              }}
              onDelete={(incident) => {
                router.push(`#delete-incident-${incident.id}`);
              }}
              page={page.pageNumber}
              pageSize={page.pageSize}
              totalPages={page.totalPages}
              onPageChange={changePage}
              onReload={resetPage}
            />
          </CardBody>
        </Card>
      </div>
      <AddEditIncidentModalRouter onSuccess={resetPage} />
      <DeleteIncidentModalRouter onSuccess={resetPage} />
    </>
  );
};

export default IncidentsPage;
