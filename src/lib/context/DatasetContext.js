import React, { createContext, useContext } from "react";

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient, QueryCache } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import _ from "lodash";

import { FilterProvider } from "./FilterContext";
import { SettingsProvider } from "./SettingsContext";
import { ZarrDataProvider } from "./ZarrDataContext";

export const DatasetContext = createContext(null);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 15, // garbage collect after 15min of inactive
      staleTime: 1000 * 60 * 60,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      console.error(error);
    },
  }),
});
// Type of queries to store responses
const persistKeys = [
  "obs/cols",
  "var/names",
  "obsm/keys",
  "obs/bins",
  "obs/distribution",
];
const persistOptions = {
  persister: createSyncStoragePersister({ storage: window.localStorage }),
  dehydrateOptions: {
    shouldDehydrateQuery: ({ queryKey, state }) => {
      if (state.status === "success") {
        return persistKeys.includes(queryKey?.[0]);
      }
      return false;
    },
  },
  // @TODO: add maxAge and buster (app and api version numbers as busters)
};

const initialDataset = {
  url: null,
  varNamesCol: null,
  diseaseDatasets: [],
  obsGroups: null,
  imageUrl: null,
  defaultSettings: {},
  canOverrideSettings: true,
  useUnsColors: false,
};

export function DatasetProvider({ dataset_url, children, ...dataset_params }) {
  const dataset = _.assign(initialDataset, {
    url: dataset_url,
    ...dataset_params,
  });

  return (
    <DatasetContext.Provider value={dataset}>
      <SettingsProvider
        dataset_url={dataset.url}
        defaultSettings={dataset.defaultSettings}
        canOverrideSettings={dataset.canOverrideSettings}
      >
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={persistOptions}
        >
          <FilterProvider>
            <ZarrDataProvider>{children}</ZarrDataProvider>
          </FilterProvider>
        </PersistQueryClientProvider>
      </SettingsProvider>
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  return useContext(DatasetContext);
}
