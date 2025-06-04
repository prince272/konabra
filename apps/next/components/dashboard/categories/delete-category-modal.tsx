"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import { addToast } from "@heroui/toast";
import { Icon } from "@iconify-icon/react";
import { categoryService } from "@/services";
import { Category } from "@/services/category-service";
import { useModalRouter } from "@/components/common/modals";

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  onSuccess?: (category: Category) => void;
}

function DeleteCategoryModal({ isOpen, onClose, categoryId, onSuccess }: DeleteCategoryModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

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
      addToast({
        title: "Category deleted successfully.",
        color: "success"
      });
      onSuccess?.({ id: categoryId } as Category);
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
          <div className="flex items-start gap-3 text-sm text-foreground-600">
            <Icon
              icon="solar:trash-bin-trash-broken"
              className="mt-0.5 text-danger"
              width="42"
              height="42"
            />
            <p>Are you sure you want to delete this category? This action cannot be undone.</p>
          </div>
        </ModalBody>

        <ModalFooter>
          <div className="flex w-full justify-end gap-3">
            <Button radius="full" variant="flat" onPress={onClose} disabled={isDeleting}>
              Cancel
            </Button>
            <Button radius="full" color="danger" onPress={handleDelete} isLoading={isDeleting}>
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
