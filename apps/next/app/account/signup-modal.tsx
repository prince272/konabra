"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { cn } from "@heroui/theme";
import { addToast } from "@heroui/toast";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import { cloneDeep } from "lodash";
import { Controller, useForm } from "react-hook-form";
import { identityService } from "@/services";
import { CreateAccountForm } from "@/services/identity-service";
import { useAccountState } from "@/states";
import { useBreakpoint, useWindowSize } from "@/hooks";
import { useModalRouter } from "@/components/common/models";
import { Logo } from "@/components/icons";

export default function SignUpModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose?: () => void;
}) {
  const [step, setStep] = useState<number>(1);
  const steps = [[], ["username"], ["firstName", "lastName"], ["password"]];
  const [direction, setDirection] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialRender, setIsInitialRender] = useState<boolean>(true);
  const [, setAccount] = useAccountState();
  const isSmallScreen = useBreakpoint("sm", "down");
  const { height } = useWindowSize();

  const form = useForm<CreateAccountForm>({
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

  const handleSubmit = useCallback(
    form.handleSubmit(async (formData: CreateAccountForm) => {
      setIsLoading(true);
      try {
        const validateOnly = step != 4;
        const [account, problem] = await identityService.createAccount({
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
                  form.setError(field as keyof CreateAccountForm, {
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
            setAccount(account);

            addToast({
              title: "Account created successfully.",
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
          onPress={handlePrev}
          className="rounded-full text-foreground-500"
        >
          <Icon icon="material-symbols:close-rounded" width="24" height="24" />
        </Button>
      }
    >
      <ModalContent
        className={cn(!isSmallScreen && "min-h-[512px]")}
        style={isSmallScreen ? { height: height ? `${height}px` : "100vh" } : {}}
      >
        <ModalHeader className="flex flex-col gap-3 pt-6">
          <div className="absolute start-1 top-1 flex items-center justify-between">
            {step > 1 && step < 5 ? (
              <Button
                isIconOnly
                variant="light"
                onPress={handlePrev}
                className="rounded-full text-foreground-500"
              >
                <Icon icon="material-symbols:arrow-back-rounded" width="24" height="24" />
              </Button>
            ) : (
              <div className="w-8" />
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
              {step === 1 && (
                <div className="space-y-5">
                  <div className="flex flex-col items-center justify-center pb-3 text-center">
                    <Logo className="flex items-center justify-start gap-1" size={64} />
                    <h3 className="text-lg font-medium">Create an account</h3>
                    <p className="text-sm text-default-500">
                      Sign up quickly using your email, phone, or social account.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant="solid"
                      color="primary"
                      radius="full"
                      fullWidth
                      startContent={<Icon icon="solar:user-bold-duotone" width="24" height="24" />}
                      onPress={handleNext}
                    >
                      Sign up with Email or Phone
                    </Button>
                  </div>
                  <div className="flex w-full items-center justify-center gap-3 text-sm text-default-500">
                    <Divider className="flex-1" />
                    <span>or</span>
                    <Divider className="flex-1" />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <Button
                      className="dark dark:light"
                      variant="solid"
                      radius="full"
                      startContent={<Icon icon="flat-color-icons:google" width={20} />}
                    >
                      Continue with Google
                    </Button>
                    <Button
                      variant="flat"
                      radius="full"
                      startContent={<Icon icon="logos:facebook" width={20} />}
                    >
                      Continue with Facebook
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 py-4">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-medium">Enter your email or phone number</h3>
                    <p className="text-sm text-default-500">
                      We&apos;ll use this to verify your identity and keep your account secure.
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

              {step === 3 && (
                <div className="space-y-6 py-4">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-medium">Enter your profile info</h3>
                    <p className="text-sm text-default-500">
                      Tell us a bit about yourself to help personalize your experience.
                    </p>
                  </div>
                  <Controller
                    name="firstName"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="First name"
                        isInvalid={!!formErrors.firstName?.message}
                        errorMessage={formErrors.firstName?.message}
                        type="text"
                        autoFocus
                      />
                    )}
                  />
                  <Controller
                    name="lastName"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Last name"
                        isInvalid={!!formErrors.lastName?.message}
                        errorMessage={formErrors.lastName?.message}
                        type="text"
                      />
                    )}
                  />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 py-4">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-medium">Create a Secure Password</h3>
                    <p className="text-sm text-default-500">
                      Use a combination of letters, numbers, and symbols for a strong password.
                    </p>
                  </div>
                  <Controller
                    name="password"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Password"
                        isInvalid={!!formErrors.password?.message}
                        errorMessage={formErrors.password?.message}
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
                        value === form.watch("password") || "Passwords don't match"
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
              variant="light"
              size="sm"
              className="mx-auto w-fit text-center text-sm"
              as={NextLink}
              href="#signin"
            >
              Already created account? <span className="text-primary">Sign In</span>
            </Button>
          )}
          {(step == 2 || step == 3 || step == 4) && (
            <Button
              radius="full"
              color="primary"
              isDisabled={isLoading}
              isLoading={isLoading}
              onPress={() => handleSubmit()}
            >
              Continue
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function SignUpModalRouter() {
  const { closeModal, currentModal, mountedModal } = useModalRouter();

  return (
    <>
      {mountedModal == "signup" ? (
        <SignUpModal isOpen={currentModal == "signup"} onClose={closeModal} />
      ) : null}
    </>
  );
}
