"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import { cn } from "@heroui/theme";
import { addToast } from "@heroui/toast";
import { Trash2, X } from "lucide-react";
import { categoryService } from "@/services";
import { Category } from "@/services/category-service";
import { categoryStore } from "@/states/categories";
import { useBreakpoint } from "@/hooks";
import { useModalRouter } from "@/components/common/modals";

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  onSuccess?: (category: Category) => void;
}

function DeleteCategoryModal({ isOpen, onClose, categoryId, onSuccess }: DeleteCategoryModalProps) {
  const isSmallScreen = useBreakpoint("sm", "down");
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
          <X size={20} />
        </Button>
      }
      classNames={{
        wrapper: cn(isSmallScreen && "h-full")
      }}
    >
      <ModalContent>
        <ModalHeader>
          <h2 className="text-xl font-bold">Delete Category</h2>
        </ModalHeader>
        <ModalBody>
          <div className="relative">
            {(loading || isDeleting) && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-content1 bg-opacity-70">
                <Spinner size="lg" />
              </div>
            )}

            <div
              className={`flex items-start gap-3 text-sm text-foreground-600 ${
                loading || isDeleting ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <Trash2 size={42} className="mt-0.5 text-danger" />
              <p>
                Are you sure you want to delete the category{" "}
                <span className="font-semibold text-foreground">
                  {category?.name || "this category"}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
          </div>
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
