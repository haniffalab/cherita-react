import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import React from "react";
import { Heatmap } from "./Heatmap.js";
import { DatasetProvider } from "./DatasetContext.js";
import { ObsColsList } from "./ObsList.js";
import { VarNamesList } from "./VarList.js";

export default function App({ dataset_url }) {
  return (
    <DatasetProvider dataset_url={dataset_url}>
      <div className="container-fluid mh-100">
        <div className="row mh-75">
          <div className="col-3 mh-100">
            <ObsColsList />
          </div>
          <div className="col-3 mh-100">
            <VarNamesList />
          </div>
          <div className="col-6 mh-100">
            <Heatmap />
          </div>
        </div>
      </div>
    </DatasetProvider>
  );
}
