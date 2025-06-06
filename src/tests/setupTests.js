import React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom";

import { DatasetProvider } from "../lib/context/DatasetContext";

// Mock the context or props
export const mockDataset = {
  varNamesCol: null,
  defaultSettings: {
    vars: [
      {
        name: "gene1",
        index: "gene1",
        matrix_index: 0,
      },
    ],
  },
};

jest.mock("@tanstack/react-query-persist-client", () => ({
  PersistQueryClientProvider: ({ children }) => <>{children}</>,
}));

jest.mock("../lib/utils/requests", () => ({
  useFetch: jest.fn(),
  useDebouncedFetch: jest.fn(),
}));

export const Wrapper = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: process.env.NODE_ENV === "test" ? () => {} : console.error,
    },
  });

  return (
    // Provide a query client as PersistQueryClientProvider is mocked
    <QueryClientProvider client={queryClient}>
      <DatasetProvider {...mockDataset}>{children}</DatasetProvider>
    </QueryClientProvider>
  );
};
