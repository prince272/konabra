import React from "react";
import { Switch } from "@heroui/switch";

interface BaseViewProps {
  navigateTo: (view: string) => void;
  currentView: string;
  onClose?: () => void;
}

function View({ id, children, currentView }: { id: string; children: React.ReactNode; currentView: string }) {
  return currentView === id ? <>{children}</> : null;
}

const PrivacyView = ({ currentView }: BaseViewProps) => {
  return (
    <View id="privacy" currentView={currentView}>
      <div className="space-y-6">
        <div className="rounded-xl bg-default-100 p-4 shadow-sm">
          <h4 className="font-medium">Privacy Settings</h4>
          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between">
              <span>Analytics Tracking</span>
              <Switch />
            </div>
          </div>
        </div>
      </div>
    </View>
  );
};

export default PrivacyView;
