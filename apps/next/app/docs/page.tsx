"use client";

import { useModalManager } from "@/components/common/models";
import { title } from "@/components/primitives";
import SignInModal from "../auth/signin-modal";

export default function DocsPage() {
  const { openModal, closeModal, currentModal, mountedModal } =
    useModalManager();

  return (
    <div>
      <h1
        className={title()}
        onClick={() => {
          openModal("signin");
        }}
      >
        Start hashing
      </h1>
      {mountedModal === "signin" && (
        <SignInModal isOpen={currentModal === "signin"} onClose={closeModal} />
      )}
    </div>
  );
}
