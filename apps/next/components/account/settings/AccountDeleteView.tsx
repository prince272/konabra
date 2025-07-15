import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useAccountState } from "@/states";
import { identityService } from "@/services";
import { addToast } from "@heroui/toast";

interface BaseViewProps {
  navigateTo: (view: string) => void;
  currentView: string;
  onClose?: () => void;
}

function View({ id, children, currentView }: { id: string; children: React.ReactNode; currentView: string }) {
  return currentView === id ? <>{children}</> : null;
}

const AccountDeleteView = ({ navigateTo, currentView, onClose }: BaseViewProps) => {
  const [currentAccount, setAccount] = useAccountState();
  const { handleSubmit, control, formState } = useForm<{ username: string }>({
    defaultValues: {
      username: currentAccount?.email || currentAccount?.phoneNumber || ""
    }
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const onSubmit = handleSubmit(async () => {
    setIsDeleting(true);
    try {
      const problem = await identityService.deleteCurrentAccount();

      if (problem) {
        addToast({
          title: problem.message,
          color: "danger"
        });
      } else {
        addToast({
          title: "Account deleted successfully.",
          color: "success"
        });
        setAccount(null);
        navigateTo("account");
      }
    } finally {
      setIsDeleting(false);
    }
  });

  return (
    <View id="account:delete" currentView={currentView}>
      <div>
        <h3 className="text-lg font-medium">Delete account</h3>
        <p className="mb-4 text-sm text-default-500">
          Deleting your account is permanent and cannot be undone. All your data will be lost.
        </p>
      </div>
      <Controller
        name="username"
        control={control}
        rules={{
          required: "Username is required",
          validate: (value) =>
            value === (currentAccount?.email || currentAccount?.phoneNumber) ||
            "Please enter your current email or phone number"
        }}
        render={({ field, fieldState }) => (
          <Input
            {...field}
            label="Enter your email/phone number to confirm"
            type="text"
            placeholder="Your email or phone number"
            isInvalid={!!fieldState.error}
            errorMessage={fieldState.error?.message}
            description="Please type your registered email or phone number to confirm deletion"
          />
        )}
      />
      <div className="mt-6 rounded-lg bg-danger-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="mt-0.5 text-danger-600" />
          <div>
            <h4 className="font-medium text-danger-800">Before you proceed</h4>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-danger-700">
              <li>This action cannot be undone</li>
              <li>All your data will be permanently deleted</li>
              <li>You won&#39;t be able to recover your account</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <Button radius="full" variant="light" onPress={() => navigateTo("account")}>Cancel</Button>
        <Button
          radius="full"
          color="danger"
          onPress={() => onSubmit()}
          isLoading={isDeleting}
          isDisabled={!formState.isValid || isDeleting}
          startContent={<Trash2 size={20} />}
        >
          Delete Account Permanently
        </Button>
      </div>
    </View>
  );
};

export default AccountDeleteView; 