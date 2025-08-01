import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedCallback } from "./use-debounced-callback";

// LocationIQ API Types
export interface Location {
  place_id: string;
  osm_id: string;
  osm_type: string;
  licence: string;
  lat: string;
  lon: string;
  boundingbox: [string, string, string, string];
  class: string;
  type: string;
  display_name: string;
  display_place: string;
  display_address: string;
  address: {
    name?: string;
    house_number?: string;
    road?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
    suburb?: string;
  };
  friendly_name: string; // Added friendly_name field
}

export interface AutocompleteOptions {
  debounceTime?: number;
  countrycodes?: string;
  limit?: number;
  tag?: string;
  acceptLanguage?: string;
  viewbox?: string;
  bounded?: number;
  dedupe?: number;
  importancesort?: number;
  normalizecity?: number;
  json_callback?: string;
  region?: string;
  minQueryLength?: number;
}

interface AutocompleteState {
  locations: Location[];
  isLoading: boolean;
  errorMessage: string | null;
}

export const useLocationIQAutocomplete = (
  apiKey: string,
  options: AutocompleteOptions = {}
): AutocompleteState & {
  setQuery: (query: string) => void;
  getCurrentLocation: () => Promise<Location | null>;
} => {
  const [query, setQuery] = useState<string>("");
  const [state, setState] = useState<AutocompleteState>({
    locations: [],
    isLoading: false,
    errorMessage: null
  });

  const defaultOptions: AutocompleteOptions = {
    debounceTime: 500,
    region: "us1",
    minQueryLength: 3,
    limit: 10,
    dedupe: 1
  };

  const mergedOptions = useMemo(
    () => ({
      ...defaultOptions,
      ...options
    }),
    [options]
  );

  const abortControllerRef = useRef<AbortController | null>(null);
  const cachedLocationsRef = useRef<Location[]>([]);
  const requestIdRef = useRef(0);

  const baseUrl = useMemo(
    () => `https://${mergedOptions.region}.locationiq.com/v1`,
    [mergedOptions.region]
  );

  const buildAutoCompleteParams = useCallback(
    (query: string): string => {
      const params = new URLSearchParams({ key: apiKey, q: query });
      const validateLimit = (limit: unknown): string => {
        const num = Number(limit);
        if (isNaN(num) || num < 1 || num > 20) {
          console.warn(
            `Invalid limit value (${limit}). Must be a number between 1 and 20. Using default 10.`
          );
          return "10";
        }
        return num.toString();
      };

      const excludeKeys = new Set(["debounceTime", "region", "minQueryLength"]);
      Object.entries(mergedOptions).forEach(([key, value]) => {
        if (value != null && !excludeKeys.has(key)) {
          const paramValue = key === "limit" ? validateLimit(value) : String(value);
          params.set(key, paramValue);
        }
      });

      return params.toString();
    },
    [apiKey, mergedOptions]
  );

  const buildReverseGeocodeParams = useCallback(
    (lat: number, lon: number): string => {
      const params = new URLSearchParams({
        key: apiKey,
        lat: lat.toString(),
        lon: lon.toString(),
        format: "json"
      });

      if (mergedOptions.acceptLanguage) {
        params.set("accept-language", mergedOptions.acceptLanguage);
      }
      if (mergedOptions.normalizecity !== undefined) {
        params.set("normalizecity", String(mergedOptions.normalizecity));
      }

      return params.toString();
    },
    [apiKey, mergedOptions.acceptLanguage, mergedOptions.normalizecity]
  );

  // Function to generate a friendly name from address components
  const generateFriendlyName = useCallback((address: Location["address"]): string => {
    const parts: string[] = [];

    // Priority 1: Use 'name' if available (e.g., business, landmark)
    if (address.name) {
      parts.push(address.name);
    }
    // Priority 2: Combine house_number and road for specific addresses
    else if (address.house_number && address.road) {
      parts.push(`${address.house_number} ${address.road}`);
    }
    // Priority 3: Fallback to road
    else if (address.road) {
      parts.push(address.road);
    }
    // Priority 4: Fallback to suburb
    else if (address.suburb) {
      parts.push(address.suburb);
    }

    // Add city or state for context, if available
    if (address.city) {
      parts.push(address.city);
    } else if (address.state) {
      parts.push(address.state);
    }

    // Fallback to country if no better components are available
    if (parts.length === 0 && address.country) {
      parts.push(address.country);
    }

    // If no components are available, use a default
    return parts.length > 0 ? parts.join(", ") : "Unnamed Location";
  }, []);

  const fetchSuggestions = useCallback(
    async (trimmedQuery: string) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const currentRequestId = ++requestIdRef.current;
      setState((prev) => ({ ...prev, isLoading: true, errorMessage: null }));

      try {
        const response = await fetch(
          `${baseUrl}/autocomplete?${buildAutoCompleteParams(trimmedQuery)}`,
          {
            signal: controller.signal
          }
        );

        if (!response.ok) {
          let errorMessage = "Failed to fetch autocomplete locations";
          switch (response.status) {
            case 400:
              errorMessage = "Invalid request parameters";
              break;
            case 401:
              errorMessage = "Invalid API key";
              break;
            case 403:
              errorMessage = "Access restricted";
              break;
            case 404:
              errorMessage = "No locations found";
              break;
            case 429:
              errorMessage = "Rate limit exceeded";
              break;
            case 500:
              errorMessage = "Internal server error";
              break;
          }

          try {
            const errorData = await response.json();
            throw new Error(errorData.error || errorMessage);
          } catch {
            throw new Error(errorMessage);
          }
        }

        const data: Location[] = await response.json();
        // Add friendly_name to each location
        const locationsWithFriendlyName = data.map((location) => ({
          ...location,
          friendly_name: generateFriendlyName(location.address)
        }));

        if (currentRequestId === requestIdRef.current) {
          setState((prev) => ({ ...prev, locations: locationsWithFriendlyName, isLoading: false }));
          cachedLocationsRef.current = locationsWithFriendlyName;
        }
      } catch (err) {
        if (
          currentRequestId === requestIdRef.current &&
          err instanceof Error &&
          err.name !== "AbortError"
        ) {
          setState((prev) => ({
            ...prev,
            errorMessage: err.message,
            locations: [],
            isLoading: false
          }));
        }
      }
    },
    [baseUrl, buildAutoCompleteParams, generateFriendlyName]
  );

  const getCurrentLocation = useCallback(async (): Promise<Location | null> => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        errorMessage: "Geolocation is not supported by this browser"
      }));
      return null;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, errorMessage: null }));

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          maximumAge: 60000,
          enableHighAccuracy: true
        });
      });

      const { latitude, longitude } = position.coords;

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await fetch(
        `${baseUrl}/reverse?${buildReverseGeocodeParams(latitude, longitude)}`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        let errorMessage = "Failed to fetch current location";
        switch (response.status) {
          case 400:
            errorMessage = "Invalid coordinates";
            break;
          case 401:
            errorMessage = "Invalid API key";
            break;
          case 403:
            errorMessage = "Access restricted";
            break;
          case 404:
            errorMessage = "No location found for these coordinates";
            break;
          case 429:
            errorMessage = "Rate limit exceeded";
            break;
          case 500:
            errorMessage = "Internal server error";
            break;
        }

        try {
          const errorData = await response.json();
          throw new Error(errorData.error || errorMessage);
        } catch {
          throw new Error(errorMessage);
        }
      }

      const data: Location = await response.json();
      // Add friendly_name to the location
      const locationWithFriendlyName = {
        ...data,
        friendly_name: generateFriendlyName(data.address)
      };

      setState((prev) => ({
        ...prev,
        isLoading: false,
        locations: [locationWithFriendlyName]
      }));
      cachedLocationsRef.current = [locationWithFriendlyName];
      return locationWithFriendlyName;
    } catch (err) {
      setState((prev) => ({
        ...prev,
        errorMessage: err instanceof Error ? err.message : "Failed to fetch current location",
        isLoading: false
      }));
      return null;
    }
  }, [baseUrl, buildReverseGeocodeParams, generateFriendlyName]);

  const debouncedFetch = useDebouncedCallback(
    fetchSuggestions,
    [],
    mergedOptions.debounceTime || 500
  );

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length >= (mergedOptions.minQueryLength || 3)) {
      debouncedFetch(trimmed);
    } else {
      setState((prev) => ({
        ...prev,
        locations: trimmed.length > 0 ? cachedLocationsRef.current : []
      }));
    }
  }, [query, debouncedFetch, mergedOptions.minQueryLength]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return useMemo(
    () => ({
      ...state,
      setQuery,
      getCurrentLocation
    }),
    [state, setQuery, getCurrentLocation]
  );
};
