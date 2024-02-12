import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "./App.scss";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App dataset_url="https://storage.googleapis.com/haniffalab/test/tmp-breast_cancer-visium-extended.zarr" />
    </BrowserRouter>
  </React.StrictMode>
);
