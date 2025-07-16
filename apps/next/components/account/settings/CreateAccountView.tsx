import React, { useMemo, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { cn } from "@heroui/theme";
import { addToast } from "@heroui/toast";
import { cloneDeep } from "lodash";
import { identityService } from "@/services";
import { useAccountState } from "@/states";
import { useTimer } from "@/hooks";
import { CompleteChangeAccountForm, CompleteVerifyAccountForm, AccountWithToken } from "@/services/identity-service";

interface BaseViewProps {
  navigateTo: (view: string) => void;
  currentView: string;
  onClose?: () => void;
}

function View({ id, children, currentView }: { id: string; children: React.ReactNode; currentView: string }) {
  return currentView === id ? <>{children}</> : null;
}

function CreateAccountView(
  accountAction: "verify" | "change",
  accountType: "email" | "phone-number"
) {
  return function CreateAccountView({ navigateTo, currentView }: BaseViewProps) {
    const [currentAccount, setAccount] = useAccountState();

    const form = useForm<CompleteVerifyAccountForm & CompleteChangeAccountForm>({
      mode: "onChange",
      defaultValues: {
        username: accountType === "email" ? currentAccount?.email : currentAccount?.phoneNumber,
        newUsername: "",
        code: ""
      }
    });
    const formErrors = useMemo(
      () => cloneDeep(form.formState.errors),
      [form.formState.isValid, form.formState.isSubmitting, form.formState.isDirty]
    );

    const [codeSending, setCodeSending] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [formSubmitting, setFormSubmitting] = useState(false);

    const label = accountType === "email" ? "Email" : "Phone Number";
    const actionLabel =
      accountAction === "verify" ? "Verify" : !!form.watch("username") ? "Change" : "Add";
    
    const description =
      accountAction === "verify"
        ? `Verifying your ${label.toLowerCase()} will help you recover your account if you forget your password.`
        : form.watch("username")
          ? `Changing your ${label.toLowerCase()} will require verification of the new ${label.toLowerCase()}.`
          : `Adding a ${label.toLowerCase()} will help you recover your account if you forget your password.`;

    const sendCodeTimer = useTimer({ timerType: "DECREMENTAL", initialTime: 60, endTime: 0 });

    const handleGetCode = useCallback(
      form.handleSubmit(async (formData) => {
        setCodeSending(true);
        try {
          const problem = await (accountAction === "verify"
            ? identityService.verifyAccount(formData)
            : identityService.changeAccount(formData));

          if (problem) {
            const entries = Object.entries(problem.errors || {});
            if (entries.length > 0) {
              entries.forEach(([name, message]) =>
                form.setError(name as keyof CompleteChangeAccountForm, { message })
              );
            } else {
              addToast({ title: problem.message, color: "danger" });
            }
          } else {
            addToast({ title: "Verification code sent!", color: "success" });
            sendCodeTimer.start();
            setCodeSent(true);
          }
        } finally {
          setCodeSending(false);
        }
      }),
      [form, sendCodeTimer, accountAction]
    );

    const handleSubmit = useCallback(
      form.handleSubmit(async (formData) => {
        setFormSubmitting(true);

        try {
          const problem = await (accountAction === "verify"
            ? identityService.completeVerifyAccount(formData)
            : identityService.completeChangeAccount(formData));

          if (problem) {
            const entries = Object.entries(problem.errors || {});
            if (entries.length > 0) {
              entries.forEach(([name, message]) =>
                form.setError(name as keyof CompleteChangeAccountForm, { message })
              );
            } else {
              addToast({ title: problem.message, color: "danger" });
            }
          } else {
            const [updatedAccount] = await identityService.getCurrentAccount();
            if (updatedAccount) {
              setAccount(
                (prevAccount) => ({ ...prevAccount, ...updatedAccount }) as AccountWithToken
              );
            }

            addToast({
              title: `${label} ${accountAction === "verify" ? "verified" : "updated"} successfully.`,
              color: "success"
            });
            navigateTo("account");
          }
        } finally {
          setFormSubmitting(false);
        }
      }),
      [form, navigateTo, accountAction, accountType]
    );

    return (
      <View id={`account:${accountAction}-${accountType}`} currentView={currentView}>
        <div>
          <h3 className="text-lg font-medium">
            {actionLabel} {label}
          </h3>
          <p className="mb-4 text-sm text-default-500">{description}</p>
        </div>

        <div className="space-y-4">
          {form.watch("username") && (
            <Controller
              name="username"
              control={form.control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={`Current ${label}`}
                  type="text"
                  isInvalid={!!formErrors.username}
                  errorMessage={formErrors.username?.message}
                  readOnly
                />
              )}
            />
          )}

          {accountAction == "change" && (
            <Controller
              name="newUsername"
              control={form.control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={`New ${label}`}
                  placeholder={`Enter new ${label.toLowerCase()}`}
                  type="text"
                  autoFocus
                  isInvalid={!!formErrors.newUsername}
                  errorMessage={formErrors.newUsername?.message}
                />
              )}
            />
          )}

          <Controller
            name="code"
            control={form.control}
            render={({ field }) => (
              <Input
                {...field}
                label="Verification Code"
                placeholder="Enter code"
                isInvalid={!!formErrors.code}
                errorMessage={formErrors.code?.message}
                description={
                  sendCodeTimer.isRunning
                    ? `Code sent! Resend in ${sendCodeTimer.time}s`
                    : `A verification code will be sent to your new ${label.toLowerCase()}.`
                }
                endContent={
                  <Button
                    radius="full"
                    size="sm"
                    variant="flat"
                    color="primary"
                    className={cn(sendCodeTimer.isRunning && "hidden")}
                    disabled={codeSending || sendCodeTimer.isRunning}
                    isLoading={codeSending}
                    onPress={() => handleGetCode()}
                  >
                    Send Code
                  </Button>
                }
              />
            )}
          />
          <div className="mt-4 flex justify-end gap-3">
            <Button
              className="hidden md:flex"
              radius="full"
              variant="flat"
              onPress={() => navigateTo("account")}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 md:flex-none"
              radius="full"
              color="primary"
              type="submit"
              isLoading={formSubmitting}
              isDisabled={formSubmitting || !codeSent}
              onPress={() => handleSubmit()}
            >
              {actionLabel} {label}
            </Button>
          </div>
        </div>
      </View>
    );
  };
}

export default CreateAccountView;
