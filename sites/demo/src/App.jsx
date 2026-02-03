import {
  ObservationFeature,
  PerturbationMap,
  PLOT_TYPES,
} from '@haniffalab/cherita-react';
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
        <Route
          exac
          t
          path="/observation-feature/embedded-plot/dotplot"
          element={<DotplotDemo {...props} />}
        />
        <Route
          exact
          path="/observation-feature/embedded-plot/heatmap"
          element={<HeatmapDemo {...props} />}
        />
        <Route
          exact
          path="/observation-feature/embedded-plot/matrixplot"
          element={<MatrixplotDemo {...props} />}
        />
        <Route
          exact
          path="/observation-feature/embedded-plot/scatterplot"
          element={<ScatterplotDemo {...props} />}
        />
        <Route
          exact
          path="/observation-feature/embedded-plot/violin"
          element={<ViolinDemo {...props} />}
        />
        <Route
          exact
          path="/observation-feature/standard-view/dotplot"
          element={
            <ObservationFeature.StandardView
              {...props}
              defaultPlotType={PLOT_TYPES.DOTPLOT}
            />
          }
        ></Route>
        <Route
          exact
          path="/observation-feature/standard-view/heatmap"
          element={
            <ObservationFeature.StandardView
              {...props}
              defaultPlotType={PLOT_TYPES.HEATMAP}
            />
          }
        ></Route>
        <Route
          exact
          path="/observation-feature/standard-view/matrixplot"
          element={
            <ObservationFeature.StandardView
              {...props}
              defaultPlotType={PLOT_TYPES.MATRIXPLOT}
            />
          }
        ></Route>
        <Route
          exact
          path="/observation-feature/standard-view/scatterplot"
          element={
            <ObservationFeature.StandardView
              {...props}
              defaultPlotType={PLOT_TYPES.SCATTERPLOT}
            />
          }
        ></Route>
        <Route
          exact
          path="/observation-feature/standard-view/violin"
          element={
            <ObservationFeature.StandardView
              {...props}
              defaultPlotType={PLOT_TYPES.VIOLINPLOT}
            />
          }
        ></Route>
        <Route
          exact
          path="/perturbation-map/standard-view"
          element={<PerturbationMap.StandardView {...props} />}
        ></Route>
      </Routes>
      <Footer />
    </div>
  );
}
