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
import { identityService } from "@/services";
import { CreateRoleForm, Role } from "@/services/identity-service";
import { roleStore } from "@/states/roles";
import { useBreakpoint } from "@/hooks";
import { useModalRouter } from "@/components/common/modals";

interface AddEditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleId?: string;
  onSuccess?: (role: Role) => void;
}

function AddEditRoleModal({ isOpen, onClose, roleId, onSuccess }: AddEditRoleModalProps) {
  const isSmallScreen = useBreakpoint("sm", "down");
  const isEditMode = Boolean(roleId);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateRoleForm>({
    defaultValues: {
      name: "",
      description: ""
    },
    mode: "onChange"
  });

  useEffect(() => {
    if (!isOpen || !roleId) {
      form.reset({ name: "", description: "" });
      return;
    }

    const loadRole = async () => {
      setIsLoading(true);
      const [role, problem] = await identityService.getRoleById(roleId);
      setIsLoading(false);

      if (!problem) {
        form.reset(role);
      } else {
        addToast({
          title: "Failed to load role.",
          color: "danger"
        });
        onClose();
      }
    };

    loadRole();
  }, [isOpen, roleId, form.reset, onClose]);

  const handleFormSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);

    let role, problem;
    if (isEditMode) {
      [role, problem] = await identityService.updateRole(roleId!, data);
    } else {
      [role, problem] = await identityService.createRole(data);
    }

    setIsSubmitting(false);

    if (problem) {
      const errors = Object.entries(problem.errors || {});
      if (errors.length > 0) {
        errors.forEach(([name, message]) => {
          form.setError(name as keyof CreateRoleForm, {
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
        title: `Role ${isEditMode ? "updated" : "created"} successfully.`,
        color: "success"
      });
      onSuccess?.(role);
      roleStore.addOrUpdate(role);
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
            <h2 className="text-xl font-bold">{isEditMode ? "Edit Role" : "New Role"}</h2>
          </div>
        </ModalHeader>
        <ModalBody className="pb-6">
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-content1">
                <Spinner />
              </div>
            )}
            <form id="role-form" onSubmit={handleFormSubmit} className="space-y-4">
              <Controller
                name="name"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Role Name"
                    placeholder="Enter role name"
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
              form="role-form"
              isLoading={isSubmitting}
              isDisabled={!form.formState.isValid || isSubmitting || isLoading}
            >
              {isEditMode ? "Update" : "Create"} Role
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function AddEditRoleModalRouter({ onSuccess }: { onSuccess?: (role: Role) => void }) {
  const { closeModal, currentModal, mountedModal } = useModalRouter();

  const isRoleModal = mountedModal === "add-role" || mountedModal?.startsWith("edit-role-");

  const isOpen = currentModal === "add-role" || currentModal?.startsWith("edit-role-") || false;

  const roleId = currentModal?.startsWith("edit-role-")
    ? currentModal.replace("edit-role-", "")
    : undefined;

  return (
    <>
      {isRoleModal && (
        <AddEditRoleModal
          isOpen={isOpen}
          onClose={closeModal}
          onSuccess={onSuccess}
          roleId={roleId}
        />
      )}
    </>
  );
}
