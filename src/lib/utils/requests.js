import { useEffect, useState, useCallback } from "react";

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

export const useFetch = (endpoint, params, deps = []) => {
  const [fetchedData, setFetchedData] = useState([]);
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();
    setIsPending(true);
    fetchData(endpoint, params, abortController.signal)
      .then((data) => {
        setIsPending(false);
        setFetchedData(data);
        setServerError(false);
      })
      .catch((response) => {
        setIsPending(false);
        if (response.name !== "AbortError") {
          response.json().then((json) => {
            setServerError(json.message);
            console.log(json.message);
          });
        }
      });
    return () => {
      abortController.abort();
    };
  }, [endpoint, params, ...deps]);

  return { fetchedData, isPending, serverError };
};

export const useDebouncedFetch = (endpoint, params, delay = 500, deps = []) => {
  const [fetchedData, setFetchedData] = useState([]);
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState(null);

  const fetch = useCallback(
    (params, signal) => {
      setIsPending(true);
      fetchData(endpoint, params, signal)
        .then((data) => {
          setIsPending(false);
          setFetchedData(data);
          setServerError(false);
        })
        .catch((response) => {
          setIsPending(false);
          if (response.name !== "AbortError") {
            response.json().then((json) => {
              setServerError(json.message);
              console.log(json.message);
            });
          }
        });
    },
    [endpoint]
  );

  useEffect(() => {
    const abortController = new AbortController();
    const handler = setTimeout(
      () => fetch(params, abortController.signal),
      delay
    );
    return () => {
      abortController.abort();
      clearTimeout(handler);
    };
  }, [endpoint, params, delay, fetch, ...deps]);

  return { fetchedData, isPending, serverError };
};
