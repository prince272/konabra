"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Listbox, ListboxItem } from "@heroui/listbox";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { cn } from "@heroui/theme";
import { Icon } from "@iconify-icon/react";
import countries from "i18n-iso-countries";
import { CountryCode, getCountries, getCountryCallingCode, parsePhoneNumberFromString } from "libphonenumber-js";
import { maybePhoneNumber } from "@/utils";
import { useBreakpoint, useMeasure } from "@/hooks";

// Register English locale
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

type Country = {
  code: CountryCode;
  name: string;
  callingCode: string;
};

type InputPhoneProps = React.ComponentPropsWithoutRef<typeof Input> & {
  defaultCountryCode?: string;
  onCountryChange?: (country: Country) => void;
  value?: string; // controlled international format value (e.g. +233550362337)
  onChange?: (value: string) => void; // emits clean international format without spaces
};

const InputPhone = React.forwardRef<HTMLInputElement, InputPhoneProps>(
  ({ isDisabled, value, defaultCountryCode = "GH", onCountryChange, onChange, ...props }, ref) => {
    // Memoize country list
    const allCountries: Country[] = useMemo(() => {
      return getCountries()
        .map((code) => {
          const name = countries.getName(code, "en") || code;
          let callingCode = "";
          try {
            callingCode = `+${getCountryCallingCode(code)}`;
          } catch {
            return null; // Skip invalid
          }

          return { code, name, callingCode };
        })
        .filter(Boolean) as Country[];
    }, []);

    // Initialize selected country
    const [selectedCountry, setSelectedCountry] = useState<Country>(
      allCountries.find((c) => c.code === defaultCountryCode) || allCountries[0]
    );

    // Internal input value shown to user (may be national format)
    const [rawInput, setRawInput] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const isSmallScreen = useBreakpoint("sm", "down");
    const [listboxRef, bounds] = useMeasure({ debounce: 100 });
    const maxListHeight = Math.ceil(bounds.height || 400);

    const filteredCountries = useMemo(() => {
      return allCountries.filter(
        (country) =>
          country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          country.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [allCountries, searchQuery]);

    // When selectedCountry changes, call callback and try to reformat rawInput accordingly
    useEffect(() => {
      if (onCountryChange) {
        onCountryChange(selectedCountry);
      }

      // Re-parse and format existing value when country changes
      if (value) {
        const phoneNumber = parsePhoneNumberFromString(value, selectedCountry.code);
        if (phoneNumber && phoneNumber.isValid()) {
          setRawInput(phoneNumber.formatNational());
        } else {
          setRawInput(value);
        }
      }
    }, [selectedCountry, onCountryChange, value]);

    // Sync internal rawInput if controlled `value` changes externally
    useEffect(() => {
      if (!value) {
        setRawInput("");
        return;
      }

      const phoneNumber = parsePhoneNumberFromString(value, selectedCountry.code);
      if (phoneNumber && phoneNumber.isValid()) {
        setRawInput(phoneNumber.formatNational());
      } else {
        setRawInput(value);
      }
    }, [value, selectedCountry]);

    // Emit clean international format (no spaces)
    const emitValue = (input: string) => {
      const phoneNumber = parsePhoneNumberFromString(input, selectedCountry.code);

      if (phoneNumber && phoneNumber.isValid()) {
        // formatInternational includes '+' and country code, removes local leading zero
        const formatted = phoneNumber.formatInternational().replace(/\s+/g, "");
        onChange?.(formatted);
      } else {
        // fallback to raw input
        onChange?.(input);
      }
    };

    const endContent = maybePhoneNumber(value) ? (
      <Button
        type="button"
        className="h-5 px-0 py-1 text-small"
        size="sm"
        variant="light"
        radius="full"
        onPress={() => !isDisabled && setIsModalOpen(true)}
        disabled={isDisabled}
        startContent={
          <Icon
            icon={`circle-flags:${selectedCountry.code.toLowerCase()}`}
            width="20"
            height="20"
          />
        }
      >
        {selectedCountry.callingCode}
      </Button>
    ) : undefined;

    useEffect(() => {
      if (isModalOpen) {
        setIsModalVisible(true);
      } else {
        setSearchQuery("");
        const timeout = setTimeout(() => setIsModalVisible(false), 100);
        return () => clearTimeout(timeout);
      }
    }, [isModalOpen]);

    return (
      <>
        <Input
          ref={ref}
          value={rawInput}
          onChange={(e) => {
            const val = e.target.value;
            setRawInput(val);

            // Emit normalized international phone number if valid, else raw input
            const phoneNumber = parsePhoneNumberFromString(val, selectedCountry.code);
            if (phoneNumber && phoneNumber.isValid()) {
              emitValue(phoneNumber.formatInternational());
            } else {
              emitValue(val);
            }
          }}
          startContent={endContent}
          {...props}
          isDisabled={isDisabled}
        />
        {isModalVisible && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            size={isSmallScreen ? "full" : "md"}
            scrollBehavior="inside"
            closeButton={
              <Button
                isIconOnly
                variant="light"
                onPress={() => setIsModalOpen(false)}
                className="rounded-full text-foreground-500"
                isDisabled={isDisabled}
              >
                <Icon icon="material-symbols:close-rounded" width="20" height="20" />
              </Button>
            }
            classNames={{ wrapper: cn(isSmallScreen && "h-full") }}
          >
            <ModalContent>
              <ModalHeader className="flex flex-col gap-2">
                <div>Select Country</div>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search countries"
                  isDisabled={isDisabled}
                />
              </ModalHeader>
              <ModalBody className="px-0">
                <div className="flex-1 overflow-hidden" ref={listboxRef}>
                  <Listbox
                    isVirtualized
                    virtualization={{
                      maxListboxHeight: maxListHeight,
                      itemHeight: 40
                    }}
                    className="p-0"
                    itemClasses={{ base: "px-6 rounded-none" }}
                    variant="flat"
                    selectionMode="single"
                    selectedKeys={new Set([selectedCountry.code])}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0] as string;
                      const country = allCountries.find((c) => c.code === selectedKey);
                      if (country) {
                        setSelectedCountry(country);
                        setIsModalOpen(false);
                      }
                    }}
                  >
                    {filteredCountries.map((country) => (
                      <ListboxItem
                        key={country.code}
                        startContent={
                          <Icon
                            icon={`flag:${country.code.toLowerCase()}-4x3`}
                            width={26}
                            height={20}
                          />
                        }
                        endContent={<span>{country.callingCode}</span>}
                      >
                        {country.name}
                      </ListboxItem>
                    ))}
                  </Listbox>
                </div>
              </ModalBody>
            </ModalContent>
          </Modal>
        )}
      </>
    );
  }
);

InputPhone.displayName = "InputPhone";

export { InputPhone };
