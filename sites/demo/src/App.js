import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import HeatmapDemo from "./containers/HeatmapDemo";
import ScatterplotDemo from "./containers/ScatterplotDemo";

export default function App({ dataset_url }) {
  return (
    <DatasetProvider dataset_url={dataset_url}>
      <div className="container-fluid" style={{ height: "100vh" }}>
        <div className="row h-50" style={{ marginBottom: "150px" }}>
          <div className="col-3 h-100">
            {" "}
            <ObsColsList />
          </div>
          <div className="col-3 h-100">
            {/* <VarNamesList /> */}
            <MultiVarNamesList />
          </div>
          <div className="col-6 h-100">
            <Heatmap />
          </div>
        </div>
        <div className="row h-50">
          <Dotplot />
        </div>
      </div>
    </DatasetProvider>
  );
}
