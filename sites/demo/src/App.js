import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import {
  DatasetProvider,
  ObsColsList,
  VarNamesList,
  Heatmap,
  Dotplot,
  Matrixplot,
  Violin,
  SELECTION_MODES,
  VIOLIN_MODES,
} from "@haniffalab/cherita-react";

export default function App({ dataset_url }) {
  return (
    <DatasetProvider dataset_url={dataset_url}>
      <div className="container-fluid" style={{ height: "100vh" }}>
        <div className="row h-50" style={{ marginBottom: "150px" }}>
          <div className="col-4 h-100">
            <ObsColsList />
          </div>
          <div className="col-4 h-100">
            <VarNamesList mode={SELECTION_MODES.MULTIPLE} />
          </div>
          <div className="col-4 h-100">
            <VarNamesList mode={SELECTION_MODES.SINGLE} />
          </div>
        </div>
        <div className="row h-50">
          <Heatmap />
        </div>
        <div className="row h-50">
          <Dotplot />
        </div>
        <div className="row h-50">
          <Matrixplot />
        </div>
        <div className="row h-50">
          <Violin mode={VIOLIN_MODES.GROUPBY} />
        </div>
        <div className="row h-50">
          <Violin mode={VIOLIN_MODES.MULTIKEY} />
        </div>
      </div>
    </DatasetProvider>
  );
}
