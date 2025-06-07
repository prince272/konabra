"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import { cn } from "@heroui/theme";
import { addToast } from "@heroui/toast";
import { Icon } from "@iconify-icon/react";
import { Controller, useForm } from "react-hook-form";
import { categoryService } from "@/services";
import { Category, CreateCategoryForm } from "@/services/category-service";
import { categoryStore } from "@/states/categories";
import { useBreakpoint } from "@/hooks";
import { useModalRouter } from "@/components/common/modals";

interface AddEditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId?: string;
  onSuccess?: (category: Category) => void;
}

function AddEditCategoryModal({
  isOpen,
  onClose,
  categoryId,
  onSuccess
}: AddEditCategoryModalProps) {
  const isSmallScreen = useBreakpoint("sm", "down");
  const isEditMode = Boolean(categoryId);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateCategoryForm>({
    defaultValues: {
      name: "",
      description: ""
    },
    mode: "onChange"
  });

  useEffect(() => {
    if (!isOpen || !categoryId) {
      form.reset({ name: "", description: "" });
      return;
    }

    const loadCategory = async () => {
      setIsLoading(true);

      const [category, problem] = await categoryService.getCategoryById(categoryId);

      setIsLoading(false);

      if (!problem) {
        form.reset(category);
      } else {
        addToast({
          title: "Failed to load category.",
          color: "danger"
        });
        onClose();
      }
    };

    loadCategory();
  }, [isOpen, categoryId, form.reset, onClose]);

  const handleFormSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);

    let category, problem;
    if (isEditMode) {
      [category, problem] = await categoryService.updateCategory(categoryId!, data);
    } else {
      [category, problem] = await categoryService.createCategory(data);
    }

    setIsSubmitting(false);

    if (problem) {
      const errors = Object.entries(problem.errors || {});

      if (errors.length > 0) {
        errors.forEach(([name, message]) => {
          form.setError(name as keyof CreateCategoryForm, {
            type: "manual",
            message
          });
        });
      } else {
        addToast({
          title: problem.message,
          color: "danger"
        });
      }
    } else {
      addToast({
        title: `Category ${isEditMode ? "updated" : "created"} successfully.`,
        color: "success"
      });
      onSuccess?.(category);
      categoryStore.addOrUpdate(category);
      onClose();
    }
  });

  return (
    <Modal
      isOpen={isOpen}
      isDismissable={false}
      onClose={onClose}
      size={isSmallScreen ? "full" : "md"}
      scrollBehavior={"inside"}
      closeButton={
        <Button
          isIconOnly
          variant="light"
          onPress={onClose}
          className="rounded-full text-foreground-500"
        >
          <Icon icon="material-symbols:close-rounded" width="20" height="20" />
        </Button>
      }
      classNames={{
        wrapper: cn(isSmallScreen && "h-full")
      }}
    >
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{isEditMode ? "Edit Category" : "New Category"}</h2>
          </div>
        </ModalHeader>
        <ModalBody className="pb-6">
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-content1">
                <Spinner />
              </div>
            )}
            <form id="category-form" onSubmit={handleFormSubmit} className="space-y-4">
              <Controller
                name="name"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Category Name"
                    placeholder="Enter category name"
                    isInvalid={!!form.formState.errors.name}
                    errorMessage={form.formState.errors.name?.message}
                    disabled={isLoading || isSubmitting}
                  />
                )}
              />
              <Controller
                name="description"
                control={form.control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    label="Description"
                    placeholder="Enter description (optional)"
                    rows={3}
                    isInvalid={!!form.formState.errors.description}
                    errorMessage={form.formState.errors.description?.message}
                    disabled={isLoading || isSubmitting}
                  />
                )}
              />
            </form>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full justify-end gap-3">
            <Button radius="full" variant="flat" onPress={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              radius="full"
              color="primary"
              type="submit"
              form="category-form"
              isLoading={isSubmitting}
              isDisabled={!form.formState.isValid || isSubmitting || isLoading}
            >
              {isEditMode ? "Update" : "Create"} Category
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function AddEditCategoryModalRouter({
  onSuccess
}: {
  onSuccess?: (category: Category) => void;
}) {
  const { closeModal, currentModal, mountedModal } = useModalRouter();

  const isCategoryModal =
    mountedModal === "add-category" || mountedModal?.startsWith("edit-category-");

  const isOpen =
    currentModal === "add-category" || currentModal?.startsWith("edit-category-") || false;

  const categoryId = currentModal?.startsWith("edit-category-")
    ? currentModal.replace("edit-category-", "")
    : undefined;

  return (
    <>
      {isCategoryModal && (
        <AddEditCategoryModal
          isOpen={isOpen}
          onClose={closeModal}
          onSuccess={onSuccess}
          categoryId={categoryId}
        />
      )}
    </>
  );
}
