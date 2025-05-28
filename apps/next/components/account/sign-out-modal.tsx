"use client";

import { useCallback } from "react";
import NextLink from "next/link";
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { cn } from "@heroui/theme";
import { addToast } from "@heroui/toast";
import { Icon } from "@iconify-icon/react";
import { Controller, useForm } from "react-hook-form";
import { identityService } from "@/services";
import { SignOutForm } from "@/services/identity-service";
import { useAccountState } from "@/states";
import { useBreakpoint } from "@/hooks";
import { useModalRouter } from "@/components/common/models";

export default function SignOutModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose?: () => void;
}) {
  const [currentAccount] = useAccountState();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm<SignOutForm>({
    mode: "onChange",
    defaultValues: {
      refreshToken: currentAccount?.refreshToken,
      global: false
    }
  });
  const [, setAccount] = useAccountState();
  const isSmallScreen = useBreakpoint("sm", "down");

  const onSubmit = useCallback(
    async (data: SignOutForm) => {
      try {
        await identityService.signOut(data);
        setAccount(null);
        addToast({
          title: `Signed out successfully${data.global ? " from all sessions" : ""}.`,
          color: "success"
        });
        onClose?.();
      } catch (error) {
        addToast({
          title: "Failed to sign out. Please try again.",
          color: "danger"
        });
      }
    },
    [onClose, setAccount]
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
          <Icon icon="material-symbols:close-rounded" width="20" height="20" />
        </Button>
      }
      classNames={{
        wrapper: cn(isSmallScreen && "h-full")
      }}
    >
      <ModalContent className={cn(!isSmallScreen && "min-h-[300px]", "top-0")}>
        <ModalHeader className="flex flex-col gap-4 px-6 pt-8">
          <div className="flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-medium">Sign Out</h3>
            <p className="text-sm text-default-500">
              Are you sure you want to sign out of your account?
            </p>
          </div>
        </ModalHeader>

        <ModalBody className="px-6 py-6">
          <form id="sign-out-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <Controller
                name="global"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    isSelected={field.value}
                    onValueChange={field.onChange}
                    className="text-sm text-default-500"
                  >
                    Sign out of all active sessions
                  </Checkbox>
                )}
              />
            </div>
          </form>
        </ModalBody>

        <ModalFooter className="flex flex-col gap-4 px-6 pb-8 pt-4">
          <Button
            radius="full"
            color="primary"
            isDisabled={isSubmitting}
            isLoading={isSubmitting}
            form="sign-out-form"
            type="submit"
            startContent={<Icon icon="solar:logout-2-broken" width="20" height="20" />}
            className="w-full"
          >
            Sign Out
          </Button>
          <Button
            radius="full"
            variant="light"
            size="sm"
            className="mx-auto w-fit text-center text-sm text-primary"
            as={NextLink}
            href="#"
            onPress={onClose}
          >
            Stay Signed In
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function SignOutModalRouter() {
  const { closeModal, currentModal, mountedModal } = useModalRouter();

  return (
    <>
      {mountedModal === "signout" ? (
        <SignOutModal isOpen={currentModal === "signout"} onClose={closeModal} />
      ) : null}
    </>
  );
}
