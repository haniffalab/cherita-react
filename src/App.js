import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import { Heatmap } from "./Heatmap.js";
import { DatasetProvider } from "./DatasetContext.js";
import { ObsColsList } from "./ObsList.js";
import { MultiVarNamesList } from "./VarList.js";

export default function App({ dataset_url }) {
  return (
    <DatasetProvider dataset_url={dataset_url}>
      <div className="container-fluid" style={{ height: "100vh" }}>
        <div className="row h-50">
          <div className="col-3 h-100">
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
          <Heatmap />
        </div>
      </div>
    </DatasetProvider>
  );
}
