"use client";

import React, { useCallback, useMemo, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { Input } from "@heroui/input";
import { Icon } from "@iconify-icon/react";
import { categoryService, Problem } from "@/services";
import { Category, CategoryPaginatedFilter } from "@/services/category-service";
import { useAsyncMemo } from "@/hooks";
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

const CategoriesPage = () => {
  const router = useRouter();
  const [filter, setFilter] = useState<CategoryPaginatedFilter & { refresh: number }>({
    offset: 0,
    limit: 3,
    refresh: 0
  });

  const [page, isLoading] = useAsyncMemo<CategoryPageResult>(
    async () => {
      const [data, problem] = await categoryService.getPaginatedCategories(filter);
      if (problem) {
        return { items: [], pageNumber: 1, pageSize: filter.limit, totalPages: 0, problem };
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
      totalPages: 0,
      problem: undefined
    } as CategoryPageResult
  );

  const resetPage = useCallback(() => {
    setFilter((prev) => ({ ...prev, offset: 0, refresh: prev.refresh + 1 }));
  }, []);

  return (
    <>
      <div className="flex flex-1 flex-col space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Categories</h1>
          <Button
            color="primary"
            startContent={<Icon icon="lucide:plus" />}
            as={NextLink}
            href="#add-category"
          >
            Add Category
          </Button>
        </div>
        <Card className="flex-1" disableRipple shadow="none">
          <CardHeader className="flex justify-end">
            <div className="flex w-full items-center justify-end gap-4 sm:w-auto">
              <div className="w-full sm:w-72">
                <Input
                  placeholder="Search categories..."
                  // value={searchQuery}
                  // onValueChange={setSearchQuery}
                  startContent={<Icon icon="lucide:search" />}
                  size="sm"
                  isClearable
                />
              </div>
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="flat" size="sm" startContent={<Icon icon="lucide:sort" />}>
                    Sort
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Sort options" selectionMode="single">
                  <DropdownItem key="name">Name</DropdownItem>
                  <DropdownItem key="description">Description</DropdownItem>
                </DropdownMenu>
              </Dropdown>
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
              page={page.pageNumber}
              pageSize={page.pageSize}
              totalPages={page.totalPages}
              onPageChange={(newPage) => {
                setFilter((prev) => ({
                  ...prev,
                  offset: (newPage - 1) * prev.limit,
                  refresh: prev.refresh + 1
                }));
              }}
            />
          </CardBody>
        </Card>
      </div>
      <AddEditCategoryModalRouter onSuccess={() => resetPage()} />
      <DeleteCategoryModalRouter onSuccess={() => resetPage()} />
    </>
  );
};

export default CategoriesPage;
