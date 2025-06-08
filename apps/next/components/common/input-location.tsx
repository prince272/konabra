import React, { forwardRef, useEffect, useState, useMemo } from "react";
import { Autocomplete, AutocompleteItem, AutocompleteProps } from "@heroui/autocomplete";
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
    const { results, loading, error, setQuery } = useLocationIQAutocomplete({
      apiKey,
      debounceTime
    });

    // Generate keys and map to locations for current results
    const keyToLocationMap = useMemo(() => {
      const map = new Map<Key, LocationIQLocation>();
      results.forEach((location, index) => {
        const key = `loc-${index}`; // Unique key per result, no place_id used
        map.set(key, location);
      });
      return map;
    }, [results]);

    useEffect(() => {
      if (controlledValue !== undefined) {
        setQuery(controlledValue.toString());
      }
    }, [controlledValue, setQuery]);

    const handleInputChange = (value: string) => {
      const syntheticEvent = {
        target: {
          value: value
        }
      } as React.ChangeEvent<HTMLInputElement>;
      parentOnChange?.(syntheticEvent);
      setQuery(value);

      if (
        selectedKey &&
        value !== keyToLocationMap.get(selectedKey)?.display_place
      ) {
        setSelectedKey(null);
        onLocationChange?.(null);
      }
    };

    const handleSelectionChange = (key: Key | null) => {
      setSelectedKey(key);
      const location = key ? keyToLocationMap.get(key) ?? null : null;
      onLocationChange?.(location);

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
        {...props}
      >
        {results.map((location, index) => {
          const key = `loc-${index}`;
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
