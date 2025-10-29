import { FullPage, PLOT_TYPES } from '@haniffalab/cherita-react';
import { Route, Routes } from 'react-router-dom';

import Footer from './components/Footer';
import Header from './components/Header';
import DotplotDemo from './containers/DotplotDemo';
import HeatmapDemo from './containers/HeatmapDemo';
import MatrixplotDemo from './containers/MatrixplotDemo';
import ScatterplotDemo from './containers/ScatterplotDemo';
import ViolinDemo from './containers/ViolinDemo';

export default function App(props) {
  return (
    <div className="app">
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
          path="/full-page/scatterplot"
          element={
            <FullPage {...props} defaultPlotType={PLOT_TYPES.SCATTERPLOT} />
          }
        ></Route>
        <Route
          exact
          path="/full-page/dotplot"
          element={<FullPage {...props} defaultPlotType={PLOT_TYPES.DOTPLOT} />}
        ></Route>
        <Route
          exact
          path="/full-page/heatmap"
          element={<FullPage {...props} defaultPlotType={PLOT_TYPES.HEATMAP} />}
        ></Route>
        <Route
          exact
          path="/full-page/matrixplot"
          element={
            <FullPage {...props} defaultPlotType={PLOT_TYPES.MATRIXPLOT} />
          }
        ></Route>
        <Route
          exact
          path="/full-page/violin"
          element={
            <FullPage {...props} defaultPlotType={PLOT_TYPES.VIOLINPLOT} />
          }
        ></Route>
      </Routes>
      <Footer />
    </div>
  );
}
