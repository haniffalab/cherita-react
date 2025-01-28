import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import '@testing-library/jest-dom';
import { render, screen } from "@testing-library/react";
import React from "react";
import { ObsColsList } from "../lib/components/obs-list/ObsList";

// Mock the context or props
const mockDataset = {
  selectedObs: { name: "mockName" },
};

const mockDispatch = jest.fn();

jest.mock("../lib/context/DatasetContext", () => ({
  useDataset: () => mockDataset,
  useDatasetDispatch: () => mockDispatch,
}));

const queryClient = new QueryClient();

test("renders ObsColsList component", () => {
  render(
    <QueryClientProvider client={queryClient}>
      <ObsColsList />
    </QueryClientProvider>
  );
  const element = screen.getByRole("progressbar");
  expect(element).toBeInTheDocument();
});