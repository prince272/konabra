"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import { addToast } from "@heroui/toast";
import { Icon } from "@iconify-icon/react";
import { categoryService } from "@/services";
import { Category } from "@/services/category-service";
import { categoryStore } from "@/states/categories";
import { useModalRouter } from "@/components/common/modals";

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  onSuccess?: (category: Category) => void;
}

function DeleteCategoryModal({
  isOpen,
  onClose,
  categoryId,
  onSuccess
}: DeleteCategoryModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      const [data, problem] = await categoryService.getCategoryById(categoryId);
      if (!problem) setCategory(data);
      setLoading(false);
    };

    if (isOpen) fetchCategory();
  }, [categoryId, isOpen]);

  const handleDelete = async () => {
    setIsDeleting(true);
    const problem = await categoryService.deleteCategory(categoryId);
    setIsDeleting(false);

    if (problem) {
      addToast({
        title: problem.message || "Failed to delete category.",
        color: "danger"
      });
    } else {
      const deleted = { id: categoryId } as Category;
      addToast({ title: "Category deleted successfully.", color: "success" });
      onSuccess?.(deleted);
      categoryStore.remove(deleted);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
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
    >
      <ModalContent>
        <ModalHeader>
          <h2 className="text-xl font-bold">Delete Category</h2>
        </ModalHeader>
        <ModalBody>
          {loading ? (
            <div className="flex justify-center items-center py-6">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="flex items-start gap-3 text-sm text-foreground-600">
              <Icon
                icon="solar:trash-bin-trash-broken"
                className="mt-0.5 text-danger"
                width="42"
                height="42"
              />
              <p>
                Are you sure you want to delete the category{" "}
                <span className="font-semibold text-foreground">
                  {category?.name || "this category"}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full justify-end gap-3">
            <Button radius="full" variant="flat" onPress={onClose} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              radius="full"
              color="danger"
              onPress={handleDelete}
              isLoading={isDeleting}
              isDisabled={loading}
            >
              Delete
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function DeleteCategoryModalRouter({
  onSuccess
}: {
  onSuccess?: (category: Category) => void;
}) {
  const { closeModal, currentModal, mountedModal } = useModalRouter();

  const isDeleteModal = mountedModal?.startsWith("delete-category-");
  const isOpen = currentModal?.startsWith("delete-category-") || false;

  const categoryId = currentModal?.startsWith("delete-category-")
    ? currentModal.replace("delete-category-", "")
    : "";

  return (
    <>
      {isDeleteModal && categoryId && (
        <DeleteCategoryModal
          isOpen={isOpen}
          onClose={closeModal}
          onSuccess={onSuccess}
          categoryId={categoryId}
        />
      )}
    </>
  );
}
