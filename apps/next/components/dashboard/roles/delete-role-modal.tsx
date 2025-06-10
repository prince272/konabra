"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import { cn } from "@heroui/theme";
import { addToast } from "@heroui/toast";
import { Trash2, X } from "lucide-react";
import { identityService } from "@/services";
import { Role } from "@/services/identity-service";
import { useBreakpoint } from "@/hooks";
import { useModalRouter } from "@/components/common/modals";

interface DeleteRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleId: string;
  onSuccess?: (role: Role) => void;
}

function DeleteRoleModal({ isOpen, onClose, roleId, onSuccess }: DeleteRoleModalProps) {
  const isSmallScreen = useBreakpoint("sm", "down");
  const [isDeleting, setIsDeleting] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!roleId) return;
      setLoading(true);
      const [data, problem] = await identityService.getRoleById(roleId);
      if (!problem) {
        setRole(data);
      }
      setLoading(false);
    };

    if (isOpen) {
      fetchRole();
    }
  }, [roleId, isOpen]);

  const handleDelete = async () => {
    setIsDeleting(true);
    const problem = await identityService.deleteRole(roleId);
    setIsDeleting(false);

    if (problem) {
      addToast({
        title: problem.message || "Failed to delete role.",
        color: "danger"
      });
    } else {
      addToast({
        title: "Role deleted successfully.",
        color: "success"
      });
      onSuccess?.({ id: roleId } as Role);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      isDismissable={false}
      onClose={onClose}
      size={isSmallScreen ? "full" : "sm"}
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
          <h2 className="text-xl font-bold">Delete Role</h2>
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
                Are you sure you want to delete the role{" "}
                <span className="font-semibold text-foreground">{role?.name}</span>?
                <br />
                This action cannot be undone.
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

export function DeleteRoleModalRouter({ onSuccess }: { onSuccess?: (role: Role) => void }) {
  const { closeModal, currentModal, mountedModal } = useModalRouter();

  const isDeleteModal = mountedModal?.startsWith("delete-role-");
  const isOpen = currentModal?.startsWith("delete-role-") || false;

  const roleId = currentModal?.startsWith("delete-role-")
    ? currentModal.replace("delete-role-", "")
    : "";

  return (
    <>
      {isDeleteModal && roleId && (
        <DeleteRoleModal
          isOpen={isOpen}
          onClose={closeModal}
          onSuccess={onSuccess}
          roleId={roleId}
        />
      )}
    </>
  );
}
