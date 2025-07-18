import React from "react";
import { Button } from "@heroui/button";

export function ContactUsFooter({
  isLoading,
  onSubmit
}: {
  isLoading: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="flex-col gap-3 px-6 pb-6 pt-2">
      <Button
        radius="full"
        color="primary"
        isDisabled={isLoading}
        isLoading={isLoading}
        onPress={onSubmit}
        className="w-full"
      >
        Send Message
      </Button>
    </div>
  );
}
