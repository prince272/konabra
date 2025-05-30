"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { Input } from "@heroui/input";
import { Pagination } from "@heroui/pagination";
import { Icon } from "@iconify-icon/react";
import { categoryService, Problem } from "@/services";
import { Category, CategoryPaginatedFilter, CreateCategoryForm } from "@/services/category-service";
import { useAsyncMemo } from "@/hooks";
import CategoriesTable from "./categories-table";

type CategoryPageResult = {
  isLoading: boolean;
  data?: {
    items: Category[];
    count: number;
  };
  problem?: Problem;
};

const CategoriesPage = () => {
  const [filter, setFilter] = useState<CategoryPaginatedFilter>({
    offset: 0,
    limit: 20
  });

  const page = useAsyncMemo<CategoryPageResult>(
    async () => {
      const [data, problem] = await categoryService.getPaginatedCategories(filter);
      return { data, problem, isLoading: false };
    },
    [filter],
    { isLoading: true }
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button color="primary" startContent={<Icon icon="lucide:plus" />}>
          Add Category
        </Button>
      </div>

      <Card disableRipple>
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
        <CardBody>
          <CategoriesTable
            categories={page.data?.items || []}
            isLoading={page.isLoading}
            onEdit={() => {}}
            onDelete={() => {}}
          />
          <div className="mt-4 flex w-full justify-center">
            <Pagination isCompact showControls showShadow color="primary" page={1} total={100} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default CategoriesPage;
