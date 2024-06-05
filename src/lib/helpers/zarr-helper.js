import { useEffect, useState } from "react";
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

const fetchDataFromZarr = async (url, path, s, opts) => {
  try {
    const zarrHelper = new ZarrHelper();
    const z = await zarrHelper.open(url, path);
    const result = await z.get(s, opts);
    return result.data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const useZarr = ({ url, path }, s = null, opts = {}) => {
  const [data, setData] = useState(null);
  const [isPending, setIsPending] = useState(true);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    setIsPending(true);
    setServerError(null);
    fetchDataFromZarr(url, path, s, opts)
      .then((data) => {
        setData(data);
      })
      .catch((error) => {
        setServerError(error.message);
      })
      .finally(() => {
        setIsPending(false);
      });
  }, [opts, path, s, url]);

  return { data, isPending, serverError };
};

export const useMultipleZarr = (inputs, opts = {}) => {
  const [results, setResults] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const results = await Promise.all(
        inputs.map((input) =>
          fetchDataFromZarr(input.url, input.path, input.s, opts)
        )
      );
      const dataObject = {};
      results.forEach((result, index) => {
        const key = inputs[index].key;
        dataObject[key] = result;
      });
      setResults(dataObject);
    };

    fetchData();
  }, [inputs, opts]);

  return results;
};
