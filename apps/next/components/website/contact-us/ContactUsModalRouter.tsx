"use client";

import React from "react";
import { useModalRouter } from "@/components/common/modals";
import { ContactUsModal } from "./ContactUsModal";

export function ContactUsModalRouter() {
  const { closeModal, currentModal, mountedModal } = useModalRouter();

  return (
    <>
      {mountedModal == "contact-us" ? (
        <ContactUsModal isOpen={currentModal == "contact-us"} onClose={closeModal} />
      ) : null}
    </>
  );
} 