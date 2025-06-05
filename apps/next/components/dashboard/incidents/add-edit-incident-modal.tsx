"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { Select, SelectItem } from "@heroui/select";
import { Spinner } from "@heroui/spinner";
import { addToast } from "@heroui/toast";
import { Icon } from "@iconify-icon/react";
import { Controller, useForm } from "react-hook-form";
import { incidentService } from "@/services";
import { CreateIncidentForm, Incident, IncidentSeverity } from "@/services/incident-service";
import { useModalRouter } from "@/components/common/modals";

interface AddEditIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidentId?: string;
  onSuccess?: (incident: Incident) => void;
}

export function AddEditIncidentModal({
  isOpen,
  onClose,
  incidentId,
  onSuccess
}: AddEditIncidentModalProps) {
  const isEditMode = Boolean(incidentId);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateIncidentForm>({
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      severity: IncidentSeverity.Low
    },
    mode: "onChange"
  });

  useEffect(() => {
    if (!isOpen || !incidentId) {
      form.reset();
      return;
    }

    const loadIncident = async () => {
      setIsLoading(true);
      const [incident, problem] = await incidentService.getIncidentById(incidentId);
      setIsLoading(false);

      if (problem) {
        addToast({ title: "Failed to load incident.", color: "danger" });
        onClose();
        return;
      }

      form.reset(incident);
    };

    loadIncident();
  }, [isOpen, incidentId, form.reset, onClose]);

  const handleFormSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    let incident, problem;

    if (isEditMode) {
      [incident, problem] = await incidentService.updateIncident(incidentId!, data);
    } else {
      [incident, problem] = await incidentService.createIncident(data);
    }

    setIsSubmitting(false);

    if (problem) {
      const errors = Object.entries(problem.errors || {});
      if (errors.length > 0) {
        errors.forEach(([name, message]) => {
          form.setError(name as keyof CreateIncidentForm, {
            type: "manual",
            message
          });
        });
      } else {
        addToast({ title: problem.message || "Something went wrong", color: "danger" });
      }
    } else {
      addToast({
        title: `Incident ${isEditMode ? "updated" : "created"} successfully.`,
        color: "success"
      });
      onSuccess?.(incident);
      onClose();
    }
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      scrollBehavior="inside"
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
          <h2 className="text-xl font-bold">{isEditMode ? "Edit Incident" : "New Incident"}</h2>
        </ModalHeader>
        <ModalBody className="pb-6">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <form id="incident-form" onSubmit={handleFormSubmit} className="space-y-4">
              <Controller
                name="title"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Title"
                    placeholder="Enter incident title"
                    isInvalid={!!form.formState.errors.title}
                    errorMessage={form.formState.errors.title?.message}
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
                    placeholder="Describe the incident"
                    rows={3}
                    isInvalid={!!form.formState.errors.description}
                    errorMessage={form.formState.errors.description?.message}
                  />
                )}
              />
              <Controller
                name="categoryId"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Category ID"
                    placeholder="Enter category ID"
                    isInvalid={!!form.formState.errors.categoryId}
                    errorMessage={form.formState.errors.categoryId?.message}
                  />
                )}
              />
              <Controller
                name="severity"
                control={form.control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Severity"
                    selectedKeys={field.value}
                    onSelectionChange={(key) => field.onChange(key)}
                  >
                    {Object.entries(IncidentSeverity).map(([key, value]) => (
                      <SelectItem key={value}>{value}</SelectItem>
                    ))}
                  </Select>
                )}
              />
            </form>
          )}
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
              form="incident-form"
              isLoading={isSubmitting}
              isDisabled={!form.formState.isValid || isSubmitting || isLoading}
            >
              {isEditMode ? "Update" : "Create"} Incident
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function AddEditIncidentModalRouter({
  onSuccess
}: {
  onSuccess?: (incident: Incident) => void;
}) {
  const { closeModal, currentModal, mountedModal } = useModalRouter();

  const isCategoryModal =
    mountedModal === "add-incident" || mountedModal?.startsWith("edit-incident-");

  const isOpen =
    currentModal === "add-incident" || currentModal?.startsWith("edit-incident-") || false;

  const incidentId = currentModal?.startsWith("edit-incident-")
    ? currentModal.replace("edit-incident-", "")
    : undefined;

  return (
    <>
      {isCategoryModal && (
        <AddEditIncidentModal
          isOpen={isOpen}
          onClose={closeModal}
          onSuccess={onSuccess}
          incidentId={incidentId}
        />
      )}
    </>
  );
}
