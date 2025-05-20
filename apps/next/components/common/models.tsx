"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useHashState, useQueue } from "@/hooks";

interface ModalQueueContextValue {
  currentModal: string | null;
  mountedModal: string | null;
  openModal: (modalName: string) => void;
  closeModal: () => void;
}

const ModalQueueContext = createContext<ModalQueueContextValue | undefined>(undefined);

export function ModalQueueProvider({ children }: { children: React.ReactNode }) {
  const [currentModal, setCurrentModal] = useState<string | null>(null);
  const [mountedModal, setMountedModal] = useState<string | null>(null);
  const modalQueue = useQueue();

  const openModal = useCallback(
    (modalName: string) => {
      modalQueue.add(async () => {
        if (currentModal) {
          setCurrentModal(null);
          await new Promise((resolve) => setTimeout(resolve, 100));
          setMountedModal(null);
        }
        setCurrentModal(modalName);
        setMountedModal(modalName);
      });
    },
    [currentModal, modalQueue]
  );

  const closeModal = useCallback(() => {
    modalQueue.add(async () => {
      if (currentModal) {
        setCurrentModal(null);
        await new Promise((resolve) => setTimeout(resolve, 300));
        setMountedModal(null);
      }
    });
  }, [currentModal, modalQueue]);

  const value: ModalQueueContextValue = {
    currentModal,
    mountedModal,
    openModal,
    closeModal
  };

  return <ModalQueueContext.Provider value={value}>{children}</ModalQueueContext.Provider>;
}

function useModalQueue() {
  const context = useContext(ModalQueueContext);
  if (!context) {
    throw new Error("useModalQueue must be used within a ModalQueueProvider");
  }
  return context;
}

export function useModalRouter() {
  const [modalHash, setModalHash, removeModalHash] = useHashState();
  const { openModal, closeModal, currentModal, mountedModal } = useModalQueue();

  useEffect(() => {
    if (modalHash) {
      openModal(modalHash);
    } else {
      closeModal();
    }
  }, [modalHash]);

  const handleOpenModal = useCallback(
    (modalName: string) => {
      setModalHash(modalName);
      openModal(modalName);
    },
    [openModal, setModalHash]
  );

  const handleCloseModal = useCallback(() => {
    removeModalHash();
    closeModal();
  }, [removeModalHash, closeModal]);

  return {
    mountedModal,
    currentModal,
    openModal: handleOpenModal,
    closeModal: handleCloseModal
  };
}
