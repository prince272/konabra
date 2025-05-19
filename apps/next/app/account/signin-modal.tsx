"use client";

import { useModalRouter } from "@/components/common/models";
import { Logo } from "@/components/icons";
import { identityService } from "@/services";
import { SignInForm } from "@/services/identity-service";
import { useAccountState } from "@/states";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { addToast } from "@heroui/toast";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import { cloneDeep } from "lodash";
import NextLink from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

export default function SignInModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose?: () => void;
}) {
  const [step, setStep] = useState<number>(1);
  const [direction, setDirection] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialRender, setIsInitialRender] = useState<boolean>(true);
  const [, setAccount] = useAccountState();

  const form = useForm<SignInForm>({
    mode: "onChange"
  });

  const formErrors = useMemo(
    () => cloneDeep(form.formState.errors),
    [form.formState.isValid, form.formState.isSubmitting]
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

  const handleSubmit = useCallback(
    form.handleSubmit(async (formData: SignInForm) => {
      setIsLoading(true);
      try {
        const [account, problem] = await identityService.signIn(formData);

        if (problem) {
          const errors = Object.entries(problem.errors || {});

          if (errors.length > 0) {
            errors.forEach(([name, message]) => {
              form.setError(name as keyof SignInForm, {
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
          setAccount(account);
          addToast({
            title: "Sign in successfully.",
            color: "success"
          });
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
      <ModalContent className="max-w-md min-h-[512px]">
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-3 pt-6">
              <div className="flex justify-between items-center absolute top-1 start-1">
                {step === 1 && <div className="w-8" />}
                {step === 2 && (
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

            <ModalBody className="px-6 py-4 min-h-[320px] overflow-x-hidden">
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
                      <div className="text-center flex justify-center flex-col items-center pb-3">
                        <Logo className="flex justify-start items-center gap-1" size={64} />
                        <h3 className="text-lg font-medium">Sign into account</h3>
                        <p className="text-default-500 text-sm">
                          Enter your email or phone number to sign in to your account.
                        </p>
                      </div>
                      <Button
                        variant="solid"
                        color="primary"
                        radius="full"
                        fullWidth
                        startContent={
                          <Icon icon="solar:user-bold-duotone" width="24" height="24" />
                        }
                        onPress={handleNext}
                      >
                        Sign in with Email or Phone
                      </Button>
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
                        <h3 className="text-lg font-medium">Enter your credentials</h3>
                        <p className="text-default-500 text-sm">
                          Provide your email or phone number and password.
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
                      <div className="flex flex-col space-y-3">
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
                            />
                          )}
                        />
                        <div className="flex justify-end">
                          <Button
                            variant="light"
                            size="sm"
                            className="text-sm text-primary"
                            as={NextLink}
                            href="#reset-password"
                          >
                            Forgot password?
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </ModalBody>

            <ModalFooter className="px-6 pb-6 pt-2 flex-col gap-3">
              {step === 1 && (
                <Button
                  variant="light"
                  size="sm"
                  className="text-sm text-center w-fit mx-auto"
                  as={NextLink}
                  href={`#${encodeURIComponent("signup")}`}
                >
                  Don't have an account? <span className="text-primary">Sign Up</span>
                </Button>
              )}
              {step === 2 && (
                <Button
                  color="primary"
                  isDisabled={isLoading}
                  isLoading={isLoading}
                  onPress={() => handleSubmit()}
                >
                  Sign In
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export function SignInModalRouter() {
  const { closeModal, currentModal, mountedModal } = useModalRouter();

  return (
    <>
      {mountedModal === "signin" ? (
        <SignInModal isOpen={currentModal === "signin"} onClose={closeModal} />
      ) : null}
    </>
  );
}
