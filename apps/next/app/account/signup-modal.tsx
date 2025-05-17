"use client";

import { useState, useEffect } from "react";
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

type FormData = {
  email: string;
  firstName: string;
  lastName?: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

export default function SignUpModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose?: () => void;
}) {
  const [step, setStep] = useState<number>(1);
  const [direction, setDirection] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialRender, setIsInitialRender] = useState<boolean>(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
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

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      handleNext();
    } finally {
      setIsLoading(false);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "20%" : "-20%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: isInitialRender
        ? { duration: 0 }
        : { duration: 0.25, ease: "easeOut" },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? "-20%" : "20%",
      opacity: 0,
      transition: { duration: 0.25, ease: "easeIn" },
    }),
  };

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
      <ModalContent className="max-w-md">
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
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="h-full"
                >
                  {step === 1 && (
                    <div className="space-y-5">
                      <Input
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        })}
                        type="email"
                        label="Email address"
                        placeholder="your@email.com"
                        errorMessage={errors.email?.message}
                        startContent={
                          <Icon
                            icon="solar:letter-linear"
                            className="text-lg text-default-400"
                          />
                        }
                      />
                      <Checkbox
                        {...register("terms", {
                          required: "You must accept the terms",
                        })}
                        classNames={{ label: "text-sm" }}
                      >
                        I agree to the{" "}
                        <span className="text-primary">Terms</span> and{" "}
                        <span className="text-primary">Privacy Policy</span>
                      </Checkbox>
                      <div className="flex items-center justify-center gap-3 text-sm text-default-500 w-full">
                        <Divider className="flex-1" />
                        <span>or</span>
                        <Divider className="flex-1" />
                      </div>

                      <div className="grid grid-cols-1 gap-3">
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
                    <div className="space-y-6 text-center py-4">
                      <h3 className="text-lg font-medium">Verify your email</h3>
                      <p className="text-default-500 text-sm">
                        We sent a 6-digit code to{" "}
                        <span className="font-medium text-default-700">
                          {watch("email")}
                        </span>
                      </p>
                      <div className="flex gap-3 justify-center">
                        {[...Array(6)].map((_, i) => (
                          <Input
                            key={i}
                            type="text"
                            maxLength={1}
                            className="w-12 h-14 text-center text-xl font-medium"
                            classNames={{
                              input: "text-center",
                            }}
                          />
                        ))}
                      </div>
                      <Button variant="light" size="sm" className="text-sm">
                        Didn't receive code?{" "}
                        <span className="text-primary">Resend</span>
                      </Button>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-5">
                      <Input
                        {...register("firstName", {
                          required: "First name is required",
                          minLength: {
                            value: 2,
                            message: "Minimum 2 characters",
                          },
                        })}
                        label="First name"
                        placeholder="John"
                        errorMessage={errors.firstName?.message}
                        startContent={
                          <Icon
                            icon="solar:user-linear"
                            className="text-lg text-default-400"
                          />
                        }
                      />

                      <Input
                        {...register("lastName")}
                        label="Last name (optional)"
                        placeholder="Doe"
                        startContent={
                          <Icon
                            icon="solar:user-linear"
                            className="text-lg text-default-400"
                          />
                        }
                      />
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-5">
                      <Input
                        {...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 8,
                            message: "Minimum 8 characters",
                          },
                        })}
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        errorMessage={errors.password?.message}
                        startContent={
                          <Icon
                            icon="solar:lock-password-linear"
                            className="text-lg text-default-400"
                          />
                        }
                      />

                      <Input
                        {...register("confirmPassword", {
                          required: "Please confirm password",
                          validate: (value) =>
                            value === watch("password") ||
                            "Passwords don't match",
                        })}
                        type="password"
                        label="Confirm Password"
                        placeholder="••••••••"
                        errorMessage={errors.confirmPassword?.message}
                        startContent={
                          <Icon
                            icon="solar:lock-password-linear"
                            className="text-lg text-default-400"
                          />
                        }
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
                        Account Created!
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

            <ModalFooter className="px-6 pb-6 pt-2 flex-col gap-3 hidden">
              {step < 5 ? (
                <>
                  <Button
                    color="primary"
                    className="w-full"
                    onPress={step === 4 ? handleSubmit(onSubmit) : handleNext}
                    isLoading={isLoading}
                    isDisabled={
                      (step === 1 && (!isValid || !watch("terms"))) ||
                      (step === 3 && !watch("firstName"))
                    }
                  >
                    {step === 4 ? "Create Account" : "Continue"}
                  </Button>
                  <p className="text-default-500 text-sm text-center">
                    Already have an account?{" "}
                    <NextLink
                      href="/login"
                      className="text-primary hover:underline"
                    >
                      Sign in
                    </NextLink>
                  </p>
                </>
              ) : (
                <Button
                  color="primary"
                  className="w-full"
                  onPress={onClose}
                  startContent={<Icon icon="solar:rocket-linear" width={18} />}
                >
                  Get Started
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
      {mountedModal ? (
        <SignUpModal isOpen={currentModal === "signup"} onClose={closeModal} />
      ) : null}
    </>
  );
}
