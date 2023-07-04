import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import {
  DatasetProvider,
  ObsColsList,
  MultiVarNamesList,
  VarNamesList,
  Heatmap,
  Scatterplot,
  Dotplot,
} from "@haniffalab/cherita-react";

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
        <div className="row h-50">
          <Scatterplot />
        </div>
      </div>
    </DatasetProvider>
  );
}
