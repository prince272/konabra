"use client";

import { createContext, ReactNode, useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { cn } from "@heroui/theme";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  AudioLines,
  Bell,
  Folder,
  Laptop,
  Lock,
  Menu,
  Monitor,
  Moon,
  Settings,
  Sun,
  User,
  X
} from "lucide-react";
import { useAccountState } from "@/states";
import { useBreakpoint, useHashState } from "@/hooks";
import { useModalRouter } from "@/components/common/modals";
import AccountView from "./settings/AccountView";
import AccountChangeEmailView from "./settings/AccountChangeEmailView";
import AccountChangePhoneNumberView from "./settings/AccountChangePhoneNumberView";
import AccountVerifyEmailView from "./settings/AccountVerifyEmailView";
import AccountVerifyPhoneNumberView from "./settings/AccountVerifyPhoneNumberView";
import AccountPasswordView from "./settings/AccountPasswordView";
import AccountDeleteView from "./settings/AccountDeleteView";
import NotificationsView from "./settings/NotificationsView";
import DisplayView from "./settings/DisplayView";
import SoundView from "./settings/SoundView";
import StorageView from "./settings/StorageView";
import PrivacyView from "./settings/PrivacyView";

interface ViewContextType {
  title: string;
  icon: string;
}

const ViewContext = createContext<ViewContextType>({
  title: "Settings",
  icon: "settings"
});

interface ViewProps {
  id: string;
  children: ReactNode;
  currentView: string;
}

// function View({ id, children, currentView }: ViewProps) {
//   return currentView === id ? <>{children}</> : null;
// }

// interface BaseViewProps {
//   navigateTo: (view: string) => void;
//   currentView: string;
//   onClose?: () => void;
// }

// const themeOptions = [
//   { key: "light", label: "Light", icon: <Sun size={20} /> },
//   { key: "dark", label: "Dark", icon: <Moon size={20} /> },
//   { key: "system", label: "System", icon: <Laptop size={20} /> }
// ];

