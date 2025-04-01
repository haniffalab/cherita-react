import { useCallback } from "react";

import { useQueries, useQuery } from "@tanstack/react-query";
import { ArrayNotFoundError, GroupNotFoundError, openArray } from "zarr";

export const GET_OPTIONS = {
  concurrencyLimit: 10, // max number of concurrent requests (default 10)
  progressCallback: ({ progress, queueSize }) => {
    console.debug(`${(progress / queueSize) * 100}% complete.`);
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
  const {
    data = null,
    isLoading: isPending = false,
    error: serverError = null,
  } = useQuery({
    queryKey: ["zarr", url, path, s],
    queryFn: () => fetchDataFromZarr(url, path, s, options),
    retry: (failureCount, { error }) => {
      if ([400, 401, 403, 404, 422].includes(error?.status)) return false;
      return failureCount < 3;
    },
    ...opts,
  });

  return { data, isPending, serverError };
};

const aggregateData = (inputs, data) => {
  const dataObject = {};
  inputs.forEach((input, index) => {
    const key = input.key;
    dataObject[key] = data?.[index];
  });
  return dataObject;
};

export const useMultipleZarr = (
  inputs,
  options = GET_OPTIONS,
  opts = {},
  agg = aggregateData
) => {
  const combine = useCallback(
    (results) => {
      return {
        data: agg(
          inputs,
          results.map((result) => result.data)
        ),
        isLoading: results.some((result) => result.isLoading),
        serverError: results.find((result) => result.error),
      };
    },
    [agg, inputs]
  );

  const {
    data = null,
    isLoading: isPending = false,
    serverError = null,
  } = useQueries({
    queries: inputs.map((input) => ({
      queryKey: ["zarr", input.url, input.path, input.s],
      queryFn: () => fetchDataFromZarr(input.url, input.path, input.s, options),
      retry: (failureCount, { error }) => {
        if ([400, 401, 403, 404, 422].includes(error?.status)) return false;
        return failureCount < 3;
      },
      ...opts,
    })),
    combine,
  });

  return { data, isPending, serverError };
};
