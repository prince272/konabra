import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { Input, Textarea } from "@heroui/input";

export interface ContactUsForm {
  name: string;
  email: string;
  message: string;
}

export function ContactUsFields({
  form
}: {
  form: UseFormReturn<ContactUsForm>;
}) {
  return (
    <div className="space-y-6 py-4">
      <Controller
        name="name"
        control={form.control}
        rules={{ required: "Name is required" }}
        render={({ field }) => (
          <Input
            {...field}
            label="Name"
            isInvalid={!!form.formState.errors.name?.message}
            errorMessage={form.formState.errors.name?.message}
            type="text"
            autoFocus
          />
        )}
      />
      <Controller
        name="email"
        control={form.control}
        rules={{
          required: "Email is required",
          pattern: {
            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            message: "Invalid email address"
          }
        }}
        render={({ field }) => (
          <Input
            {...field}
            label="Email"
            isInvalid={!!form.formState.errors.email?.message}
            errorMessage={form.formState.errors.email?.message}
            type="email"
          />
        )}
      />
      <Controller
        name="message"
        control={form.control}
        rules={{ required: "Message is required" }}
        render={({ field }) => (
          <Textarea
            {...field}
            label="Message"
            isInvalid={!!form.formState.errors.message?.message}
            errorMessage={form.formState.errors.message?.message}
            minRows={4}
          />
        )}
      />
    </div>
  );
}
