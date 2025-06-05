"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import { addToast } from "@heroui/toast";
import { Icon } from "@iconify-icon/react";
import { incidentService } from "@/services";
import { Incident } from "@/services/incident-service";
import { useModalRouter } from "@/components/common/modals";

interface DeleteIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidentId: string;
  onSuccess?: (incident: Incident) => void;
}

function DeleteIncidentModal({
  isOpen,
  onClose,
  incidentId,
  onSuccess
}: DeleteIncidentModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncident = async () => {
      if (!incidentId) return;
      setLoading(true);
      const [data, problem] = await incidentService.getIncidentById(incidentId);
      if (!problem) {
        setIncident(data);
      }
      setLoading(false);
    };

    if (isOpen) {
      fetchIncident();
    }
  }, [incidentId, isOpen]);

  const handleDelete = async () => {
    setIsDeleting(true);
    const problem = await incidentService.deleteIncident(incidentId);
    setIsDeleting(false);

    if (problem) {
      addToast({
        title: problem.message || "Failed to delete incident.",
        color: "danger"
      });
    } else {
      addToast({
        title: "Incident deleted successfully.",
        color: "success"
      });
      onSuccess?.({ id: incidentId } as Incident);
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
          <h2 className="text-xl font-bold">Delete Incident</h2>
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
                Are you sure you want to delete the incident{" "}
                <span className="font-semibold text-foreground">{incident?.title}</span>?<br />
                This action cannot be undone.
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

export function DeleteIncidentModalRouter({
  onSuccess
}: {
  onSuccess?: (incident: Incident) => void;
}) {
  const { closeModal, currentModal, mountedModal } = useModalRouter();

  const isDeleteModal = mountedModal?.startsWith("delete-incident-");
  const isOpen = currentModal?.startsWith("delete-incident-") || false;

  const incidentId = currentModal?.startsWith("delete-incident-")
    ? currentModal.replace("delete-incident-", "")
    : "";

  return (
    <>
      {isDeleteModal && incidentId && (
        <DeleteIncidentModal
          isOpen={isOpen}
          onClose={closeModal}
          onSuccess={onSuccess}
          incidentId={incidentId}
        />
      )}
    </>
  );
}
