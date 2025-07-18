"use client";

import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { addToast } from "@heroui/toast";
import { ContactUsFields, ContactUsForm as ContactUsFormType } from "./ContactUsFields";
import { ContactUsFooter } from "./ContactUsFooter";

export function ContactUsForm({
  onSuccess,
  onClose
}: {
  onSuccess?: () => void;
  onClose?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<ContactUsFormType>({
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      message: ""
    }
  });

  const handleSubmitContact = useCallback(
    form.handleSubmit(async (formData) => {
      setIsLoading(true);
      try {
        // TODO: Replace with real API call
        const problem = {
          message: "An error occurred while sending the message.",
          errors: {
            name: "Name is required",
            email: "Email is required",
            message: "Message is required"
          }
        };

        if (problem) {
          const errors = Object.entries(problem.errors || {});

          if (errors.length > 0) {
            errors.forEach(([name, message]) => {
              form.setError(name as keyof ContactUsFormType, {
                type: "manual",
                message
              });
            });
          } else {
            addToast({
              title: problem.message,
              color: "danger"
            });
          }
        } else {
          addToast({
            title: "Message sent successfully.",
            color: "success"
          });
          form.reset();
          onSuccess?.();
          onClose?.();
        }
      } finally {
        setIsLoading(false);
      }
    }),
    [form, onSuccess, onClose]
  );

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        handleSubmitContact();
      }}
      className="h-full"
    >
      <ContactUsFields form={form} />
      <ContactUsFooter isLoading={isLoading} onSubmit={handleSubmitContact} />
    </form>
  );
}
