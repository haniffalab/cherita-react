import React from "react";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Footer from "./components/Footer";
import Header from "./components/Header";
import DotplotDemo from "./containers/DotplotDemo";
import { FullPageDemo } from "./containers/FullPageDemo";
import HeatmapDemo from "./containers/HeatmapDemo";
import MatrixplotDemo from "./containers/MatrixplotDemo";
import ScatterplotDemo from "./containers/ScatterplotDemo";
import ViolinDemo from "./containers/ViolinDemo";

export default function App(props) {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route exact path="/" element={<h1>Home Page</h1>} />
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
          path="/full-page"
          element={<FullPageDemo {...props} />}
        ></Route>
      </Routes>
      <Footer />
    </div>
  );
}
