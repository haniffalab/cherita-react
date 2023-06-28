import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App dataset_url="https://storage.googleapis.com/haniffalab/test/breast_cancer-visium-anndata.zarr" />
  </React.StrictMode>
);
