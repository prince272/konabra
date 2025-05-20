"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { InputOtp } from "@heroui/input-otp";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { cn } from "@heroui/theme";
import { addToast } from "@heroui/toast";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import { cloneDeep } from "lodash";
import { Controller, useForm } from "react-hook-form";
import { identityService } from "@/services";
import { CompleteResetPasswordForm } from "@/services/identity-service";
import { useBreakpoint, useTimer } from "@/hooks";
import { useModalRouter } from "@/components/common/models";

export default function ResetPasswordModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose?: () => void;
}) {
  const [step, setStep] = useState<number>(1);
  const steps = [["username"], ["code"], ["newPassword", "confirmPassword"]];
  const [direction, setDirection] = useState<number>(1);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialRender, setIsInitialRender] = useState<boolean>(true);
  const isSmallScreen = useBreakpoint("sm", "down");

  const {
    time: resendTime,
    start: startResendTimer,
    reset: resetResendTimer
  } = useTimer({
    initialTime: 60,
    interval: 1000,
    step: 1,
    timerType: "DECREMENTAL",
    endTime: 0
  });

  const form = useForm<CompleteResetPasswordForm>({
    mode: "onChange"
  });

  const formErrors = useMemo(
    () => cloneDeep(form.formState.errors),
    [form.formState.isValid, form.formState.isSubmitting, form.formState.isDirty]
  );

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
    [step]
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
            title: "Verification code sent successfully.",
            color: "success"
          });
          resetResendTimer();
          startResendTimer();
          handleNext();
        }
      } finally {
        setIsLoading(false);
      }
    }),
    [resetResendTimer, startResendTimer]
  );

  const handleResendCode = useCallback(async () => {
    setIsResending(true);
    try {
      const problem = await identityService.resetPassword(form.getValues());

      if (problem) {
        addToast({
          title: problem.message,
          color: "danger"
        });
      } else {
        addToast({
          title: "Verification code resent successfully.",
          color: "success"
        });
        resetResendTimer();
        startResendTimer();
      }
    } finally {
      setIsResending(false);
    }
  }, [form, resetResendTimer, startResendTimer]);

  const handleResetPasswordSubmit = useCallback(
    form.handleSubmit(async (formData) => {
      setIsLoading(true);
      try {
        const validateOnly = step != 3;
        const problem = await identityService.completeResetPassword({
          ...formData,
          validateOnly
        });

        if (problem) {
          const errors = Object.entries(problem.errors || {});

          if (errors.length > 0) {
            const errorFields = new Set(errors.map(([field]) => field));
            const stepsWithErrors = steps
              .map((fields, index) => ({
                stepNumber: index + 1,
                hasError: fields.some((field) => errorFields.has(field))
              }))
              .filter((_) => _.hasError)
              .map((_) => _.stepNumber);

            const firstErrorStep = stepsWithErrors[0];
            if (firstErrorStep) {
              handleStep(firstErrorStep);

              const stepErrors = errors.filter(([field]) =>
                (steps[firstErrorStep - 1] || []).includes(field)
              );

              if (step >= firstErrorStep) {
                stepErrors.forEach(([field, message]) => {
                  form.setError(field as keyof CompleteResetPasswordForm, {
                    type: "manual",
                    message
                  });
                });
              }
            }
          } else {
            addToast({
              title: problem.message,
              color: "danger"
            });
          }
        } else {
          if (validateOnly) {
            handleNext();
          } else {
            addToast({
              title: "Password reset successfully.",
              color: "success"
            });
            onClose?.();
          }
        }
      } finally {
        setIsLoading(false);
      }
    }),
    [step]
  );

  return (
    <Modal
      isOpen={isOpen}
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
          <Icon icon="material-symbols:close-rounded" width="24" height="24" />
        </Button>
      }
      classNames={{
        wrapper: cn(isSmallScreen && "h-full")
      }}
    >
      <ModalContent className={cn(!isSmallScreen && "min-h-[512px]")}>
        <ModalHeader className="flex flex-col gap-3 pt-6">
          <div className="absolute start-1 top-1 flex items-center justify-between">
            {(step == 2 || step == 3) && (
              <Button
                isIconOnly
                variant="light"
                onPress={handlePrev}
                className="rounded-full text-foreground-500"
              >
                <Icon icon="material-symbols:arrow-back-rounded" width="24" height="24" />
              </Button>
            )}
          </div>
        </ModalHeader>

        <ModalBody className="overflow-x-hidden px-6 py-4">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={step}
              custom={direction}
              variants={{
                enter: (direction: number) => ({
                  x: direction > 0 ? "20%" : "-20%",
                  opacity: 0
                }),
                center: {
                  x: 0,
                  opacity: 1,
                  transition: isInitialRender
                    ? { duration: 0 }
                    : { duration: 0.15, ease: "easeOut" }
                },
                exit: (direction: number) => ({
                  x: direction > 0 ? "-20%" : "20%",
                  opacity: 0,
                  transition: { duration: 0.15, ease: "easeIn" }
                })
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
                    <p className="text-sm text-default-500">
                      Enter your email or phone number to receive a verification code.
                    </p>
                  </div>
                  <Controller
                    name="username"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Email or Phone number"
                        isInvalid={!!formErrors.username?.message}
                        errorMessage={formErrors.username?.message}
                        type="text"
                        autoFocus
                      />
                    )}
                  />
                </div>
              )}

              {step == 2 && (
                <div className="space-y-6 py-4">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-medium">Verify Your Identity</h3>
                    <p className="text-sm text-default-500">
                      Enter the verification code sent to{" "}
                      <span className="break-all font-semibold">{form.watch("username")}</span>.
                    </p>
                  </div>
                  <div className="flex flex-col space-y-3">
                    <Controller
                      name="code"
                      control={form.control}
                      render={({ field }) => (
                        <div className="flex justify-center">
                          <InputOtp
                            {...field}
                            length={6}
                            label="Code"
                            isInvalid={!!formErrors.code?.message}
                            errorMessage={formErrors.code?.message}
                            type="text"
                            autoFocus
                            className="flex justify-center"
                          />
                        </div>
                      )}
                    />
                    <div className="flex justify-center">
                      <Button
                        radius="full"
                        variant="light"
                        size="sm"
                        className={cn("text-sm", !(resendTime > 0) && "text-primary")}
                        onPress={handleResendCode}
                        isLoading={isResending}
                        isDisabled={isResending || resendTime > 0}
                      >
                        {resendTime > 0 ? `Resend code (${resendTime}s)` : "Resend code"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {step == 3 && (
                <div className="space-y-6 py-4">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-medium">Create New Password</h3>
                    <p className="text-sm text-default-500">Enter and confirm your new password.</p>
                  </div>
                  <Controller
                    name="newPassword"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="New Password"
                        isInvalid={!!formErrors.newPassword?.message}
                        errorMessage={formErrors.newPassword?.message}
                        type="password"
                        autoFocus
                      />
                    )}
                  />
                  <Controller
                    name="confirmPassword"
                    control={form.control}
                    rules={{
                      validate: (value) =>
                        value === form.watch("newPassword") || "Passwords don't match"
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Confirm password"
                        isInvalid={!!formErrors.confirmPassword?.message}
                        errorMessage={formErrors.confirmPassword?.message}
                        type="password"
                      />
                    )}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </ModalBody>

        <ModalFooter className="flex-col gap-3 px-6 pb-6 pt-2">
          {step == 1 && (
            <Button
              radius="full"
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
              radius="full"
              color="primary"
              isDisabled={isLoading}
              isLoading={isLoading}
              onPress={() => handleResetPasswordSubmit()}
            >
              Continue
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function ResetPasswordModalRouter() {
  const { closeModal, currentModal, mountedModal } = useModalRouter();

  return (
    <>
      {mountedModal == "reset-password" ? (
        <ResetPasswordModal isOpen={currentModal == "reset-password"} onClose={closeModal} />
      ) : null}
    </>
  );
}
