import React from "react";

import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./App.scss";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App
        dataset_url="https://storage.googleapis.com/haniffalab/whole-embryo/zarr/WE_n3_scRNAseq_filt_cells_filt_genes_lognorm_counts_with_QC_and_annots_lvl5_and_scVI_20240404-elmer.zarr"
        imageUrl="https://storage.googleapis.com/haniffalab/whole-embryo/ref_imgs/ref.png"
      />
    </BrowserRouter>
  </React.StrictMode>
);
