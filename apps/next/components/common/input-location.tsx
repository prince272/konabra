import React, { forwardRef, useEffect, useState } from "react";
import { Autocomplete, AutocompleteItem, AutocompleteProps } from "@heroui/autocomplete";
import { Button } from "@heroui/button";
import { Icon } from "@iconify-icon/react";
import { Key } from "@react-types/shared";
import { useLocationIQAutocomplete } from "@/hooks";
import type { Location as LocationIQLocation } from "@/hooks/use-locationIq-autocomplete";

interface InputLocationProps extends Omit<AutocompleteProps, "children"> {
  apiKey: string;
  debounceTime?: number;
  onLocationChange?: (location: LocationIQLocation | null) => void;
}

const InputLocation = forwardRef<HTMLInputElement, InputLocationProps>(
  (
    {
      apiKey,
      debounceTime = 500,
      onLocationChange,
      value: controlledValue,
      onChange: parentOnChange,
      ...props
    },
    ref
  ) => {
    const [selectedKey, setSelectedKey] = useState<Key | null>(null);
    const { results, loading, error, getCurrentLocation } = useLocationIQAutocomplete({
      apiKey,
      query: controlledValue?.toString() || "",
      debounceTime
    });

    const handleInputChange = (value: string) => {
      const syntheticEvent = {
        target: {
          value: value
        }
      } as React.ChangeEvent<HTMLInputElement>;
      parentOnChange?.(syntheticEvent);
      if (
        selectedKey &&
        value !== results[parseInt((selectedKey as string).split("-").pop() || "0")]?.display_place
      ) {
        setSelectedKey(null);
        onLocationChange?.(null);
      }
    };

    const handleSelectionChange = (key: Key | null) => {
      setSelectedKey(key);
      const index = key ? parseInt((key as string).split("-").pop() || "0") : -1;
      const location = index >= 0 ? results[index] : null;
      onLocationChange?.(location || null);
      if (location) {
        const syntheticEvent = {
          target: {
            value: location.display_place
          }
        } as React.ChangeEvent<HTMLInputElement>;
        parentOnChange?.(syntheticEvent);
      }
    };

    return (
      <Autocomplete
        ref={ref}
        inputValue={controlledValue?.toString() || ""}
        onInputChange={handleInputChange}
        selectedKey={selectedKey}
        onSelectionChange={handleSelectionChange}
        isLoading={loading}
        isInvalid={!!error}
        errorMessage={error || undefined}
        listboxProps={{
          emptyContent: loading ? "Loading..." : "No locations found"
        }}
        startContent={
          <Button
            radius="full"
            size="sm"
            variant="flat"
            color="primary"
            onPress={async () => {
              const currentLocation = await getCurrentLocation();
              if (currentLocation) {
                handleInputChange(currentLocation.display_name);
              }
            }}
            isLoading={loading}
            isDisabled={loading}
            isIconOnly
          >
            <Icon icon="solar:map-point-add-broken" width="20" height="20" />
          </Button>
        }
        {...props}
      >
        {results.map((location, index) => {
          const key = `${location.place_id}-${index}`;
          return (
            <AutocompleteItem key={key} textValue={location.display_place}>
              <div className="flex flex-col">
                <span className="font-medium">{location.display_place}</span>
                {location.address && (
                  <span className="text-xs text-default-500">
                    {[
                      location.address.road,
                      location.address.city,
                      location.address.state,
                      location.address.country
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                )}
              </div>
            </AutocompleteItem>
          );
        })}
      </Autocomplete>
    );
  }
);

InputLocation.displayName = "InputLocation";
export { InputLocation };
