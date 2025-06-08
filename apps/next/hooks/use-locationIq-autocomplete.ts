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
  debounceTime?: number;
  options?: AutocompleteOptions;
}

interface AutocompleteState {
  query: string;
  results: Location[];
  loading: boolean;
  error: string | null;
}

const BASE_URL = "https://api.locationiq.com/v1/autocomplete";
const MIN_QUERY_LENGTH = 3;

/**
 * Hook to get location autocomplete suggestions using LocationIQ API.
 */
export const useLocationIQAutocomplete = ({
  apiKey,
  debounceTime = 500,
  options = {}
}: UseLocationIQAutocompleteProps): AutocompleteState & {
  setQuery: (query: string) => void;
} => {
  const [state, setState] = useState<AutocompleteState>({
    query: "",
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

  const fetchSuggestions = useCallback(
    async (trimmedQuery: string) => {
      // Cancel any in-flight requests
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const currentRequestId = ++requestIdRef.current;
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(
          `${BASE_URL}?${buildQueryParams(trimmedQuery)}`,
          { signal: controller.signal }
        );

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

  const debouncedFetch = useDebouncedCallback(fetchSuggestions, [], debounceTime);

  const setQuery = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      setState((prev) => ({ ...prev, query }));

      if (trimmed.length >= MIN_QUERY_LENGTH) {
        debouncedFetch(trimmed);
      } else {
        setState((prev) => ({
          ...prev,
          results: trimmed.length > 0 ? cachedResultsRef.current : []
        }));
      }
    },
    [debouncedFetch]
  );

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return useMemo(() => ({ ...state, setQuery }), [state, setQuery]);
};
