import React from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

interface BaseViewProps {
  navigateTo: (view: string) => void;
  currentView: string;
  onClose?: () => void;
}

function View({ id, children, currentView }: { id: string; children: React.ReactNode; currentView: string }) {
  return currentView === id ? <>{children}</> : null;
}

const AccountPasswordView = ({ navigateTo, currentView }: BaseViewProps) => {
  return (
    <View id="account:password" currentView={currentView}>
      <div>
        <h3 className="text-lg font-medium">Change password</h3>
        <p className="mb-4 text-sm text-default-500">
          Changing your password will require you to log in again with the new password.
        </p>
      </div>
      <div className="space-y-4">
        <Input label="Current Password" type="password" placeholder="Enter current password" />
        <Input label="New Password" type="password" placeholder="Enter new password" />
        <Input label="Confirm New Password" type="password" placeholder="Confirm new password" />
        <div className="mt-4 flex gap-3">
          <Button radius="full" variant="light" onPress={() => navigateTo("account")}>Cancel</Button>
          <Button radius="full" color="primary">Update Password</Button>
        </div>
      </div>
    </View>
  );
};

export default AccountPasswordView;
