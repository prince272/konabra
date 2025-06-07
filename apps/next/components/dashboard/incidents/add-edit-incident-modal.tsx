import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { Select, SelectItem } from "@heroui/select";
import { Spinner } from "@heroui/spinner";
import { cn } from "@heroui/theme";
import { addToast } from "@heroui/toast";
import { Icon } from "@iconify-icon/react";
import { Controller, useForm } from "react-hook-form";
import { categoryService, incidentService } from "@/services";
import { CreateIncidentForm, Incident, IncidentSeverities } from "@/services/incident-service";
import { useBreakpoint } from "@/hooks";
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
  const isSmallScreen = useBreakpoint("sm", "down");
  const isEditMode = Boolean(incidentId);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for categories
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const form = useForm<CreateIncidentForm>({
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      severity: "low"
    },
    mode: "onChange"
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      return;
    }

    const loadCategories = async () => {
      setCategoriesLoading(true);
      const [cats, err] = await categoryService.getCategories();
      setCategoriesLoading(false);

      if (err) {
        addToast({ title: "Failed to load categories.", color: "danger" });
        return;
      }

      setCategories(cats);
    };

    loadCategories();

    if (!incidentId) {
      // If no incidentId (add mode), reset form
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
      isDismissable={false}
      onClose={onClose}
      size={isSmallScreen ? "full" : "lg"}
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
          <h2 className="text-xl font-bold">{isEditMode ? "Edit Incident" : "New Incident"}</h2>
        </ModalHeader>
        <ModalBody className="pb-6">
          <div className="relative">
            {(isLoading || categoriesLoading) && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-content1">
                <Spinner />
              </div>
            )}

            <form
              id="incident-form"
              onSubmit={handleFormSubmit}
              className={`space-y-4 ${
                isLoading || categoriesLoading ? "pointer-events-none opacity-50" : ""
              }`}
            >
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
                  <Select
                    {...field}
                    label="Category"
                    selectedKeys={[field.value]}
                    onChange={(e) => field.onChange(e.target.value)}
                    isInvalid={!!form.formState.errors.categoryId}
                    aria-label="Category"
                  >
                    <>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </>
                  </Select>
                )}
              />
              <Controller
                name="severity"
                control={form.control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Severity"
                    selectedKeys={[field.value]}
                    onChange={(e) => field.onChange(e.target.value)}
                    startContent={
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          {
                            low: "bg-secondary",
                            medium: "bg-warning",
                            high: "bg-danger"
                          }[field.value]
                        )}
                      ></span>
                    }
                  >
                    {IncidentSeverities.map((s) => ({
                      ...s,
                      variant: {
                        low: "bg-secondary",
                        medium: "bg-warning",
                        high: "bg-danger"
                      }[s.value]
                    })).map((severity) => (
                      <SelectItem
                        key={severity.value}
                        startContent={
                          <span className={cn("h-2 w-2 rounded-full", severity.variant)}></span>
                        }
                      >
                        {severity.label}
                      </SelectItem>
                    ))}
                  </Select>
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

  const isIncidentModal =
    mountedModal === "add-incident" || mountedModal?.startsWith("edit-incident-");

  const isOpen =
    currentModal === "add-incident" || currentModal?.startsWith("edit-incident-") || false;

  const incidentId = currentModal?.startsWith("edit-incident-")
    ? currentModal.replace("edit-incident-", "")
    : undefined;

  return (
    <>
      {isIncidentModal && (
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
