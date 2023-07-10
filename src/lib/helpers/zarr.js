import { openArray } from "zarr";

export const GET_OPTIONS = {
    concurrencyLimit: 10, // max number of concurrent requests (default 10)
    progressCallback: ({ progress, queueSize }) => {
        console.log(`${progress / queueSize * 100}% complete.`)
    } // callback executed after each request
};

export class ZarrHelper {
    open = async (dataset, path) => {
        const z = await openArray({
            store: dataset.url,
            path: path,
            mode: "r"
        });
        return z;
    };
} 