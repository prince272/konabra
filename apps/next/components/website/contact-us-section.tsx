"use client";

import React from "react";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { motion } from "framer-motion";
import { Controller, useForm } from "react-hook-form";

interface ContactForm {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
}

export const ContactUsSection = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid }
  } = useForm<ContactForm>({
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: ""
    }
  });

  const onSubmit = async (data: ContactForm) => {
    console.log("Form submitted:", data);
    reset();
  };

  const container = {
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="contact" className="relative overflow-hidden py-24">
      {/* Background gradients added back */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-default-50/30 to-background dark:from-background dark:via-default-900/20 dark:to-background"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,184,0,0.15),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgba(255,184,0,0.1),transparent_90%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(23,201,100,0.15),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_bottom_left,rgba(23,201,100,0.1),transparent_90%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,184,255,0.15),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(0,184,255,0.1),transparent_90%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,0,0,0.15),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,0,0,0.1),transparent_90%)]"></div>

      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <motion.div
          className="mx-auto max-w-6xl"
          variants={container}
        >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left side - Contact Info */}
            <motion.div variants={item} className="order-1 lg:order-none">
              <div className="h-full p-8">
                <h2 className="mb-4 text-3xl font-bold">Contact Us</h2>
                <p className="mb-6">
                  Feel free to use the form or drop us an email. Old-fashioned phone calls work too.
                </p>
                <div className="space-y-4">
                  <p className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    484.324.2400
                  </p>
                  <p className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    info@mediaproper.com
                  </p>
                  <p className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    15 West 3rd St., Media, PA, 19063
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right side - Form */}
            <motion.div variants={item}>
              <div className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Controller
                      name="firstName"
                      control={control}
                      rules={{
                        required: "First name is required",
                        minLength: {
                          value: 2,
                          message: "First name must be at least 2 characters"
                        }
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="First Name"
                          placeholder="First"
                          isInvalid={!!errors.firstName}
                          errorMessage={errors.firstName?.message}
                          autoFocus
                        />
                      )}
                    />
                    <Controller
                      name="lastName"
                      control={control}
                      rules={{
                        required: "Last name is required",
                        minLength: {
                          value: 2,
                          message: "Last name must be at least 2 characters"
                        }
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Last Name"
                          placeholder="Last"
                          isInvalid={!!errors.lastName}
                          errorMessage={errors.lastName?.message}
                        />
                      )}
                    />
                  </div>
                  <Controller
                    name="email"
                    control={control}
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
                        type="email"
                        placeholder="example@email.com"
                        isInvalid={!!errors.email}
                        errorMessage={errors.email?.message}
                      />
                    )}
                  />
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Phone (optional)"
                        type="tel"
                        placeholder="xxx-xxx-xxxx"
                        isInvalid={!!errors.phone}
                        errorMessage={errors.phone?.message}
                      />
                    )}
                  />
                  <Controller
                    name="message"
                    control={control}
                    rules={{
                      required: "Message is required",
                      minLength: {
                        value: 10,
                        message: "Message must be at least 10 characters"
                      }
                    }}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        label="Message"
                        placeholder="Type your message ..."
                        minRows={6}
                        isInvalid={!!errors.message}
                        errorMessage={errors.message?.message}
                      />
                    )}
                  />
                  <div className="pt-2">
                    <Button
                      type="submit"
                      fullWidth
                      size="lg"
                      isLoading={isSubmitting}
                      isDisabled={isSubmitting || !isValid}
                    >
                      {isSubmitting ? "Sending..." : "Submit"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
