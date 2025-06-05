"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useHashState, useQueue } from "@/hooks";

interface ModalQueueContextValue {
  currentModal: string | null;
  mountedModal: string | null;
  hash: string | null;
  openModal: (modalName: string) => void;
  closeModal: () => void;
  setHash: (hash: string) => void;
  removeHash: () => void;
}

const ModalQueueContext = createContext<ModalQueueContextValue | undefined>(undefined);

export function ModalQueueProvider({ children }: { children: React.ReactNode }) {
  const [currentModal, setCurrentModal] = useState<string | null>(null);
  const [mountedModal, setMountedModal] = useState<string | null>(null);
  const [hash, setHash, removeHash] = useHashState();
  const modalQueue = useQueue();

  const modalName = useMemo(() => hash?.split(":")[0], [hash]);

  useEffect(() => {
    if (modalName) {
      openModal(modalName);
    } else {
      closeModal();
    }
  }, [modalName]);

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
    hash,
    openModal,
    closeModal,
    setHash,
    removeHash
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
  const { openModal, closeModal, currentModal, mountedModal, hash, setHash, removeHash } =
    useModalQueue();

  const handleOpenModal = useCallback(
    (modalName: string) => {
      setHash(modalName);
      openModal(modalName);
    },
    [openModal, setHash]
  );

  const handleCloseModal = useCallback(() => {
    removeHash();
    closeModal();
  }, [removeHash, closeModal]);

  return {
    hash,
    mountedModal,
    currentModal,
    openModal: handleOpenModal,
    closeModal: handleCloseModal
  };
}
