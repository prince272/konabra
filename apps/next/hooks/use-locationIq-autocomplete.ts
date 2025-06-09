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
  };
}

export interface AutocompleteOptions {
  countrycodes?: string;
  limit?: number;
  tag?: string;
  normalizecity?: number;
  acceptLanguage?: string;
  viewbox?: string;
  bounded?: number;
  dedupe?: number;
  importancesort?: number;
}

interface UseLocationIQAutocompleteProps {
  apiKey: string;
  query: string;
  debounceTime?: number;
  options?: AutocompleteOptions;
}

interface AutocompleteState {
  results: Location[];
  loading: boolean;
  error: string | null;
}

const BASE_URL = "https://api.locationiq.com/v1/autocomplete";
const REVERSE_GEOCODE_URL = "https://api.locationiq.com/v1/reverse";
const MIN_QUERY_LENGTH = 3;

/**
 * Hook to get location autocomplete suggestions and current location using LocationIQ API.
 * Query state is managed externally and passed as a prop.
 */
export const useLocationIQAutocomplete = ({
  apiKey,
  query,
  debounceTime = 500,
  options = {}
}: UseLocationIQAutocompleteProps): AutocompleteState & {
  getCurrentLocation: () => Promise<Location | null>;
} => {
  const [state, setState] = useState<AutocompleteState>({
    results: [],
    loading: false,
    error: null
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const cachedResultsRef = useRef<Location[]>([]);
  const requestIdRef = useRef(0);

  const buildQueryParams = useCallback(
    (query: string): string => {
      const params = new URLSearchParams({ key: apiKey, q: query });
      Object.entries(options).forEach(([key, value]) => {
        if (value != null) params.set(key, String(value));
      });
      return params.toString();
    },
    [apiKey, options]
  );

  const buildReverseGeocodeParams = useCallback(
    (lat: number, lon: number): string => {
      const params = new URLSearchParams({
        key: apiKey,
        lat: lat.toString(),
        lon: lon.toString(),
        format: "json"
      });
      return params.toString();
    },
    [apiKey]
  );

  const fetchSuggestions = useCallback(
    async (trimmedQuery: string) => {
      // Cancel any in-flight requests
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const currentRequestId = ++requestIdRef.current;
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(`${BASE_URL}?${buildQueryParams(trimmedQuery)}`, {
          signal: controller.signal
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch autocomplete results");
        }

        const data: Location[] = await response.json();

        // Only update state if this is the latest request
        if (currentRequestId === requestIdRef.current) {
          setState((prev) => ({ ...prev, results: data, loading: false }));
          cachedResultsRef.current = data;
        }
      } catch (err) {
        // Only handle non-abort errors for the latest request
        if (
          currentRequestId === requestIdRef.current &&
          err instanceof Error &&
          err.name !== "AbortError"
        ) {
          setState((prev) => ({
            ...prev,
            error: err.message,
            results: [],
            loading: false
          }));
        }
      }
    },
    [buildQueryParams]
  );

  const getCurrentLocation = useCallback(async (): Promise<Location | null> => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by this browser"
      }));
      return null;
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;

      // Cancel any in-flight requests
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await fetch(
        `${REVERSE_GEOCODE_URL}?${buildReverseGeocodeParams(latitude, longitude)}`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch current location");
      }

      const data: Location = await response.json();
      setState((prev) => ({
        ...prev,
        results: [data],
        loading: false
      }));
      cachedResultsRef.current = [data];
      return data;
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to get current location",
        loading: false
      }));
      return null;
    }
  }, [buildReverseGeocodeParams]);

  const debouncedFetch = useDebouncedCallback(fetchSuggestions, [], debounceTime);

  // Effect to handle query changes
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length >= MIN_QUERY_LENGTH) {
      debouncedFetch(trimmed);
    } else {
      setState((prev) => ({
        ...prev,
        results: trimmed.length > 0 ? cachedResultsRef.current : []
      }));
    }
  }, [query, debouncedFetch]);

  // Cleanup effect for aborting requests
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return useMemo(() => ({ ...state, getCurrentLocation }), [state, getCurrentLocation]);
};
