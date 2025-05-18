"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import NextLink from "next/link";
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
import { Divider } from "@heroui/divider";
import { Checkbox } from "@heroui/checkbox";

import { useModalRouter } from "@/components/common/models";
import { Logo } from "@/components/icons";
import { identityService } from "@/services";
import { AccountWithTokenModel, CreateAccountForm } from "@/services/identity-service";
import { addToast } from "@heroui/toast";
import { useCookieState } from "@/hooks";

export default function SignUpModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose?: () => void;
}) {
  const [step, setStep] = useState<number>(1);
  const steps = [[], ["username"], ["firstName", "lastName"], ["password"], []];
  const [direction, setDirection] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialRender, setIsInitialRender] = useState<boolean>(true);
  const [currentAccount, setAccount] = useCookieState<AccountWithTokenModel | null>(identityService.currentAccountKey, null);

  const form = useForm<CreateAccountForm>({
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

  const handleSubmit = useCallback(
    form.handleSubmit(async (formData: CreateAccountForm) => {
      setIsLoading(true);
      try {
        const validateOnly = step != 4;
        const [account, problem] = await identityService.createAccount({
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
                  form.setError(field as keyof CreateAccountForm, {
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
          handleNext();

          if (!validateOnly) {
            setAccount(account);
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
          onPress={handlePrev}
          className="rounded-full text-foreground-500"
        >
          <Icon icon="material-symbols:close-rounded" width="24" height="24" />
        </Button>
      }
    >
      <ModalContent className="max-w-md min-h-[512px]">
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-3 pt-6">
              <div className="flex justify-between items-center absolute top-1 start-1">
                {step > 1 && step < 5 ? (
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
                ) : (
                  <div className="w-8" />
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
                  {step === 1 && (
                    <div className="space-y-5">
                      <div className="text-center flex justify-center flex-col items-center pb-3">
                        <Logo
                          className="flex justify-start items-center gap-1"
                          size={64}
                        />
                        <h3 className="text-lg font-medium">
                          Create an account
                        </h3>
                        <p className="text-default-500 text-sm">
                          Sign up quickly using your email, phone, or social
                          account.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <Button
                          variant="flat"
                          radius="full"
                          fullWidth
                          startContent={
                            <Icon
                              icon="solar:user-bold-duotone"
                              width="24"
                              height="24"
                            />
                          }
                          onPress={handleNext}
                        >
                          Sign up with Email or Phone
                        </Button>
                      </div>
                      <div className="flex items-center justify-center gap-3 text-sm text-default-500 w-full">
                        <Divider className="flex-1" />
                        <span>or</span>
                        <Divider className="flex-1" />
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <Button
                          className="dark dark:light"
                          variant="solid"
                          radius="full"
                          startContent={
                            <Icon icon="flat-color-icons:google" width={20} />
                          }
                        >
                          Continue with Google
                        </Button>
                        <Button
                          variant="flat"
                          radius="full"
                          startContent={
                            <Icon icon="logos:facebook" width={20} />
                          }
                        >
                          Continue with Facebook
                        </Button>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6 py-4">
                      <div className="flex flex-col">
                        <h3 className="text-lg font-medium">
                          Enter your email or phone number
                        </h3>
                        <p className="text-default-500 text-sm">
                          We'll use this to verify your identity and keep your
                          account secure.
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

                  {step === 3 && (
                    <div className="space-y-6 py-4">
                      <div className="flex flex-col">
                        <h3 className="text-lg font-medium">
                          Enter your profile info
                        </h3>
                        <p className="text-default-500 text-sm">
                          Tell us a bit about yourself to help personalize your
                          experience.
                        </p>
                      </div>
                      <Input
                        {...form.register("firstName")}
                        label="First name"
                        isInvalid={!!form.formState.errors.firstName?.message}
                        errorMessage={form.formState.errors.firstName?.message}
                        type="text"
                        autoFocus
                      />
                      <Input
                        {...form.register("lastName")}
                        label="Last name"
                        isInvalid={!!form.formState.errors.lastName?.message}
                        errorMessage={form.formState.errors.lastName?.message}
                        type="text"
                      />
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-6 py-4">
                      <div className="flex flex-col">
                        <h3 className="text-lg font-medium">
                          Create a Secure Password
                        </h3>
                        <p className="text-default-500 text-sm">
                          Use a combination of letters, numbers, and symbols for
                          a strong password.
                        </p>
                      </div>
                      <Input
                        {...form.register("password")}
                        label="Password"
                        isInvalid={!!form.formState.errors.password?.message}
                        errorMessage={form.formState.errors.password?.message}
                        type="password"
                        autoFocus
                      />
                      <Input
                        {...form.register("confirmPassword", {
                          validate: (value) =>
                            value === form.watch("password") ||
                            "Password don't match",
                        })}
                        label="Confirm password"
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

                  {step === 5 && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-5">
                      <div className="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center">
                        <Icon
                          icon="solar:check-circle-bold"
                          className="text-success-500 text-4xl"
                        />
                      </div>
                      <h3 className="text-xl font-semibold">
                        Account Created! 🎉
                      </h3>
                      <p className="text-default-500 text-center text-sm">
                        Your account has been successfully created.
                        <br />
                        You can now access all features.
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </ModalBody>

            <ModalFooter className="px-6 pb-6 pt-2 flex-col gap-3">
              {step == 1 && (
                <Button
                  variant="light"
                  size="sm"
                  className="text-sm text-center w-fit mx-auto"
                  as={NextLink}
                  href="#signin"
                >
                  Already created account?{" "}
                  <span className="text-primary">Sign In</span>
                </Button>
              )}
              {(step == 2 || step == 3 || step == 4) && (
                <Button
                  color="primary"
                  isDisabled={isLoading}
                  isLoading={isLoading}
                  onPress={() => handleSubmit()}
                >
                  Continue
                </Button>
              )}
              {step == 5 && (
                <Button
                  color="primary"
                  isDisabled={isLoading}
                  isLoading={isLoading}
                  onPress={() => {
                    onClose?.();
                  }}
                >
                  Go to Dashboard
                </Button>
              )}
            </ModalFooter>
          </>
        )}
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
