import React, { forwardRef, useEffect, useState } from "react";
import { Autocomplete, AutocompleteItem, AutocompleteProps } from "@heroui/autocomplete";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import { Key } from "@react-types/shared";
import { MapPin } from "lucide-react";
import { useLocationIQAutocomplete } from "@/hooks";
import type { Location as LocationIQLocation } from "@/hooks/use-locationIq-autocomplete";

interface InputLocationProps extends Omit<AutocompleteProps, "children"> {
  onLocationChange?: (location: LocationIQLocation | null) => void;
  value?: string;
}

const InputLocation = forwardRef<HTMLInputElement, InputLocationProps>(
  ({ onLocationChange, value: inputValue, onChange: onInputChange, ...props }, ref) => {
    const [selectedKey, setSelectedKey] = useState<Key | null>(null);
    const [hasSelection, setHasSelection] = useState(false);
    const { locations, isLoading, errorMessage, setQuery, getCurrentLocation } =
      useLocationIQAutocomplete(process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY!, {
        debounceTime: 500,
        minQueryLength: 3,
        limit: 10
      });

    // Handle input changes
    const handleInputChange = (value: string) => {
      setQuery(value);
      setSelectedKey(null);
      setHasSelection(false);
      if (onInputChange) {
        const syntheticEvent = {
          target: { value }
        } as React.ChangeEvent<HTMLInputElement>;
        onInputChange(syntheticEvent);
      }
      if (onLocationChange && !value) {
        onLocationChange(null);
      }
    };

    // Handle selection changes
    const handleSelectionChange = (key: Key | null) => {
      setSelectedKey(key);
      setHasSelection(true);
      const chosenLocation = locations.find((loc, index) => `${loc.place_id}-${index}` === key);
      if (onLocationChange) {
        onLocationChange(chosenLocation || null);
      }
      if (onInputChange && chosenLocation) {
        const syntheticEvent = {
          target: { value: chosenLocation.friendly_name }
        } as React.ChangeEvent<HTMLInputElement>;
        onInputChange(syntheticEvent);
      }
    };

    // Sync controlled value with query
    useEffect(() => {
      if (inputValue !== undefined && !hasSelection) {
        setQuery(inputValue);
      }
    }, [inputValue, setQuery, hasSelection]);

    return (
      <Autocomplete
        ref={ref}
        inputValue={inputValue ?? ""}
        onInputChange={handleInputChange}
        selectedKey={selectedKey}
        onSelectionChange={handleSelectionChange}
        isLoading={isLoading}
        isInvalid={!!errorMessage}
        errorMessage={errorMessage || undefined}
        listboxProps={{
          emptyContent: isLoading ? "Loading..." : "No locations found"
        }}
        endContent={
          <Tooltip content="Use current location">
            <Button
              radius="full"
              size="sm"
              variant="light"
              color="primary"
              onPress={async () => {
                const currentLocation = await getCurrentLocation();
                if (currentLocation) {
                  setSelectedKey(`${currentLocation.place_id}-0`);
                  setHasSelection(true);
                  if (onLocationChange) {
                    onLocationChange(currentLocation);
                  }
                  if (onInputChange) {
                    const syntheticEvent = {
                      target: { value: currentLocation.friendly_name }
                    } as React.ChangeEvent<HTMLInputElement>;
                    onInputChange(syntheticEvent);
                  }
                }
              }}
              isLoading={isLoading}
              isDisabled={isLoading}
              isIconOnly
            >
              <MapPin size={20} />
            </Button>
          </Tooltip>
        }
        {...props}
      >
        {locations.map((location, index) => {
          const key = `${location.place_id}-${index}`;
          return (
            <AutocompleteItem key={key} textValue={location.friendly_name}>
              <div className="flex flex-col">
                <span className="font-medium">{location.friendly_name}</span>
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
