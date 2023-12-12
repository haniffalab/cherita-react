import { useDebounce } from "@uidotdev/usehooks";
import { useQuery } from "@tanstack/react-query";

export async function fetchData(endpoint, params, signal = null) {
  const apiUrl = process.env.REACT_APP_API_URL;
  const response = await fetch(new URL(endpoint, apiUrl), {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(params),
    signal: signal,
  });
  if (!response.ok) {
    throw response;
  }
  return await response.json();
}

export const useFetch = (endpoint, params, opts = null) => {
  const {
    data: fetchedData,
    isPending,
    error: serverError,
  } = useQuery({
    queryKey: [endpoint, params],
    queryFn: ({ signal }) => fetchData(endpoint, params, signal),
    ...opts,
  });

  return { fetchedData, isPending, serverError };
};

export const useDebouncedFetch = (
  endpoint,
  params,
  delay = 500,
  opts = null
) => {
  const debouncedParams = useDebounce(params, delay);

  const {
    data: fetchedData,
    isPending,
    error: serverError,
  } = useQuery({
    queryKey: [endpoint, debouncedParams],
    queryFn: ({ signal }) => fetchData(endpoint, debouncedParams, signal),
    ...opts,
  });

  return { fetchedData, isPending, serverError };
};
