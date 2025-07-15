import React from "react";

interface BaseViewProps {
  navigateTo: (view: string) => void;
  currentView: string;
  onClose?: () => void;
}

function View({ id, children, currentView }: { id: string; children: React.ReactNode; currentView: string }) {
  return currentView === id ? <>{children}</> : null;
}

const StorageView = ({ currentView }: BaseViewProps) => {
  return (
    <View id="storage" currentView={currentView}>
      <div className="space-y-6">
        <div className="rounded-xl bg-default-100 p-4 shadow-sm">
          <h4 className="font-medium">Storage Usage</h4>
          <div className="mt-3">
            <p className="text-sm">Total used: 1.2 GB of 5 GB</p>
          </div>
        </div>
      </div>
    </View>
  );
};

export default StorageView;
