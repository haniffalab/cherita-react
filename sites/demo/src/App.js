import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import HeatmapDemo from "./containers/HeatmapDemo";
import ScatterplotDemo from "./containers/ScatterplotDemo";
import DotplotDemo from "./containers/DotplotDemo";

export default function App({ dataset_url }) {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route exact path="/" element={<h1>Home Page</h1>} />
        <Route exact path="/heatmap" element={<HeatmapDemo dataset_url={dataset_url} />} />
        <Route exact path="/scatterplot" element={<ScatterplotDemo dataset_url={dataset_url} />} />
        <Route exact path="/dotplot" element={<DotplotDemo dataset_url={dataset_url} />} />
      </Routes>
      <Footer />
    </div>
  );
}