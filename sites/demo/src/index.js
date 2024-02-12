import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "./App.scss";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App dataset_url="https://storage.googleapis.com/haniffalab/fetal-bone-marrow/zarr/fig1b_fbm_scaled_gex_updated_dr_20210104.zarr" />
    </BrowserRouter>
  </React.StrictMode>
);
