import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
const config = {
  url: {
    default:
      "https://storage.googleapis.com/haniffalab/test/breast_cancer-visium-anndata.zarr",
  },
  selectedMultiVar: {
    key1: [],
    key2: [],
  },
};
root.render(
  <React.StrictMode>
    <App config={config} />
  </React.StrictMode>
);
