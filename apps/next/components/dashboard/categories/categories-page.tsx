"use client";

import React, { useCallback, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "@bprogress/next";
import { Button, ButtonGroup } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { Input } from "@heroui/input";
import { Pagination } from "@heroui/pagination";
import { Tooltip } from "@heroui/tooltip";
import _ from "lodash";
import { ChevronDown, PlusCircle, Search, SortAsc, SortDesc } from "lucide-react";
import { categoryService, Problem } from "@/services";
import { Category, CategoryPaginatedFilter } from "@/services/category-service";
import { useAsyncMemo, useDebouncedCallback } from "@/hooks";
import { AddEditCategoryModalRouter } from "./add-edit-category-modal";
import CategoriesTable from "./categories-table";
import { DeleteCategoryModalRouter } from "./delete-category-modal";

type CategoryPageResult = {
  items: Category[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  problem?: Problem;
};

const CategorySortFields = [
  { label: "Name", value: "name" },
  { label: "Created At", value: "createdAt" },
  { label: "Updated At", value: "updatedAt" },
  { label: "Order", value: "order" }
] as const;

const CategoriesPage = () => {
  const router = useRouter();
  const [filter, setFilter] = useState<CategoryPaginatedFilter & { refresh: number }>({
    offset: 0,
    limit: 25,
    sort: null,
    order: null,
    search: "",
    refresh: 0
  });

  const [searchTerm, setSearchTerm] = useState("");

  const [page, isLoading] = useAsyncMemo<CategoryPageResult>(
    async (prevValue) => {
      const [data, problem] = await categoryService.getPaginatedCategories(filter);

      if (problem) {
        return { ...prevValue, problem };
      }

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
    } as CategoryPageResult
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
    setFilter((prev) => ({
      ...prev,
      search: "",
      offset: 0,
      refresh: prev.refresh + 1
    }));
  };

  const updateSort = (key: string) => {
    setFilter((prev) => ({
      ...prev,
      sort: key === "default" ? null : key,
      offset: 0,
      refresh: prev.refresh + 1
    }));
  };

  const toggleOrder = () => {
    setFilter((prev) => ({
      ...prev,
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
      <div className="flex flex-1 flex-col space-y-3 overflow-y-auto">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Categories</h1>
          <Button
            color="primary"
            radius="full"
            startContent={<PlusCircle size={20} />}
            as={NextLink}
            href="#add-category"
          >
            Add Category
          </Button>
        </div>
        <Card className="flex-1 border border-divider" disableRipple shadow="none">
          <CardHeader className="flex justify-end">
            <div className="flex w-full items-center justify-end gap-4 sm:w-auto">
              <div className="w-full sm:w-72">
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onValueChange={(value) => {
                    setSearchTerm(value);
                    updateDebouncedSearch(value);
                  }}
                  onClear={clearSearch}
                  startContent={<Search size={20} />}
                  size="sm"
                  isClearable
                />
              </div>
              <ButtonGroup size="sm" variant="flat">
                <Tooltip content={`Sort ${filter.order === "asc" ? "descending" : "ascending"}`}>
                  <Button isIconOnly onPress={() => toggleOrder()}>
                    {filter.order === "asc" ? <SortAsc size={20} /> : <SortDesc size={20} />}
                  </Button>
                </Tooltip>
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="flat" size="sm" endContent={<ChevronDown size={20} />}>
                      {CategorySortFields.find((f) => f.value === filter.sort)?.label || "Sort"}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Sort options"
                    selectionMode="single"
                    selectedKeys={new Set([filter.sort ?? "default"])}
                    onAction={(key) => updateSort(key as string)}
                  >
                    <>
                      <DropdownItem key="default">Default</DropdownItem>
                      {CategorySortFields.map((field) => (
                        <DropdownItem key={field.value}>{field.label}</DropdownItem>
                      ))}
                    </>
                  </DropdownMenu>
                </Dropdown>
              </ButtonGroup>
            </div>
          </CardHeader>
          <CardBody className="flex-1">
            <CategoriesTable
              categories={page.items || []}
              isLoading={isLoading}
              isError={!!page.problem}
              errorMessage={page.problem?.message}
              onEdit={(category) => {
                router.push(`#edit-category-${category.id}`);
              }}
              onDelete={(category) => {
                router.push(`#delete-category-${category.id}`);
              }}
              onReload={resetPage}
            />
          </CardBody>
          <CardFooter>
            <div className="mt-auto flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow={false}
                radius="full"
                color="primary"
                page={page.pageNumber}
                total={page.totalPages}
                onChange={(newPage) => changePage?.(newPage)}
              />
            </div>
          </CardFooter>
        </Card>
      </div>
      <AddEditCategoryModalRouter onSuccess={resetPage} />
      <DeleteCategoryModalRouter onSuccess={resetPage} />
    </>
  );
};

export default CategoriesPage;
