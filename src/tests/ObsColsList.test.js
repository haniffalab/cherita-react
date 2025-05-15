import React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import { ObsColsList } from "../lib/components/obs-list/ObsList";
import { DatasetProvider } from "../lib/context/DatasetContext";
import { useFetch } from "../lib/utils/requests";

// Mock the context or props
const mockDataset = {
  varNamesCol: null,
};

jest.mock("@tanstack/react-query-persist-client", () => ({
  PersistQueryClientProvider: ({ children }) => <>{children}</>,
}));

const Wrapper = ({ children }) => {
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
      <DatasetProvider dataset={mockDataset}>{children}</DatasetProvider>
    </QueryClientProvider>
  );
};

jest.mock("../lib/utils/requests", () => ({
  useFetch: jest.fn(),
}));

test("renders ObsColsList component", () => {
  useFetch.mockReturnValue({
    fetchedData: null,
    isPending: true,
    serverError: null,
  });

  render(<ObsColsList />, { wrapper: Wrapper });
  const element = screen.getByRole("progressbar");
  expect(element).toBeInTheDocument();
});

test("fetches data and renders ObsColsList", async () => {
  const mockData = [
    {
      codes: {
        False: 0,
        True: 1,
      },
      n_values: 2,
      name: "boolean",
      type: "boolean",
      value_counts: {
        False: 10,
        True: 5,
      },
      values: ["False", "True"],
    },
  ];

  useFetch.mockReturnValue({
    fetchedData: mockData,
    isPending: false,
    serverError: null,
  });

  render(<ObsColsList />, { wrapper: Wrapper });

  const element = await screen.findByText("boolean");
  expect(element).toBeInTheDocument();
});
