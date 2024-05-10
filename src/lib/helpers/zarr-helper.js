import { useEffect, useState, useMemo } from "react";
import { openArray } from "zarr";

export const GET_OPTIONS = {
  concurrencyLimit: 10, // max number of concurrent requests (default 10)
  progressCallback: ({ progress, queueSize }) => {
    console.log(`${(progress / queueSize) * 100}% complete.`);
  }, // callback executed after each request
};

export class ZarrHelper {
  async open(url, path) {
    const z = await openArray({
      store: url,
      path: path,
      mode: "r",
    });
    return z;
  }
}

export const useZarr = ({ url, path }, s = null, opts = {}) => {
  const [data, setData] = useState(null);
  const [isPending, setIsPending] = useState(true);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsPending(true);
        const zarrHelper = new ZarrHelper();
        const z = await zarrHelper.open(url, path);
        const result = await z.get(s, opts);
        setData(result.data);
      } catch (error) {
        setServerError(error.message);
      } finally {
        setIsPending(false);
      }
    };

    fetchData();
  }, [opts, path, s, url]);

  return { data, isPending, serverError };
};
