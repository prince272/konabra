import React from "react";
import { Bell, Moon } from "lucide-react";
import { Switch } from "@heroui/switch";

interface BaseViewProps {
  navigateTo: (view: string) => void;
  currentView: string;
  onClose?: () => void;
}

function View({ id, children, currentView }: { id: string; children: React.ReactNode; currentView: string }) {
  return currentView === id ? <>{children}</> : null;
}

const NotificationsView = ({ currentView }: BaseViewProps) => {
  return (
    <View id="notifications" currentView={currentView}>
      <div className="space-y-6">
        <div className="rounded-xl bg-default-100 p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Bell size={20} />
            <h4 className="font-medium">General Notifications</h4>
          </div>
          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between">
              <span>System notifications</span>
              <Switch defaultSelected />
            </div>
            <div className="flex items-center justify-between">
              <span>App notifications</span>
              <Switch defaultSelected />
            </div>
            <div className="flex items-center justify-between">
              <span>Email notifications</span>
              <Switch />
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-default-100 p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Moon size={20} />
            <h4 className="font-medium">Do Not Disturb</h4>
          </div>
          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between">
              <span>Enable Do Not Disturb</span>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <span>Schedule</span>
              <Switch />
            </div>
          </div>
        </div>
      </div>
    </View>
  );
};

export default NotificationsView; 