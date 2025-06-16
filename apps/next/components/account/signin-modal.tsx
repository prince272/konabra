"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@bprogress/next";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { cn } from "@heroui/theme";
import { addToast } from "@heroui/toast";
import { AnimatePresence, motion } from "framer-motion";
import { cloneDeep } from "lodash";
import { ArrowLeft, User, X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { identityService } from "@/services";
import { SignInForm } from "@/services/identity-service";
import { useAccountState } from "@/states";
import { useBreakpoint } from "@/hooks";
import { useModalRouter } from "@/components/common/modals";
import { InputPhone } from "../common/input-phone";
import { LogosFacebook, LogosGoogleIcon } from "../iconts";

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
  const isSmallScreen = useBreakpoint("sm", "down");
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<SignInForm>({
    mode: "onChange",
    defaultValues: {
      username: "",
      password: ""
    }
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
          const returnUrl = searchParams.get("returnUrl") || "/dashboard";
          router.replace(returnUrl);
        }
      } finally {
        setIsLoading(false);
      }
    }),
    [searchParams]
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
          <X size={20} />
        </Button>
      }
      classNames={{
        wrapper: cn(isSmallScreen && "h-full")
      }}
    >
      <ModalContent className={cn(!isSmallScreen && "min-h-[512px]", "top-0")}>
        <ModalHeader className="flex flex-col gap-3 pt-6">
          <div className="absolute start-1 top-1 flex items-center justify-between">
            {step === 1 && <div className="w-8" />}
            {step === 2 && (
              <Button
                isIconOnly
                variant="light"
                onPress={handlePrev}
                className="rounded-full text-foreground-500"
              >
                <ArrowLeft size={20} />
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
              {step === 1 && (
                <div className="space-y-5">
                  <div className="flex flex-col items-center justify-center pb-3 text-center">
                    <h3 className="text-lg font-medium">Sign into account</h3>
                    <p className="text-sm text-default-500">
                      Enter your email or phone number to sign in to your account.
                    </p>
                  </div>
                  <Button
                    variant="solid"
                    color="primary"
                    radius="full"
                    fullWidth
                    startContent={<User size={20} />}
                    onPress={handleNext}
                  >
                    Sign in with Email or Phone
                  </Button>
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
                      startContent={<LogosGoogleIcon size={20} />}
                    >
                      Continue with Google
                    </Button>
                    <Button
                      variant="flat"
                      radius="full"
                      startContent={<LogosFacebook size={20} />}
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
                    <p className="text-sm text-default-500">
                      Provide your email or phone number and password.
                    </p>
                  </div>
                  <Controller
                    name="username"
                    control={form.control}
                    render={({ field }) => (
                      <InputPhone
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
                        radius="full"
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

        <ModalFooter className="flex-col gap-3 px-6 pb-6 pt-2">
          {step === 1 && (
            <Button
              radius="full"
              variant="light"
              size="sm"
              className="mx-auto w-fit text-center text-sm"
              as={NextLink}
              href={`#${encodeURIComponent("signup")}`}
            >
              Don&apos;t have an account? <span className="text-primary">Sign Up</span>
            </Button>
          )}
          {step === 2 && (
            <Button
              radius="full"
              color="primary"
              isDisabled={isLoading}
              isLoading={isLoading}
              onPress={() => handleSubmit()}
            >
              Sign In
            </Button>
          )}
        </ModalFooter>
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
