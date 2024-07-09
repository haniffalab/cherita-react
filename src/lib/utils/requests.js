import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";

import { parseError } from "./errors";

export async function fetchData(
  endpoint,
  params,
  signal = null,
  ms = 300000,
  apiUrl = null
) {
  apiUrl = apiUrl || process.env.REACT_APP_API_URL;
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort(DOMException.TIMEOUT_ERR);
  }, ms || 300000);
  if (signal) signal.addEventListener("abort", () => controller.abort());

  const response = await fetch(new URL(endpoint, apiUrl), {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(params),
    signal: controller.signal,
  })
    .catch((err) => {
      // Manual check as fetch returns an AbortError regardless of the reason set to the signal
      if (
        controller.signal.aborted &&
        controller.signal.reason === DOMException.TIMEOUT_ERR
      ) {
        throw DOMException.TIMEOUT_ERR;
      }
      throw err;
    })
    .finally(() => clearTimeout(timeout));

  if (!response.ok) {
    throw await response.json();
  }

  return await response.json();
}

export const useFetch = (endpoint, params, opts = {}, apiUrl = null) => {
  const { enabled = true } = opts;
  const {
    data: fetchedData,
    isLoading: isPending,
    error: serverError,
  } = useQuery({
    queryKey: [endpoint, params],
    queryFn: ({ signal }) => {
      if (enabled) {
        return fetchData(endpoint, params, signal, apiUrl);
      } else {
        return;
      }
    },
    ...opts,
  });

  return { fetchedData, isPending, serverError: parseError(serverError) };
};

export const useDebouncedFetch = (
  endpoint,
  params,
  delay = 500,
  opts = {},
  apiUrl = null
) => {
  const { enabled = true } = opts;
  const debouncedParams = useDebounce(params, delay);

  const {
    data: fetchedData,
    isLoading: isPending,
    error: serverError,
  } = useQuery({
    queryKey: [endpoint, debouncedParams],
    queryFn: ({ signal }) => {
      if (enabled) {
        return fetchData(endpoint, debouncedParams, signal, apiUrl);
      } else {
        return;
      }
    },
    ...opts,
  });

  return { fetchedData, isPending, serverError: parseError(serverError) };
};
