"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { cn } from "@heroui/theme";
import { addToast } from "@heroui/toast";
import { Icon } from "@iconify-icon/react";
import { AnimatePresence, motion } from "framer-motion";
import { Controller, useForm } from "react-hook-form";
import { useBreakpoint } from "@/hooks";
import { useModalRouter } from "@/components/common/modals";

interface ContactUsForm {
  name: string;
  email: string;
  message: string;
}

export default function ContactUsModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose?: () => void;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialRender, setIsInitialRender] = useState<boolean>(true);
  const isSmallScreen = useBreakpoint("sm", "down");

  const form = useForm<ContactUsForm>({
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      message: ""
    }
  });

  useEffect(() => {
    if (isOpen) {
      setIsInitialRender(false);
    }
  }, [isOpen]);

  const handleSubmitContact = useCallback(
    form.handleSubmit(async (formData) => {
      setIsLoading(true);
      try {
        const problem = {
          message: "An error occurred while sending the message.",
          errors: {
            name: "Name is required",
            email: "Email is required",
            message: "Message is required"
          }
        };

        if (problem) {
          const errors = Object.entries(problem.errors || {});

          if (errors.length > 0) {
            errors.forEach(([name, message]) => {
              form.setError(name as keyof ContactUsForm, {
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
            title: "Message sent successfully.",
            color: "success"
          });
          form.reset();
          onClose?.();
        }
      } finally {
        setIsLoading(false);
      }
    }),
    []
  );

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
      <ModalContent className={cn(!isSmallScreen && "min-h-[512px]")}>
        <ModalHeader className="flex flex-col gap-3 pt-6">
          <div className="flex flex-col">
            <h3 className="text-lg font-medium">Contact Us</h3>
            <p className="text-sm text-default-500">
              Fill out the form below, and we'll get back to you soon.
            </p>
          </div>
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
              <div className="space-y-6 py-4">
                <Controller
                  name="name"
                  control={form.control}
                  rules={{ required: "Name is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Name"
                      isInvalid={!!form.formState.errors.name?.message}
                      errorMessage={form.formState.errors.name?.message}
                      type="text"
                      autoFocus
                    />
                  )}
                />
                <Controller
                  name="email"
                  control={form.control}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Invalid email address"
                    }
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Email"
                      isInvalid={!!form.formState.errors.email?.message}
                      errorMessage={form.formState.errors.email?.message}
                      type="email"
                    />
                  )}
                />
                <Controller
                  name="message"
                  control={form.control}
                  rules={{ required: "Message is required" }}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Message"
                      isInvalid={!!form.formState.errors.message?.message}
                      errorMessage={form.formState.errors.message?.message}
                      minRows={4}
                    />
                  )}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </ModalBody>

        <ModalFooter className="flex-col gap-3 px-6 pb-6 pt-2">
          <Button
            radius="full"
            color="primary"
            isDisabled={isLoading}
            isLoading={isLoading}
            onPress={() => handleSubmitContact()}
          >
            Send Message
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

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
