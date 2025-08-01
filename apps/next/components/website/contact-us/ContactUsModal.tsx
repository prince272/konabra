"use client";

import React, { useEffect, useState } from "react";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { Button } from "@heroui/button";
import { X } from "lucide-react";
import { cn } from "@heroui/theme";
import { AnimatePresence, motion } from "framer-motion";
import { useBreakpoint } from "@/hooks";
import { ContactUsHeader } from "./ContactUsHeader";
import { ContactUsForm } from "./ContactUsForm";

export function ContactUsModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose?: () => void;
}) {
  const [isInitialRender, setIsInitialRender] = useState(true);
  const isSmallScreen = useBreakpoint("sm", "down");

  useEffect(() => {
    if (isOpen) {
      setIsInitialRender(false);
    }
  }, [isOpen]);

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
          <X size={20} />
        </Button>
      }
      classNames={{
        wrapper: cn(isSmallScreen && "h-full")
      }}
    >
      <ModalContent className={cn(!isSmallScreen && "min-h-[512px]")}> 
        <ModalHeader className="flex flex-col gap-3 pt-6">
          <ContactUsHeader />
        </ModalHeader>
        <ModalBody className="overflow-x-hidden px-6 py-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key="contact-form"
              variants={{
                enter: {
                  x: "20%",
                  opacity: 0
                },
                center: {
                  x: 0,
                  opacity: 1,
                  transition: isInitialRender
                    ? { duration: 0 }
                    : { duration: 0.15, ease: "easeOut" }
                },
                exit: {
                  x: "-20%",
                  opacity: 0,
                  transition: { duration: 0.15, ease: "easeIn" }
                }
              }}
              initial="enter"
              animate="center"
              exit="exit"
              className="h-full"
            >
              <ContactUsForm onClose={onClose} />
            </motion.div>
          </AnimatePresence>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
} 