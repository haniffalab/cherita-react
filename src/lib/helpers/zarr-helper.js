import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { ArrayNotFoundError, GroupNotFoundError, openArray } from "zarr";

export const GET_OPTIONS = {
  concurrencyLimit: 10, // max number of concurrent requests (default 10)
  progressCallback: ({ progress, queueSize }) => {
    console.log(`${(progress / queueSize) * 100}% complete.`);
  }, // callback executed after each request
};

export class ZarrHelper {
  async open(url, path) {
    const z = await openArray({ store: url, path: path, mode: "r" });
    return z;
  }
}

const fetchDataFromZarr = async (url, path, s, opts) => {
  try {
    const zarrHelper = new ZarrHelper();
    const z = await zarrHelper.open(url, path);
    const result = await z.get(s, opts);
    return result.data;
  } catch (error) {
    if (
      error instanceof ArrayNotFoundError ||
      error instanceof GroupNotFoundError
    ) {
      error.status = 404;
    }
    throw error;
  }
};

export const useZarr = (
  { url, path },
  s = null,
  options = GET_OPTIONS,
  opts = {}
) => {
  const { enabled = true } = opts;
  const {
    data = null,
    isLoading: isPending = false,
    error: serverError = null,
  } = useQuery({
    queryKey: ["zarr", url, path, s],
    queryFn: () => {
      if (enabled) {
        return fetchDataFromZarr(url, path, s, options);
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

  return { data, isPending, serverError };
};

const fetchDataFromZarrs = async (inputs, opts) => {
  try {
    const results = await Promise.all(
      inputs.map((input) =>
        fetchDataFromZarr(input.url, input.path, input.s, opts)
      )
    );
    return results;
  } catch (error) {
    throw new Error(error.message);
  }
};

const aggregateData = (inputs, data) => {
  const dataObject = {};
  data.forEach((result, index) => {
    const key = inputs[index].key;
    dataObject[key] = result;
  });
  return dataObject;
};

// @TODO: return response of successfully fetched data when error occurs
export const useMultipleZarr = (inputs, opts = {}, agg = aggregateData) => {
  const { enabled = true } = opts;
  const [data, setData] = useState(null);
  const [isPending, setIsPending] = useState(true);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (enabled) {
      setIsPending(true);
      setServerError(null);
      fetchDataFromZarrs(inputs, opts)
        .then((data) => {
          setData(agg(inputs, data));
        })
        .catch((error) => {
          setServerError(error.message);
        })
        .finally(() => {
          setIsPending(false);
        });
    } else {
      setData(null);
      setIsPending(false);
      setServerError(null);
    }
  }, [agg, enabled, inputs, opts]);

  return { data, isPending, serverError };
};
