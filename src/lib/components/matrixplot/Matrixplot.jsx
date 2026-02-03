import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import _ from 'lodash';
import { Button } from 'react-bootstrap';
import Plot from 'react-plotly.js';

import { PLOTLY_MODEBAR_BUTTONS } from '../../constants/constants';
import { useDataset } from '../../context/DatasetContext';
import { useFilteredData } from '../../context/FilterContext';
import { useSettings } from '../../context/SettingsContext';
import usePlotVisibility from '../../hooks/usePlotVisibility';
import { LoadingSpinner } from '../../utils/LoadingIndicators';
import { useDebouncedFetch } from '../../utils/requests';
import { useSelectedMultiVar, useSelectedObs } from '../../utils/Resolver';
import { PlotAlert } from '../plot/PlotAlert';
import { PlotlyToolbar, PlotlyModebarControls } from '../toolbar/Toolbar';

export function Matrixplot({
  setShowCategories,
  setShowSearch,
  setShowControls,
  plotType,
  setPlotType,
  isFullscreen = false,
}) {
  const ENDPOINT = 'matrixplot';
  const dataset = useDataset();
  const settings = useSettings();
  const { obsIndices, isSliced } = useFilteredData();
  const colorscale = useRef(settings.controls.colorScale);
  const [data, setData] = useState([]);
  const [layout, setLayout] = useState({});
  const [hasSelections, setHasSelections] = useState(false);

  const selectedObs = useSelectedObs();
  const selectedMultiVar = useSelectedMultiVar();

  const { showCategoriesBtn, showSearchBtn, isCompact } =
    usePlotVisibility(isFullscreen);

  const params = useMemo(
    () => ({
      url: dataset.url,
      obsCol: selectedObs,
      obsValues: !selectedObs?.omit?.length
        ? null
        : _.difference(selectedObs?.values, selectedObs?.omit),
      varKeys: selectedMultiVar.map((i) =>
        i.isSet
          ? { name: i.name, indices: i.vars.map((v) => v.index) }
          : i.index,
      ),
      obsIndices: isSliced ? [...(obsIndices || [])] : null,
      standardScale: settings.controls.scale.matrixplot,
      varNamesCol: dataset.varNamesCol,
    }),
    [
      dataset.url,
      dataset.varNamesCol,
      isSliced,
      obsIndices,
      selectedMultiVar,
      selectedObs,
      settings.controls.scale.matrixplot,
    ],
  );

  useEffect(() => {
    if (selectedObs && selectedMultiVar.length) {
      setHasSelections(true);
    } else {
      setHasSelections(false);
    }
  }, [selectedMultiVar.length, selectedObs]);

  const updateColorscale = useCallback((colorscale) => {
    setLayout((l) => {
      return {
        ...l,
        coloraxis: { ...l.coloraxis, colorscale: colorscale },
      };
    });
  }, []);

  const { fetchedData, isPending, serverError } = useDebouncedFetch(
    ENDPOINT,
    params,
    500,
    { isEnabled: (params) => !!params.obsCol && !!params.varKeys.length },
  );

  useEffect(() => {
    if (hasSelections && !!fetchedData && !isPending && !serverError) {
      setData(fetchedData.data);
      setLayout(fetchedData.layout);
      updateColorscale(colorscale.current);
    } else {
      setData([]);
      setLayout({});
    }
  }, [fetchedData, hasSelections, isPending, serverError, updateColorscale]);

  useEffect(() => {
    colorscale.current = settings.controls.colorScale;
    updateColorscale(colorscale.current);
  }, [settings.controls.colorScale, updateColorscale]);

  const modeBarButtons = [
    _.compact([
      PlotlyModebarControls({ onClick: setShowControls }),
      ...PLOTLY_MODEBAR_BUTTONS,
    ]),
  ];

  if (!serverError) {
    if (hasSelections) {
      return (
        <div className="cherita-plot cherita-matrixplot position-relative">
          <div className="plotly-toolbar">
            <PlotlyToolbar
              setShowCategories={setShowCategories}
              setShowSearch={setShowSearch}
              isFullscreen={isFullscreen}
            />
          </div>
          {isPending && <LoadingSpinner />}
          <Plot
            data={data}
            layout={layout}
            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
            config={{
              displaylogo: false,
              modeBarButtons: modeBarButtons,
            }}
          />
        </div>
      );
    }
    return (
      <PlotAlert
        variant="info"
        heading="Set up your matrix plot"
        plotType={plotType}
        setPlotType={setPlotType}
      >
        <p className="p-0 m-0">
          Select a{' '}
          {showCategoriesBtn ? (
            <Button
              variant="link"
              className="border-0 p-0 align-baseline"
              onClick={setShowCategories}
            >
              category
            </Button>
          ) : (
            'category'
          )}{' '}
          to group observations, then choose one or more{' '}
          {showSearchBtn ? (
            <Button
              variant="link"
              className="border-0 p-0 align-baseline"
              onClick={setShowSearch}
            >
              features
            </Button>
          ) : (
            'features'
          )}{' '}
          to display the matrix plot.
        </p>
      </PlotAlert>
    );
  } else {
    return (
      <PlotAlert
        variant="danger"
        heading="Error displaying the matrix plot"
        plotType={plotType}
        setPlotType={setPlotType}
      >
        {serverError.message ||
          'An unexpected error occurred while generating the plot.'}
      </PlotAlert>
    );
  }
}
