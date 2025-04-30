import React from "react";

import { Route, Routes } from "react-router-dom";

import Footer from "./components/Footer";
import Header from "./components/Header";
import DotplotDemo from "./containers/DotplotDemo";
import { FullPageDemo } from "./containers/FullPageDemo";
import HeatmapDemo from "./containers/HeatmapDemo";
import MatrixplotDemo from "./containers/MatrixplotDemo";
import {
  FullPageDotplot,
  FullPageHeatmap,
  FullPageMatrixplot,
  FullPageViolin,
  PlotsDemo,
} from "./containers/PlotsDemo";
import { PseudospatialDemo } from "./containers/PseudospatialDemo";
import ScatterplotDemo from "./containers/ScatterplotDemo";
import ViolinDemo from "./containers/ViolinDemo";

export default function App(props) {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route
          exact
          path="/"
          element={
            <p className="m-3">Demo website for @haniffalab/cherita-react</p>
          }
        />
        <Route exact path="/dotplot" element={<DotplotDemo {...props} />} />
        <Route exact path="/heatmap" element={<HeatmapDemo {...props} />} />
        <Route
          exact
          path="/matrixplot"
          element={<MatrixplotDemo {...props} />}
        />
        <Route
          exact
          path="/scatterplot"
          element={<ScatterplotDemo {...props} />}
        />
        <Route exact path="/violin" element={<ViolinDemo {...props} />} />
        <Route
          exact
          path="/pseudospatial"
          element={<PseudospatialDemo {...props} />}
        />
        <Route
          exact
          path="/full-page"
          element={<FullPageDemo {...props} />}
        ></Route>
        <Route exact path="/plots" element={<PlotsDemo {...props} />}></Route>
        <Route
          exact
          path="/full-page/dotplot"
          element={<FullPageDotplot {...props} />}
        ></Route>
        <Route
          exact
          path="/full-page/heatmap"
          element={<FullPageHeatmap {...props} />}
        ></Route>
        <Route
          exact
          path="/full-page/matrixplot"
          element={<FullPageMatrixplot {...props} />}
        ></Route>
        <Route
          exact
          path="/full-page/violin"
          element={<FullPageViolin {...props} />}
        ></Route>
      </Routes>
      <Footer />
    </div>
  );
}
