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
    headers: { "Content-Type": "application/json", Accept: "application/json" },
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

export const useFetch = (
  endpoint,
  params,
  opts = { refetchOnMount: false, refetchOnWindowFocus: false },
  apiUrl = null
) => {
  const { enabled = true } = opts;
  const {
    data: fetchedData = null,
    isPending = false,
    error: serverError = null,
  } = useQuery({
    queryKey: [endpoint, params],
    queryFn: ({ signal }) => {
      if (enabled) {
        return fetchData(endpoint, params, signal, apiUrl);
      } else {
        return;
      }
    },
    retry: (failureCount, { error }) => {
      if ([400, 401, 403, 404, 422].includes(error?.status)) return false;
      return failureCount < 3;
    },
    ...opts,
  });

  return { fetchedData, isPending, serverError: parseError(serverError) };
};

export const useDebouncedFetch = (
  endpoint,
  params,
  delay = 500,
  opts = { refetchOnMount: false, refetchOnWindowFocus: false },
  apiUrl = null
) => {
  const { enabled = true } = opts;
  const debouncedParams = useDebounce(params, delay);

  const {
    data: fetchedData = null,
    isPending = false,
    error: serverError = null,
  } = useQuery({
    queryKey: [endpoint, debouncedParams],
    queryFn: ({ signal }) => {
      if (enabled) {
        return fetchData(endpoint, debouncedParams, signal, apiUrl);
      } else {
        return;
      }
    },
    retry: (failureCount, { error }) => {
      if ([400, 401, 403, 404, 422].includes(error?.status)) return false;
      return failureCount < 3;
    },
    ...opts,
  });

  return { fetchedData, isPending, serverError: parseError(serverError) };
};
