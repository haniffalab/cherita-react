import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
const config = {
  url: {
    default:
      "https://storage.googleapis.com/haniffalab/test/breast_cancer-visium-anndata.zarr",
  },
  selectedObs: {
    key1: null,
    key2: "graphclust",
  },
  selectedMultiVar: {
    key1: [],
  },
};
root.render(
  <React.StrictMode>
    <App config={config} />
  </React.StrictMode>
);