interface SettingsModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [hash, setHash] = useHashState();
  const [currentAccount] = useAccountState();
  const [currentView, setCurrentView] = useState<string>(hash.split(":").slice(1).join(":") || "");
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [isMenuSelected, setIsMenuSelected] = useState<boolean>(false);
  const [viewInfo, setViewInfo] = useState<{ title: string; icon: string }>({
    title: "Settings",
    icon: "settings"
  });

  const isSmallScreen = useBreakpoint("sm", "down");

  const menuItems = [
    { id: "account", label: "Account", icon: "user" },
    { id: "notifications", label: "Notifications", icon: "bell" },
    { id: "display", label: "Display", icon: "monitor" },
    { id: "sound", label: "Sound", icon: "soundwave" },
    { id: "storage", label: "Storage", icon: "folder" },
    { id: "privacy", label: "Privacy", icon: "lock" }
  ];

  const viewInfoMap: Record<string, { title: string; icon: string }> = {
    "": { title: "Settings", icon: "settings" },
    account: { title: "Account", icon: "user" },
    notifications: { title: "Notifications", icon: "bell" },
    display: { title: "Display", icon: "monitor" },
    sound: { title: "Sound", icon: "soundwave" },
    storage: { title: "Storage", icon: "folder" },
    privacy: { title: "Privacy", icon: "lock" }
  };

  useEffect(() => {
    const mainViewId = currentView.split(":")[0] || "";
    const info = viewInfoMap[mainViewId] || {
      title: "Settings",
      icon: "settings"
    };
    setViewInfo(info);
  }, [currentView]);

  const navigateTo = (view: string) => {
    setCurrentView(view);
    setIsMenuSelected(true);
    if (isSmallScreen) {
      setShowSidebar(false);
    }

    setHash(`settings:${view}`);
  };

  const backToMenu = () => {
    setIsMenuSelected(false);
    setShowSidebar(true);
    setCurrentView("");
  };

  const backToParent = () => {
    const parentView = currentView.split(":").slice(0, -1).join(":");
    navigateTo(parentView || "");
  };

  useEffect(() => {
    // Manage sidebar visibility
    setShowSidebar(isSmallScreen ? !isMenuSelected : true);

    // Set default menu to "account" when switching from small to large screen and no menu is selected
    if (!isSmallScreen && !isMenuSelected && !currentView) {
      setCurrentView("account");
      setIsMenuSelected(true);
    }
  }, [isSmallScreen, isMenuSelected, currentView]);

  return (
    <ViewContext.Provider value={viewInfo}>
      <Modal
        isOpen={isOpen}
        isDismissable={false}
        onClose={onClose}
        size={isSmallScreen ? "full" : "3xl"}
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
        <ModalContent className={cn(!isSmallScreen && "min-h-[600px]")}>
          <ModalHeader className="pb-1">
            <div className="flex min-h-10 items-center gap-2">
              {isSmallScreen && isMenuSelected && currentView.split(":").length === 1 ? (
                <Button isIconOnly variant="light" onPress={backToMenu}>
                  <ArrowLeft size={20} />
                </Button>
              ) : currentView.includes(":") ? (
                <Button isIconOnly variant="light" onPress={backToParent}>
                  <ArrowLeft size={20} />
                </Button>
              ) : isSmallScreen && !showSidebar ? (
                <Button isIconOnly variant="light" onPress={() => setShowSidebar(true)}>
                  <Menu size={20} />
                </Button>
              ) : (
                <Button isIconOnly variant="light">
                  {viewInfo.icon === "settings" && <Settings size={20} />}
                  {viewInfo.icon === "user" && <User size={20} />}
                  {viewInfo.icon === "bell" && <Bell size={20} />}
                  {viewInfo.icon === "monitor" && <Monitor size={20} />}
                  {viewInfo.icon === "soundwave" && <AudioLines size={20} />}
                  {viewInfo.icon === "folder" && <Folder size={20} />}
                  {viewInfo.icon === "lock" && <Lock size={20} />}
                </Button>
              )}
              <h2 className="text-xl font-bold">{viewInfo.title}</h2>
            </div>
          </ModalHeader>
          <ModalBody className="flex flex-col overflow-x-hidden px-0 pt-0 md:flex-row">
            {showSidebar && (
              <motion.div
                className="w-full p-4 md:w-64"
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="space-y-1">
                  {menuItems.map((item) => (
                    <Button
                      radius="full"
                      key={item.id}
                      variant={
                        currentView === item.id || currentView.startsWith(`${item.id}:`)
                          ? "solid"
                          : "light"
                      }
                      color={
                        currentView === item.id || currentView.startsWith(`${item.id}:`)
                          ? "primary"
                          : "default"
                      }
                      size={isSmallScreen ? "lg" : "md"}
                      fullWidth
                      className="justify-start"
                      startContent={
                        item.icon === "user" ? (
                          <User size={20} />
                        ) : item.icon === "bell" ? (
                          <Bell size={20} />
                        ) : item.icon === "monitor" ? (
                          <Monitor size={20} />
                        ) : item.icon === "soundwave" ? (
                          <AudioLines size={20} />
                        ) : item.icon === "folder" ? (
                          <Folder size={20} />
                        ) : item.icon === "lock" ? (
                          <Lock size={20} />
                        ) : null
                      }
                      onPress={() => navigateTo(item.id)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
            {(!showSidebar || !isSmallScreen) && currentView && (
              <div
                className={`flex-1 overflow-y-auto p-6 md:p-4 ${showSidebar ? "md:block" : "w-full"} overflow-x-hidden`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentView}
                    variants={{
                      enter: (direction: number) => ({
                        x: direction > 0 ? "20%" : "-20%",
                        opacity: 0
                      }),
                      center: {
                        x: 0,
                        opacity: 1,
                        transition: { duration: 0.15, ease: "easeOut" }
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
                    <div className="flex flex-col space-y-6">
                      <AccountView navigateTo={navigateTo} currentView={currentView} />
                      <AccountChangeEmailView navigateTo={navigateTo} currentView={currentView} />
                      <AccountChangePhoneNumberView
                        navigateTo={navigateTo}
                        currentView={currentView}
                      />
                      <AccountVerifyEmailView navigateTo={navigateTo} currentView={currentView} />
                      <AccountVerifyPhoneNumberView
                        navigateTo={navigateTo}
                        currentView={currentView}
                      />
                      <AccountPasswordView navigateTo={navigateTo} currentView={currentView} />
                      <AccountDeleteView
                        onClose={onClose}
                        navigateTo={navigateTo}
                        currentView={currentView}
                      />
                      <NotificationsView navigateTo={navigateTo} currentView={currentView} />
                      <DisplayView navigateTo={navigateTo} currentView={currentView} />
                      <SoundView navigateTo={navigateTo} currentView={currentView} />
                      <StorageView navigateTo={navigateTo} currentView={currentView} />
                      <PrivacyView navigateTo={navigateTo} currentView={currentView} />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </ViewContext.Provider>
  );
}

export function SettingsModalRouter() {
  const { closeModal, currentModal, mountedModal } = useModalRouter();
  return (
    <>
      {mountedModal?.split(":")[0] === "settings" ? (
        <SettingsModal isOpen={currentModal?.split(":")[0] === "settings"} onClose={closeModal} />
      ) : null}
    </>
  );
}


// "use client";

// import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
// import { Input } from "@heroui/input";
// import { Button } from "@heroui/button";
// import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
// import { Switch } from "@heroui/switch";
// import { cn } from "@heroui/theme";
// import { addToast } from "@heroui/toast";
// import { formatDistanceToNow } from "date-fns";
// import { AnimatePresence, motion } from "framer-motion";
// import { cloneDeep, upperFirst } from "lodash";
// import {
//   AlertTriangle,
//   ArrowLeft,
//   AudioLines,
//   Bell,
//   ChevronDown,
//   Folder,
//   Key,
//   Laptop,
//   Lock,
//   Menu,
//   Monitor,
//   Moon,
//   Phone,
//   Settings,
//   Sun,
//   Trash2,
//   User,
//   X
// } from "lucide-react";
// import { useTheme } from "next-themes";
// import { Controller, useForm } from "react-hook-form";
// import { formatInternationalNumber } from "@/utils";
// import { identityService } from "@/services";
// import {
//   AccountWithToken,
//   CompleteChangeAccountForm,
//   CompleteVerifyAccountForm
// } from "@/services/identity-service";
// import { useAccountState, useApplicationState } from "@/states";
// import { useBreakpoint, useHashState, useInterval, useTimer } from "@/hooks";
// import { useModalRouter } from "@/components/common/modals";
// import { Remount } from "../common/remount";
// import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";

// interface ViewContextType {
//   title: string;
//   icon: string;
// }

// const ViewContext = createContext<ViewContextType>({
//   title: "Settings",
//   icon: "settings"
// });

// interface ViewProps {
//   id: string;
//   children: ReactNode;
//   currentView: string;
// }

// function View({ id, children, currentView }: ViewProps) {
//   return currentView === id ? <>{children}</> : null;
// }

// interface BaseViewProps {
//   navigateTo: (view: string) => void;
//   currentView: string;
//   onClose?: () => void;
// }

// function AccountView({ navigateTo, currentView }: BaseViewProps) {
//   const [currentAccount] = useAccountState();

//   return (
//     <View id="account" currentView={currentView}>
//       <div className="grid grid-cols-1 gap-6">
//         {/* Email Section */}
//         <div className="rounded-xl bg-default-100 p-4 shadow-sm">
//           <div className="flex items-start justify-between">
//             <div className="flex items-center gap-2">
//               <User size={20} />
//               <h4 className="font-medium">Email Address</h4>
//             </div>
//           </div>
//           <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
//             <div className="text-sm font-medium">
//               {currentAccount?.email ? (
//                 <>
//                   <span className="mr-2">{currentAccount?.email}</span>
//                 </>
//               ) : (
//                 <span className="text-default-500">No email address added</span>
//               )}
//             </div>
//             <div className="flex items-center gap-2">
//               {!!currentAccount?.email && !currentAccount?.emailVerified && (
//                 <Button
//                   radius="full"
//                   size="sm"
//                   variant="flat"
//                   color="warning"
//                   onPress={() => navigateTo("account:verify-email")}
//                 >
//                   Verify
//                 </Button>
//               )}
//               <Button
//                 radius="full"
//                 variant="flat"
//                 color="primary"
//                 size="sm"
//                 onPress={() => navigateTo("account:change-email")}
//               >
//                 {currentAccount?.email ? "Change" : "Add"}
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Phone Number Section */}
//         <div className="rounded-xl bg-default-100 p-4 shadow-sm">
//           <div className="flex items-start justify-between">
//             <div className="flex items-center gap-2">
//               <Phone size={20} />
//               <h4 className="font-medium">Phone Number</h4>
//             </div>
//           </div>
//           <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
//             <div className="text-sm font-medium">
//               {currentAccount?.phoneNumber ? (
//                 <>
//                   <span className="mr-2">
//                     {formatInternationalNumber(currentAccount?.phoneNumber)}
//                   </span>
//                 </>
//               ) : (
//                 <span className="text-default-500">No phone number added</span>
//               )}
//             </div>
//             <div className="flex items-center gap-2">
//               {!!currentAccount?.phoneNumber && !currentAccount?.phoneNumberVerified && (
//                 <Button
//                   radius="full"
//                   size="sm"
//                   variant="flat"
//                   color="warning"
//                   onPress={() => navigateTo("account:verify-phone-number")}
//                 >
//                   Verify
//                 </Button>
//               )}
//               <Button
//                 radius="full"
//                 variant="flat"
//                 color="primary"
//                 size="sm"
//                 onPress={() => navigateTo("account:change-phone-number")}
//               >
//                 {currentAccount?.phoneNumber ? "Change" : "Add"}
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Password Section */}
//         <div className="rounded-xl bg-default-100 p-4 shadow-sm">
//           <div className="flex items-start justify-between">
//             <div className="flex items-center gap-2">
//               <Key size={20} />
//               <h4 className="font-medium">Password</h4>
//             </div>
//           </div>
//           <div className="mt-3 flex items-center justify-between gap-2">
//             <div className="text-sm font-medium">
//               <span className="text-default-500">
//                 Last changed:{" "}
//                 <Remount interval={1000}>
//                   {() => {
//                     return currentAccount?.lastPasswordChangedAt
//                       ? formatDistanceToNow(new Date(currentAccount.lastPasswordChangedAt), {
//                           addSuffix: true
//                         })
//                       : "N/A";
//                   }}
//                 </Remount>
//               </span>
//             </div>
//             <Button
//               radius="full"
//               variant="flat"
//               color="primary"
//               size="sm"
//               onPress={() => navigateTo("account:password")}
//             >
//               Change
//             </Button>
//           </div>
//         </div>

//         {/* Danger Zone Sections */}
//         <div className="space-y-6">
//           <div className="rounded-xl bg-danger-50 p-4 shadow-sm">
//             <div className="flex items-center gap-2">
//               <Trash2 size={20} className="text-danger" />
//               <h4 className="font-medium text-danger">Delete Account</h4>
//             </div>
//             <p className="mt-2 text-sm text-danger-600">
//               Permanently delete your account and all associated data. This action cannot be undone.
//             </p>
//             <Button
//               radius="full"
//               variant="solid"
//               color="danger"
//               fullWidth
//               startContent={<Trash2 size={20} />}
//               onPress={() => navigateTo("account:delete")}
//               className="mt-3 font-medium"
//             >
//               Delete Account
//             </Button>
//           </div>
//         </div>
//       </div>
//     </View>
//   );
// }

// function CreateAccountView(
//   accountAction: "verify" | "change",
//   accountType: "email" | "phone-number"
// ) {
//   return function CreateAccountView({ navigateTo, currentView }: BaseViewProps) {
//     const [currentAccount, setAccount] = useAccountState();

//     const form = useForm<CompleteVerifyAccountForm & CompleteChangeAccountForm>({
//       mode: "onChange",
//       defaultValues: {
//         username: accountType === "email" ? currentAccount?.email : currentAccount?.phoneNumber,
//         newUsername: "",
//         code: ""
//       }
//     });
//     const formErrors = useMemo(
//       () => cloneDeep(form.formState.errors),
//       [form.formState.isValid, form.formState.isSubmitting, form.formState.isDirty]
//     );

//     const [codeSending, setCodeSending] = useState(false);
//     const [codeSent, setCodeSent] = useState(false);
//     const [formSubmitting, setFormSubmitting] = useState(false);

//     const label = accountType === "email" ? "Email" : "Phone Number";
//     const actionLabel =
//       accountAction === "verify" ? "Verify" : !!form.watch("username") ? "Change" : "Add";
    
//     const description =
//       accountAction === "verify"
//         ? `Verifying your ${label.toLowerCase()} will help you recover your account if you forget your password.`
//         : form.watch("username")
//           ? `Changing your ${label.toLowerCase()} will require verification of the new ${label.toLowerCase()}.`
//           : `Adding a ${label.toLowerCase()} will help you recover your account if you forget your password.`;

//     const sendCodeTimer = useTimer({ timerType: "DECREMENTAL", initialTime: 60, endTime: 0 });

//     const handleGetCode = useCallback(
//       form.handleSubmit(async (formData) => {
//         setCodeSending(true);
//         try {
//           const problem = await (accountAction === "verify"
//             ? identityService.verifyAccount(formData)
//             : identityService.changeAccount(formData));

//           if (problem) {
//             const entries = Object.entries(problem.errors || {});
//             if (entries.length > 0) {
//               entries.forEach(([name, message]) =>
//                 form.setError(name as keyof CompleteChangeAccountForm, { message })
//               );
//             } else {
//               addToast({ title: problem.message, color: "danger" });
//             }
//           } else {
//             addToast({ title: "Verification code sent!", color: "success" });
//             sendCodeTimer.start();
//             setCodeSent(true);
//           }
//         } finally {
//           setCodeSending(false);
//         }
//       }),
//       [form, sendCodeTimer, accountAction]
//     );

//     const handleSubmit = useCallback(
//       form.handleSubmit(async (formData) => {
//         setFormSubmitting(true);

//         try {
//           const problem = await (accountAction === "verify"
//             ? identityService.completeVerifyAccount(formData)
//             : identityService.completeChangeAccount(formData));

//           if (problem) {
//             const entries = Object.entries(problem.errors || {});
//             if (entries.length > 0) {
//               entries.forEach(([name, message]) =>
//                 form.setError(name as keyof CompleteChangeAccountForm, { message })
//               );
//             } else {
//               addToast({ title: problem.message, color: "danger" });
//             }
//           } else {
//             const [updatedAccount] = await identityService.getCurrentAccount();
//             if (updatedAccount) {
//               setAccount(
//                 (prevAccount) => ({ ...prevAccount, ...updatedAccount }) as AccountWithToken
//               );
//             }

//             addToast({
//               title: `${label} ${accountAction === "verify" ? "verified" : "updated"} successfully.`,
//               color: "success"
//             });
//             navigateTo("account");
//           }
//         } finally {
//           setFormSubmitting(false);
//         }
//       }),
//       [form, navigateTo, accountAction, accountType]
//     );

//     return (
//       <View id={`account:${accountAction}-${accountType}`} currentView={currentView}>
//         <div>
//           <h3 className="text-lg font-medium">
//             {actionLabel} {label}
//           </h3>
//           <p className="mb-4 text-sm text-default-500">{description}</p>
//         </div>

//         <div className="space-y-4">
//           {form.watch("username") && (
//             <Controller
//               name="username"
//               control={form.control}
//               render={({ field }) => (
//                 <Input
//                   {...field}
//                   label={`Current ${label}`}
//                   type="text"
//                   isInvalid={!!formErrors.username}
//                   errorMessage={formErrors.username?.message}
//                   readOnly
//                 />
//               )}
//             />
//           )}

//           {accountAction == "change" && (
//             <Controller
//               name="newUsername"
//               control={form.control}
//               render={({ field }) => (
//                 <Input
//                   {...field}
//                   label={`New ${label}`}
//                   placeholder={`Enter new ${label.toLowerCase()}`}
//                   type="text"
//                   autoFocus
//                   isInvalid={!!formErrors.newUsername}
//                   errorMessage={formErrors.newUsername?.message}
//                 />
//               )}
//             />
//           )}

//           <Controller
//             name="code"
//             control={form.control}
//             render={({ field }) => (
//               <Input
//                 {...field}
//                 label="Verification Code"
//                 placeholder="Enter code"
//                 isInvalid={!!formErrors.code}
//                 errorMessage={formErrors.code?.message}
//                 description={
//                   sendCodeTimer.isRunning
//                     ? `Code sent! Resend in ${sendCodeTimer.time}s`
//                     : `A verification code will be sent to your new ${label.toLowerCase()}.`
//                 }
//                 endContent={
//                   <Button
//                     radius="full"
//                     size="sm"
//                     variant="flat"
//                     color="primary"
//                     className={cn(sendCodeTimer.isRunning && "hidden")}
//                     disabled={codeSending || sendCodeTimer.isRunning}
//                     isLoading={codeSending}
//                     onPress={() => handleGetCode()}
//                   >
//                     Send Code
//                   </Button>
//                 }
//               />
//             )}
//           />
//           <div className="mt-4 flex justify-end gap-3">
//             <Button
//               className="hidden md:flex"
//               radius="full"
//               variant="flat"
//               onPress={() => navigateTo("account")}
//             >
//               Cancel
//             </Button>
//             <Button
//               className="flex-1 md:flex-none"
//               radius="full"
//               color="primary"
//               type="submit"
//               isLoading={formSubmitting}
//               isDisabled={formSubmitting || !codeSent}
//               onPress={() => handleSubmit()}
//             >
//               {actionLabel} {label}
//             </Button>
//           </div>
//         </div>
//       </View>
//     );
//   };
// }

// const AccountChangeEmailView = CreateAccountView("change", "email");
// const AccountChangePhoneNumberView = CreateAccountView("change", "phone-number");

// const AccountVerifyEmailView = CreateAccountView("verify", "email");
// const AccountVerifyPhoneNumberView = CreateAccountView("verify", "phone-number");

// function AccountPasswordView({ navigateTo, currentView }: BaseViewProps) {
//   return (
//     <View id="account:password" currentView={currentView}>
//       <div>
//         <h3 className="text-lg font-medium">Change password</h3>
//         <p className="mb-4 text-sm text-default-500">
//           Changing your password will require you to log in again with the new password.
//         </p>
//       </div>
//       <div className="space-y-4">
//         <Input label="Current Password" type="password" placeholder="Enter current password" />
//         <Input label="New Password" type="password" placeholder="Enter new password" />
//         <Input label="Confirm New Password" type="password" placeholder="Confirm new password" />
//         <div className="mt-4 flex gap-3">
//           <Button radius="full" variant="light" onPress={() => navigateTo("account")}>
//             Cancel
//           </Button>
//           <Button radius="full" color="primary">
//             Update Password
//           </Button>
//         </div>
//       </div>
//     </View>
//   );
// }

// function AccountDeleteView({ navigateTo, currentView }: BaseViewProps) {
//   const [currentAccount, setAccount] = useAccountState();
//   const { handleSubmit, control, formState } = useForm<{ username: string }>({
//     defaultValues: {
//       username: currentAccount?.email || currentAccount?.phoneNumber || ""
//     }
//   });
//   const [isDeleting, setIsDeleting] = useState(false);

//   const onSubmit = handleSubmit(async () => {
//     setIsDeleting(true);
//     try {
//       const problem = await identityService.deleteCurrentAccount();

//       if (problem) {
//         addToast({
//           title: problem.message,
//           color: "danger"
//         });
//       } else {
//         addToast({
//           title: "Account deleted successfully.",
//           color: "success"
//         });
//         // Clear the current account state
//         setAccount(null);
//         // Navigate to home or login page if needed
//         navigateTo("account");
//       }
//     } finally {
//       setIsDeleting(false);
//     }
//   });

//   return (
//     <View id="account:delete" currentView={currentView}>
//       <div>
//         <h3 className="text-lg font-medium">Delete account</h3>
//         <p className="mb-4 text-sm text-default-500">
//           Deleting your account is permanent and cannot be undone. All your data will be lost.
//         </p>
//       </div>
//       <Controller
//         name="username"
//         control={control}
//         rules={{
//           required: "Username is required",
//           validate: (value) =>
//             value === (currentAccount?.email || currentAccount?.phoneNumber) ||
//             "Please enter your current email or phone number"
//         }}
//         render={({ field, fieldState }) => (
//           <Input
//             {...field}
//             label="Enter your email/phone number to confirm"
//             type="text"
//             placeholder="Your email or phone number"
//             isInvalid={!!fieldState.error}
//             errorMessage={fieldState.error?.message}
//             description="Please type your registered email or phone number to confirm deletion"
//           />
//         )}
//       />
//       <div className="mt-6 rounded-lg bg-danger-50 p-4">
//         <div className="flex items-start gap-3">
//           <AlertTriangle size={20} className="mt-0.5 text-danger-600" />
//           <div>
//             <h4 className="font-medium text-danger-800">Before you proceed</h4>
//             <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-danger-700">
//               <li>This action cannot be undone</li>
//               <li>All your data will be permanently deleted</li>
//               <li>You won&#39;t be able to recover your account</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//       <div className="mt-4 flex gap-3">
//         <Button radius="full" variant="light" onPress={() => navigateTo("account")}>
//           Cancel
//         </Button>
//         <Button
//           radius="full"
//           color="danger"
//           onPress={() => onSubmit()}
//           isLoading={isDeleting}
//           isDisabled={!formState.isValid || isDeleting}
//           startContent={<Trash2 size={20} />}
//         >
//           Delete Account Permanently
//         </Button>
//       </div>
//     </View>
//   );
// }

// function NotificationsView({ currentView }: BaseViewProps) {
//   return (
//     <View id="notifications" currentView={currentView}>
//       <div className="space-y-6">
//         <div className="rounded-xl bg-default-100 p-4 shadow-sm">
//           <div className="flex items-center gap-2">
//             <Bell size={20} />
//             <h4 className="font-medium">General Notifications</h4>
//           </div>
//           <div className="mt-3 space-y-3">
//             <div className="flex items-center justify-between">
//               <span>System notifications</span>
//               <Switch defaultSelected />
//             </div>
//             <div className="flex items-center justify-between">
//               <span>App notifications</span>
//               <Switch defaultSelected />
//             </div>
//             <div className="flex items-center justify-between">
//               <span>Email notifications</span>
//               <Switch />
//             </div>
//           </div>
//         </div>
//         <div className="rounded-xl bg-default-100 p-4 shadow-sm">
//           <div className="flex items-center gap-2">
//             <Moon size={20} />
//             <h4 className="font-medium">Do Not Disturb</h4>
//           </div>
//           <div className="mt-3 space-y-3">
//             <div className="flex items-center justify-between">
//               <span>Enable Do Not Disturb</span>
//               <Switch />
//             </div>
//             <div className="flex items-center justify-between">
//               <span>Schedule</span>
//               <Switch />
//             </div>
//           </div>
//         </div>
//       </div>
//     </View>
//   );
// }

// const themeOptions = [
//   { key: "light", label: "Light", icon: <Sun size={20} /> },
//   { key: "dark", label: "Dark", icon: <Moon size={20} /> },
//   { key: "system", label: "System", icon: <Laptop size={20} /> }
// ];

// export function DisplayView({ currentView }: BaseViewProps) {
//   const { theme = "system", setTheme } = useTheme();

//   const selectedOption = themeOptions.find((opt) => opt.key === theme) || themeOptions[2];

//   return (
//     <View id="display" currentView={currentView}>
//       <div className="space-y-6">
//         <div className="rounded-xl bg-default-100 p-4 shadow-sm">
//           <h4 className="font-medium">Theme</h4>
//           <div className="mt-3 space-y-3">
//             <div className="flex items-center justify-between">
//               <span>Appearance</span>
//               <Dropdown>
//                 <DropdownTrigger>
//                   <Button
//                     size="sm"
//                     variant="flat"
//                     endContent={<ChevronDown size={20} />}
//                     className="w-[140px] justify-between capitalize"
//                   >
//                     {selectedOption.icon}
//                     {selectedOption.label}
//                   </Button>
//                 </DropdownTrigger>
//                 <DropdownMenu
//                   aria-label="Theme Options"
//                   variant="flat"
//                   disallowEmptySelection
//                   selectionMode="single"
//                   selectedKeys={[theme]}
//                   onSelectionChange={(keys) => {
//                     const selected = Array.from(keys)[0] as string;
//                     setTheme(selected);
//                   }}
//                 >
//                   {themeOptions.map(({ key, label, icon }) => (
//                     <DropdownItem key={key} startContent={icon}>
//                       {label}
//                     </DropdownItem>
//                   ))}
//                 </DropdownMenu>
//               </Dropdown>
//             </div>
//           </div>
//         </div>
//       </div>
//     </View>
//   );
// }

// function SoundView({ currentView }: BaseViewProps) {
//   return (
//     <View id="sound" currentView={currentView}>
//       <div className="space-y-6">
//         <div className="rounded-xl bg-default-100 p-4 shadow-sm">
//           <h4 className="font-medium">Sound Preferences</h4>
//           <div className="mt-3 space-y-3">
//             <div className="flex items-center justify-between">
//               <span>Notification Sounds</span>
//               <Switch defaultSelected />
//             </div>
//           </div>
//         </div>
//       </div>
//     </View>
//   );
// }

// function StorageView({ currentView }: BaseViewProps) {
//   return (
//     <View id="storage" currentView={currentView}>
//       <div className="space-y-6">
//         <div className="rounded-xl bg-default-100 p-4 shadow-sm">
//           <h4 className="font-medium">Storage Usage</h4>
//           <div className="mt-3">
//             <p className="text-sm">Total used: 1.2 GB of 5 GB</p>
//           </div>
//         </div>
//       </div>
//     </View>
//   );
// }

// function PrivacyView({ currentView }: BaseViewProps) {
//   return (
//     <View id="privacy" currentView={currentView}>
//       <div className="space-y-6">
//         <div className="rounded-xl bg-default-100 p-4 shadow-sm">
//           <h4 className="font-medium">Privacy Settings</h4>
//           <div className="mt-3 space-y-3">
//             <div className="flex items-center justify-between">
//               <span>Analytics Tracking</span>
//               <Switch />
//             </div>
//           </div>
//         </div>
//       </div>
//     </View>
//   );
// }

// interface SettingsModalProps {
//   isOpen: boolean;
//   onClose?: () => void;
// }

// export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
//   const [hash, setHash] = useHashState();
//   const [currentAccount] = useAccountState();
//   const [currentView, setCurrentView] = useState<string>(hash.split(":").slice(1).join(":") || "");
//   const [showSidebar, setShowSidebar] = useState<boolean>(false);
//   const [isMenuSelected, setIsMenuSelected] = useState<boolean>(false);
//   const [viewInfo, setViewInfo] = useState<{ title: string; icon: string }>({
//     title: "Settings",
//     icon: "settings"
//   });

//   const isSmallScreen = useBreakpoint("sm", "down");

//   const menuItems = [
//     { id: "account", label: "Account", icon: "user" },
//     { id: "notifications", label: "Notifications", icon: "bell" },
//     { id: "display", label: "Display", icon: "monitor" },
//     { id: "sound", label: "Sound", icon: "soundwave" },
//     { id: "storage", label: "Storage", icon: "folder" },
//     { id: "privacy", label: "Privacy", icon: "lock" }
//   ];

//   const viewInfoMap: Record<string, { title: string; icon: string }> = {
//     "": { title: "Settings", icon: "settings" },
//     account: { title: "Account", icon: "user" },
//     notifications: { title: "Notifications", icon: "bell" },
//     display: { title: "Display", icon: "monitor" },
//     sound: { title: "Sound", icon: "soundwave" },
//     storage: { title: "Storage", icon: "folder" },
//     privacy: { title: "Privacy", icon: "lock" }
//   };

//   useEffect(() => {
//     const mainViewId = currentView.split(":")[0] || "";
//     const info = viewInfoMap[mainViewId] || {
//       title: "Settings",
//       icon: "settings"
//     };
//     setViewInfo(info);
//   }, [currentView]);

//   const navigateTo = (view: string) => {
//     setCurrentView(view);
//     setIsMenuSelected(true);
//     if (isSmallScreen) {
//       setShowSidebar(false);
//     }

//     setHash(`settings:${view}`);
//   };

//   const backToMenu = () => {
//     setIsMenuSelected(false);
//     setShowSidebar(true);
//     setCurrentView("");
//   };

//   const backToParent = () => {
//     const parentView = currentView.split(":").slice(0, -1).join(":");
//     navigateTo(parentView || "");
//   };

//   useEffect(() => {
//     // Manage sidebar visibility
//     setShowSidebar(isSmallScreen ? !isMenuSelected : true);

//     // Set default menu to "account" when switching from small to large screen and no menu is selected
//     if (!isSmallScreen && !isMenuSelected && !currentView) {
//       setCurrentView("account");
//       setIsMenuSelected(true);
//     }
//   }, [isSmallScreen, isMenuSelected, currentView]);

//   return (
//     <ViewContext.Provider value={viewInfo}>
//       <Modal
//         isOpen={isOpen}
//         isDismissable={false}
//         onClose={onClose}
//         size={isSmallScreen ? "full" : "3xl"}
//         scrollBehavior={"inside"}
//         closeButton={
//           <Button
//             isIconOnly
//             variant="light"
//             onPress={onClose}
//             className="rounded-full text-foreground-500"
//           >
//             <X size={20} />
//           </Button>
//         }
//         classNames={{
//           wrapper: cn(isSmallScreen && "h-full")
//         }}
//       >
//         <ModalContent className={cn(!isSmallScreen && "min-h-[600px]")}>
//           <ModalHeader className="pb-1">
//             <div className="flex min-h-10 items-center gap-2">
//               {isSmallScreen && isMenuSelected && currentView.split(":").length === 1 ? (
//                 <Button isIconOnly variant="light" onPress={backToMenu}>
//                   <ArrowLeft size={20} />
//                 </Button>
//               ) : currentView.includes(":") ? (
//                 <Button isIconOnly variant="light" onPress={backToParent}>
//                   <ArrowLeft size={20} />
//                 </Button>
//               ) : isSmallScreen && !showSidebar ? (
//                 <Button isIconOnly variant="light" onPress={() => setShowSidebar(true)}>
//                   <Menu size={20} />
//                 </Button>
//               ) : (
//                 <Button isIconOnly variant="light">
//                   {viewInfo.icon === "settings" && <Settings size={20} />}
//                   {viewInfo.icon === "user" && <User size={20} />}
//                   {viewInfo.icon === "bell" && <Bell size={20} />}
//                   {viewInfo.icon === "monitor" && <Monitor size={20} />}
//                   {viewInfo.icon === "soundwave" && <AudioLines size={20} />}
//                   {viewInfo.icon === "folder" && <Folder size={20} />}
//                   {viewInfo.icon === "lock" && <Lock size={20} />}
//                 </Button>
//               )}
//               <h2 className="text-xl font-bold">{viewInfo.title}</h2>
//             </div>
//           </ModalHeader>
//           <ModalBody className="flex flex-col overflow-x-hidden px-0 pt-0 md:flex-row">
//             {showSidebar && (
//               <motion.div
//                 className="w-full p-4 md:w-64"
//                 initial={{ x: -300, opacity: 0 }}
//                 animate={{ x: 0, opacity: 1 }}
//                 exit={{ x: -300, opacity: 0 }}
//                 transition={{ type: "spring", stiffness: 300, damping: 30 }}
//               >
//                 <div className="space-y-1">
//                   {menuItems.map((item) => (
//                     <Button
//                       radius="full"
//                       key={item.id}
//                       variant={
//                         currentView === item.id || currentView.startsWith(`${item.id}:`)
//                           ? "solid"
//                           : "light"
//                       }
//                       color={
//                         currentView === item.id || currentView.startsWith(`${item.id}:`)
//                           ? "primary"
//                           : "default"
//                       }
//                       size={isSmallScreen ? "lg" : "md"}
//                       fullWidth
//                       className="justify-start"
//                       startContent={
//                         item.icon === "user" ? (
//                           <User size={20} />
//                         ) : item.icon === "bell" ? (
//                           <Bell size={20} />
//                         ) : item.icon === "monitor" ? (
//                           <Monitor size={20} />
//                         ) : item.icon === "soundwave" ? (
//                           <AudioLines size={20} />
//                         ) : item.icon === "folder" ? (
//                           <Folder size={20} />
//                         ) : item.icon === "lock" ? (
//                           <Lock size={20} />
//                         ) : null
//                       }
//                       onPress={() => navigateTo(item.id)}
//                     >
//                       {item.label}
//                     </Button>
//                   ))}
//                 </div>
//               </motion.div>
//             )}
//             {(!showSidebar || !isSmallScreen) && currentView && (
//               <div
//                 className={`flex-1 overflow-y-auto p-6 md:p-4 ${showSidebar ? "md:block" : "w-full"} overflow-x-hidden`}
//               >
//                 <AnimatePresence mode="wait" initial={false}>
//                   <motion.div
//                     key={currentView}
//                     variants={{
//                       enter: (direction: number) => ({
//                         x: direction > 0 ? "20%" : "-20%",
//                         opacity: 0
//                       }),
//                       center: {
//                         x: 0,
//                         opacity: 1,
//                         transition: { duration: 0.15, ease: "easeOut" }
//                       },
//                       exit: (direction: number) => ({
//                         x: direction > 0 ? "-20%" : "20%",
//                         opacity: 0,
//                         transition: { duration: 0.15, ease: "easeIn" }
//                       })
//                     }}
//                     initial="enter"
//                     animate="center"
//                     exit="exit"
//                     className="h-full"
//                   >
//                     <div className="flex flex-col space-y-6">
//                       <AccountView navigateTo={navigateTo} currentView={currentView} />
//                       <AccountChangeEmailView navigateTo={navigateTo} currentView={currentView} />
//                       <AccountChangePhoneNumberView
//                         navigateTo={navigateTo}
//                         currentView={currentView}
//                       />
//                       <AccountVerifyEmailView navigateTo={navigateTo} currentView={currentView} />
//                       <AccountVerifyPhoneNumberView
//                         navigateTo={navigateTo}
//                         currentView={currentView}
//                       />
//                       <AccountPasswordView navigateTo={navigateTo} currentView={currentView} />
//                       <AccountDeleteView
//                         onClose={onClose}
//                         navigateTo={navigateTo}
//                         currentView={currentView}
//                       />
//                       <NotificationsView navigateTo={navigateTo} currentView={currentView} />
//                       <DisplayView navigateTo={navigateTo} currentView={currentView} />
//                       <SoundView navigateTo={navigateTo} currentView={currentView} />
//                       <StorageView navigateTo={navigateTo} currentView={currentView} />
//                       <PrivacyView navigateTo={navigateTo} currentView={currentView} />
//                     </div>
//                   </motion.div>
//                 </AnimatePresence>
//               </div>
//             )}
//           </ModalBody>
//         </ModalContent>
//       </Modal>
//     </ViewContext.Provider>
//   );
// }

// export function SettingsModalRouter() {
//   const { closeModal, currentModal, mountedModal } = useModalRouter();
//   return (
//     <>
//       {mountedModal?.split(":")[0] === "settings" ? (
//         <SettingsModal isOpen={currentModal?.split(":")[0] === "settings"} onClose={closeModal} />
//       ) : null}
//     </>
//   );
// }
