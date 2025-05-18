"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { identityService } from "@/services";
import { addToast } from "@heroui/toast";
import { useModalRouter } from "@/components/common/models";
import { CompleteResetPasswordForm } from "@/services/identity-service";

export default function ResetPasswordModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose?: () => void;
}) {
  const [step, setStep] = useState<number>(1);
  const steps = [["username"], ["code"], ["newPassword", "confirmPassword"]];
  const [direction, setDirection] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialRender, setIsInitialRender] = useState<boolean>(true);

  const form = useForm<CompleteResetPasswordForm>({
    mode: "onChange",
  });

  useEffect(() => {
    if (isOpen) {
      setIsInitialRender(false);
    }
  }, [isOpen]);

  const handleNext = () => {
    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  const handleStep = useCallback(
    (newStep: number) => {
      setDirection(newStep > step ? 1 : -1);
      setStep(newStep);
    },
    [step],
  );

  const handleSendVerificationCode = useCallback(
    form.handleSubmit(async (formData) => {
      setIsLoading(true);
      try {
        const problem = await identityService.resetPassword(formData);

        if (problem) {
          const errors = Object.entries(problem.errors || {});

          if (errors.length > 0) {
            errors.forEach(([name, message]) => {
              form.setError(name as keyof CompleteResetPasswordForm, {
                type: "manual",
                message,
              });
            });
          }

          addToast({
            title: problem.message,
            color: "danger",
          });
        } else {
          addToast({
            title: "Verification code sent successfully.",
            color: "success",
          });
          handleNext();
        }
      } finally {
        setIsLoading(false);
      }
    }),
    [],
  );

  const handleResetPasswordSubmit = useCallback(
    form.handleSubmit(async (formData) => {
      setIsLoading(true);
      try {
        const validateOnly = step != 3;
        const problem = await identityService.completeResetPassword({
          ...formData,
          validateOnly,
        });

        if (problem) {
          const errors = Object.entries(problem.errors || {});

          if (errors.length > 0) {
            const errorFields = new Set(errors.map(([field]) => field));
            const stepsWithErrors = steps
              .map((fields, index) => ({
                stepNumber: index + 1,
                hasError: fields.some((field) => errorFields.has(field)),
              }))
              .filter((_) => _.hasError)
              .map((_) => _.stepNumber);

            const firstErrorStep = stepsWithErrors[0];
            if (firstErrorStep) {
              handleStep(firstErrorStep);

              const stepErrors = errors.filter(([field]) =>
                (steps[firstErrorStep - 1] || []).includes(field),
              );

              if (step >= firstErrorStep) {
                stepErrors.forEach(([field, message]) => {
                  form.setError(field as keyof CompleteResetPasswordForm, {
                    type: "manual",
                    message,
                  });
                });
              }
            }
          } else {
            addToast({
              title: problem.message,
              color: "danger",
            });
          }
        } else {
          if (validateOnly) {
            handleNext();
          } else {
            addToast({
              title: "Password reset successfully.",
              color: "success",
            });
            onClose?.();
          }
        }
      } finally {
        setIsLoading(false);
      }
    }),
    [step],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      closeButton={
        <Button
          isIconOnly
          variant="light"
          onPress={onClose}
          className="rounded-full text-foreground-500"
        >
          <Icon icon="material-symbols:close-rounded" width="24" height="24" />
        </Button>
      }
    >
      <ModalContent className="max-w-md">
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-3 pt-6">
              <div className="flex justify-between items-center absolute top-1 start-1">
                {(step == 2 || step == 3) && (
                  <Button
                    isIconOnly
                    variant="light"
                    onPress={handlePrev}
                    className="rounded-full text-foreground-500"
                  >
                    <Icon
                      icon="material-symbols:arrow-back-rounded"
                      width="24"
                      height="24"
                    />
                  </Button>
                )}
              </div>
            </ModalHeader>

            <ModalBody className="px-6 py-4 min-h-[320px] overflow-x-hidden">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={{
                    enter: (direction: number) => ({
                      x: direction > 0 ? "20%" : "-20%",
                      opacity: 0,
                    }),
                    center: {
                      x: 0,
                      opacity: 1,
                      transition: isInitialRender
                        ? { duration: 0 }
                        : { duration: 0.15, ease: "easeOut" },
                    },
                    exit: (direction: number) => ({
                      x: direction > 0 ? "-20%" : "20%",
                      opacity: 0,
                      transition: { duration: 0.15, ease: "easeIn" },
                    }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="h-full"
                >
                  {step == 1 && (
                    <div className="space-y-6 py-4">
                      <div className="flex flex-col">
                        <h3 className="text-lg font-medium">Reset Password</h3>
                        <p className="text-default-500 text-sm">
                          Enter your email or phone number to receive a
                          verification code.
                        </p>
                      </div>
                      <Input
                        {...form.register("username")}
                        label="Email or Phone number"
                        isInvalid={!!form.formState.errors.username?.message}
                        errorMessage={form.formState.errors.username?.message}
                        type="text"
                        autoFocus
                      />
                    </div>
                  )}

                  {step == 2 && (
                    <div className="space-y-6 py-4">
                      <div className="flex flex-col">
                        <h3 className="text-lg font-medium">
                          Verify Your Identity
                        </h3>
                        <p className="text-default-500 text-sm">
                          Enter the verification code sent to your email or
                          phone.
                        </p>
                      </div>
                      <Input
                        {...form.register("code")}
                        label="Verification Code"
                        isInvalid={!!form.formState.errors.code?.message}
                        errorMessage={form.formState.errors.code?.message}
                        type="text"
                        autoFocus
                      />
                    </div>
                  )}

                  {step == 3 && (
                    <div className="space-y-6 py-4">
                      <div className="flex flex-col">
                        <h3 className="text-lg font-medium">
                          Create New Password
                        </h3>
                        <p className="text-default-500 text-sm">
                          Enter and confirm your new password.
                        </p>
                      </div>
                      <Input
                        {...form.register("newPassword")}
                        label="New Password"
                        isInvalid={!!form.formState.errors.newPassword?.message}
                        errorMessage={
                          form.formState.errors.newPassword?.message
                        }
                        type="password"
                        autoFocus
                      />
                      <Input
                        {...form.register("confirmPassword")}
                        label="Confirm Password"
                        isInvalid={
                          !!form.formState.errors.confirmPassword?.message
                        }
                        errorMessage={
                          form.formState.errors.confirmPassword?.message
                        }
                        type="password"
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </ModalBody>

            <ModalFooter className="px-6 pb-6 pt-2 flex-col gap-3">
              {step == 1 && (
                <Button
                  color="primary"
                  isDisabled={isLoading}
                  isLoading={isLoading}
                  onPress={() => handleSendVerificationCode()}
                >
                  Continue
                </Button>
              )}
              {(step == 2 || step == 3) && (
                <Button
                  color="primary"
                  isDisabled={isLoading}
                  isLoading={isLoading}
                  onPress={() => handleResetPasswordSubmit()}
                >
                  Continue
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export function ResetPasswordModalRouter() {
  const { closeModal, currentModal, mountedModal } = useModalRouter();

  return (
    <>
      {mountedModal == "reset-password" ? (
        <ResetPasswordModal
          isOpen={currentModal == "reset-password"}
          onClose={closeModal}
        />
      ) : null}
    </>
  );
}
