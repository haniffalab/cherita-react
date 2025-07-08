import React from "react";

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import { Wrapper } from "./setupTests";
import { VarNamesList } from "../lib/components/var-list/VarList";
import { useDebouncedFetch, useFetch } from "../lib/utils/requests";
import { useResolver } from "../lib/utils/Resolver";

test("renders VarList component", async () => {
  useResolver.mockImplementation((initSettings) => {
    return {
      ...initSettings,
      data: {
        vars: {
          gene1: {
            name: "gene1",
            index: "gene1",
            matrix_index: 0,
          },
        },
      },
    };
  });

  useFetch.mockReturnValue({
    fetchedData: null,
    isPending: false,
    serverError: null,
  });

  useDebouncedFetch.mockReturnValue({
    fetchedData: null,
    isPending: false,
    serverError: null,
  });

  render(<VarNamesList />, { wrapper: Wrapper });
  const element = await screen.findByText("gene1");
  expect(element).toBeInTheDocument();
});
