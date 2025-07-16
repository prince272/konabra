import { User, Phone, Key, Trash2 } from "lucide-react";
import { Button } from "@heroui/button";
import { useAccountState } from "@/states";
import { formatInternationalNumber } from "@/utils";
import { Remount } from "../../common/remount";
import { formatDistanceToNow } from "date-fns";
import React from "react";

interface BaseViewProps {
  navigateTo: (view: string) => void;
  currentView: string;
  onClose?: () => void;
}

function View({ id, children, currentView }: { id: string; children: React.ReactNode; currentView: string }) {
  return currentView === id ? <>{children}</> : null;
}

const AccountView = ({ navigateTo, currentView }: BaseViewProps) => {
  const [currentAccount] = useAccountState();

  return (
    <View id="account" currentView={currentView}>
      <div className="grid grid-cols-1 gap-6">
        {/* Email Section */}
        <div className="rounded-xl bg-default-100 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <User size={20} />
              <h4 className="font-medium">Email Address</h4>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-medium">
              {currentAccount?.email ? (
                <>
                  <span className="mr-2">{currentAccount?.email}</span>
                </>
              ) : (
                <span className="text-default-500">No email address added</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!!currentAccount?.email && !currentAccount?.emailVerified && (
                <Button
                  radius="full"
                  size="sm"
                  variant="flat"
                  color="warning"
                  onPress={() => navigateTo("account:verify-email")}
                >
                  Verify
                </Button>
              )}
              <Button
                radius="full"
                variant="flat"
                color="primary"
                size="sm"
                onPress={() => navigateTo("account:change-email")}
              >
                {currentAccount?.email ? "Change" : "Add"}
              </Button>
            </div>
          </div>
        </div>

        {/* Phone Number Section */}
        <div className="rounded-xl bg-default-100 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Phone size={20} />
              <h4 className="font-medium">Phone Number</h4>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-medium">
              {currentAccount?.phoneNumber ? (
                <>
                  <span className="mr-2">
                    {formatInternationalNumber(currentAccount?.phoneNumber)}
                  </span>
                </>
              ) : (
                <span className="text-default-500">No phone number added</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!!currentAccount?.phoneNumber && !currentAccount?.phoneNumberVerified && (
                <Button
                  radius="full"
                  size="sm"
                  variant="flat"
                  color="warning"
                  onPress={() => navigateTo("account:verify-phone-number")}
                >
                  Verify
                </Button>
              )}
              <Button
                radius="full"
                variant="flat"
                color="primary"
                size="sm"
                onPress={() => navigateTo("account:change-phone-number")}
              >
                {currentAccount?.phoneNumber ? "Change" : "Add"}
              </Button>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="rounded-xl bg-default-100 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Key size={20} />
              <h4 className="font-medium">Password</h4>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="text-sm font-medium">
              <span className="text-default-500">
                Last changed:{" "}
                <Remount interval={1000}>
                  {() => {
                    return currentAccount?.lastPasswordChangedAt
                      ? formatDistanceToNow(new Date(currentAccount.lastPasswordChangedAt), {
                          addSuffix: true
                        })
                      : "N/A";
                  }}
                </Remount>
              </span>
            </div>
            <Button
              radius="full"
              variant="flat"
              color="primary"
              size="sm"
              onPress={() => navigateTo("account:password")}
            >
              Change
            </Button>
          </div>
        </div>

        {/* Danger Zone Sections */}
        <div className="space-y-6">
          <div className="rounded-xl bg-danger-50 p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Trash2 size={20} className="text-danger" />
              <h4 className="font-medium text-danger">Delete Account</h4>
            </div>
            <p className="mt-2 text-sm text-danger-600">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button
              radius="full"
              variant="solid"
              color="danger"
              fullWidth
              startContent={<Trash2 size={20} />}
              onPress={() => navigateTo("account:delete")}
              className="mt-3 font-medium"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </View>
  );
};

export default AccountView; 