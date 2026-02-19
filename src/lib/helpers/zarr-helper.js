import { useCallback } from 'react';

import { useQueries, useQuery } from '@tanstack/react-query';
import isnd from 'isndarray';
import ndarray from 'ndarray';
import unpack from 'ndarray-unpack';
import * as zarr from 'zarrita';

export class ZarrHelper {
  async open(url, path) {
    const root = zarr.root(new zarr.FetchStore(url));
    const z = await zarr.open(root.resolve(path));
    return z;
  }
}

const fetchDataFromZarr = async (url, path, s) => {
  try {
    const zarrHelper = new ZarrHelper();
    const z = await zarrHelper.open(url, path);
    let result;
    const res = await zarr.get(z, s);
    const { data, shape } = res;
    if (data && shape) {
      result = ndarray(data, shape);
    } else {
      result = res;
    }
    if (result.dtype === 'bigint64')
      throw new Error('bigint64 dtype not supported');
    if (isnd(result)) {
      const arr = unpack(result);
      return arr;
    }
    return result;
  } catch (error) {
    if (error instanceof zarr.NodeNotFoundError) {
      error.status = 404;
    }
    throw error;
  }
};

export const useZarr = ({ url, path, s = null }, opts = {}) => {
  const {
    data = null,
    isLoading: isPending = false,
    error: serverError = null,
  } = useQuery({
    queryKey: ['zarr', url, path, s],
    queryFn: () => fetchDataFromZarr(url, path, s),
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

export const useMultipleZarr = (inputs, opts = {}, agg = aggregateData) => {
  const combine = useCallback(
    (results) => {
      return {
        data: agg(
          inputs,
          results.map((result) => result.data),
        ),
        isLoading: results.some((result) => result.isLoading),
        serverError: results.find((result) => result.error),
      };
    },
    [agg, inputs],
  );

  const {
    data = null,
    isLoading: isPending = false,
    serverError = null,
  } = useQueries({
    queries: inputs.map((input) => ({
      queryKey: ['zarr', input.url, input.path, input.s],
      queryFn: () => fetchDataFromZarr(input.url, input.path, input.s),
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
