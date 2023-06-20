import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import { Heatmap } from "./Heatmap.js";
import { DatasetProvider } from "./DatasetContext.js";
import { ObsColsList } from "./ObsList.js";
import { MultiVarNamesList } from "./VarList.js";

export default function App({ config }) {
  return (
    <DatasetProvider config={config}>
      <div className="container-fluid" style={{ height: "100vh" }}>
        <div className="row h-100">
          <div className="col-3 h-100">
            <ObsColsList />
          </div>
          <div className="col-9 h-100">
            <div className="row h-50">
              <div className="col-6 h-100">
                <MultiVarNamesList config={{ selectedMultiVar: "key1" }} />
              </div>
              <div className="col-6 h-100">
                <Heatmap config={{ selectedMultiVar: "key1" }} />
              </div>
            </div>
            <div className="row h-50">
              <div className="col-6 h-100">
                <MultiVarNamesList config={{ selectedMultiVar: "key2" }} />
              </div>
              <div className="col-6 h-100">
                <Heatmap config={{ selectedMultiVar: "key2" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DatasetProvider>
  );
}
