import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { faEye, faSliders } from '@fortawesome/free-solid-svg-icons';
import _ from 'lodash';
import { Alert } from 'react-bootstrap';
import Plot from 'react-plotly.js';

import {
  COLOR_ENCODINGS,
  OBS_TYPES,
  PSEUDOSPATIAL_PLOT_TYPES as PLOT_TYPES,
} from '../../constants/constants';
import { useDataset } from '../../context/DatasetContext';
import { useFilteredData } from '../../context/FilterContext';
import {
  useSettings,
  useSettingsDispatch,
} from '../../context/SettingsContext';
import { rgbToHex, useColor } from '../../helpers/color-helper';
import { ImageViewer } from '../../utils/ImageViewer';
import { Legend } from '../../utils/Legend';
import { LoadingSpinner } from '../../utils/LoadingIndicators';
import { useDebouncedFetch } from '../../utils/requests';
import { useSelectedObs, useSelectedVar } from '../../utils/Resolver';

function usePseudospatialData(plotType) {
  const ENDPOINT = 'pseudospatial';
  const dataset = useDataset();
  const settings = useSettings();
  const { obsIndices, isSliced } = useFilteredData();

  const selectedVar = useSelectedVar();
  const selectedObs = useSelectedObs();

  const baseParams = useMemo(() => {
    return {
      url: dataset.url,
      maskSet: settings.pseudospatial.maskSet,
      maskValues: settings.pseudospatial.maskValues,
      obsIndices: isSliced ? [...(obsIndices || [])] : null,
      varNamesCol: dataset.varNamesCol,
      showColorbar: false,
      format: 'json',
    };
  }, [
    dataset.url,
    settings.pseudospatial.maskSet,
    settings.pseudospatial.maskValues,
    dataset.varNamesCol,
    isSliced,
    obsIndices,
  ]);

  const getPlotParams = useCallback(() => {
    if (plotType === PLOT_TYPES.GENE) {
      return {
        varKey: selectedVar?.isSet
          ? {
              name: selectedVar?.name,
              indices: selectedVar?.vars.map((v) => v.index),
            }
          : selectedVar?.index,
        ...(settings.sliceBy.obs
          ? {
              obsCol: selectedObs,
              obsValues: !selectedObs?.omit.length
                ? null
                : _.difference(selectedObs?.values, selectedObs?.omit),
            }
          : {}),
      };
    } else if (plotType === PLOT_TYPES.CATEGORICAL) {
      return {
        obsCol: selectedObs,
        obsValues: !selectedObs?.omit.length
          ? null
          : _.difference(selectedObs?.values, selectedObs?.omit),
        mode: settings.pseudospatial.categoricalMode,
      };
    } else if (plotType === 'continuous') {
      return {
        obsCol: selectedObs,
        obsValues: !selectedObs?.omit.length
          ? null
          : _.difference(selectedObs?.values, selectedObs?.omit),
      };
    }
  }, [
    settings.pseudospatial.categoricalMode,
    selectedObs,
    selectedVar?.index,
    selectedVar?.isSet,
    selectedVar?.name,
    selectedVar?.vars,
    settings.sliceBy.obs,
    plotType,
  ]);

  const params = useMemo(() => {
    return { ...baseParams, ...getPlotParams() };
  }, [baseParams, getPlotParams]);

  return useDebouncedFetch(ENDPOINT + '/' + plotType, params, 500, {
    enabled: !!plotType && !!settings.pseudospatial.maskSet,
  });
}

export function Pseudospatial({
  showLegend = true,
  sharedScaleRange = false,
  height = 200,
  setShowControls,
  plotType,
  setPlotType,
}) {
  const { imageUrl } = useDataset();
  const settings = useSettings();
  const dispatch = useSettingsDispatch();
  const [data, setData] = useState([]);
  const [layout, setLayout] = useState({});
  const { getColor } = useColor();
  const colorscale = useRef(settings.controls.colorScale);
  const { valueMin, valueMax } = useFilteredData();

  const selectedObs = useSelectedObs();

  useEffect(() => {
    if (
      _.keys(settings.data.pseudospatial).length &&
      !settings.pseudospatial.maskSet
    ) {
      dispatch({
        type: 'set.pseudospatial.maskSet',
        maskSet: _.keys(settings.data.pseudospatial)[0],
      });
    }
  }, [dispatch, settings.data.pseudospatial, settings.pseudospatial.maskSet]);

  useEffect(() => {
    setPlotType(
      settings.colorEncoding === COLOR_ENCODINGS.VAR
        ? PLOT_TYPES.GENE
        : selectedObs?.type === OBS_TYPES.CATEGORICAL ||
            selectedObs?.type === OBS_TYPES.BOOLEAN
          ? PLOT_TYPES.CATEGORICAL
          : selectedObs?.type === OBS_TYPES.CONTINUOUS
            ? PLOT_TYPES.CONTINUOUS
            : PLOT_TYPES.MASKS,
    );
  }, [settings.colorEncoding, selectedObs?.type, setPlotType]);

  const updateColorscale = useCallback(
    (colorscale) => {
      setLayout((l) => {
        return { ...l, coloraxis: { ...l.coloraxis, colorscale: colorscale } };
      });

      setData((d) => {
        const min = layout?.coloraxis?.cmin;
        const max = layout?.coloraxis?.cmax;
        return _.map(d, (trace) => {
          const v = trace.meta.value;
          if (v === null) {
            return trace;
          }
          const color = rgbToHex(getColor({ value: (v - min) / (max - min) }));
          return {
            ...trace,
            fillcolor: color,
            line: { ...trace.line, color: color },
          };
        });
      });
    },
    [getColor, layout?.coloraxis?.cmax, layout?.coloraxis?.cmin],
  );

  const { fetchedData, isPending, serverError } =
    usePseudospatialData(plotType);

  useEffect(() => {
    if (!isPending && !serverError && fetchedData) {
      setData(fetchedData.data);
      setLayout(fetchedData.layout);
      updateColorscale(colorscale.current);
    }
  }, [fetchedData, isPending, serverError, sharedScaleRange, updateColorscale]);

  useEffect(() => {
    colorscale.current = settings.controls.colorScale;
    updateColorscale(colorscale.current);
  }, [settings.controls.colorScale, updateColorscale]);

  useEffect(() => {
    if (sharedScaleRange) {
      const { min, max } = {
        min: settings.controls.range[0] * (valueMax - valueMin) + valueMin,
        max: settings.controls.range[1] * (valueMax - valueMin) + valueMin,
      };

      setData((d) => {
        return _.map(d, (trace) => {
          const v = trace.meta.value;
          if (v === null) {
            return trace;
          }
          const color = rgbToHex(getColor({ value: (v - min) / (max - min) }));
          return {
            ...trace,
            fillcolor: color,
            line: { ...trace.line, color: color },
          };
        });
      });

      setLayout((l) => {
        return { ...l, coloraxis: { ...l.coloraxis, cmin: min, cmax: max } };
      });
    }
  }, [
    settings.controls.range,
    settings.controls.valueMax,
    settings.controls.valueMin,
    getColor,
    sharedScaleRange,
    valueMax,
    valueMin,
  ]);

  const hasSelections = !!plotType && !!settings.pseudospatial.maskSet;

  const images = useMemo(() => {
    if (imageUrl) {
      return [
        {
          source: imageUrl,
          xref: 'paper',
          yref: 'paper',
          x: 0.5,
          y: 0.5,
          sizex: 1,
          sizey: 1,
          sizing: 'contain',
          layer: 'above',
          xanchor: 'center',
          yanchor: 'middle',
          name: 'Reference Image',
          ...settings.pseudospatial.refImg,
        },
      ];
    }
    return [];
  }, [imageUrl, settings.pseudospatial.refImg]);

  const modeBarButtons = useMemo(() => {
    const isRefImgVisible = settings.pseudospatial?.refImg?.visible;

    return [
      {
        name: 'Open plot controls',
        icon: {
          width: 512,
          height: 512,
          path: faSliders.icon[4],
        },
        click: () => setShowControls((prev) => !prev),
      },
      ...(imageUrl
        ? [
            {
              name: isRefImgVisible
                ? 'Hide reference image'
                : 'Show reference image',
              icon: {
                width: 600,
                height: 512,
                path: faEye.icon[4],
              },
              click: () =>
                dispatch({
                  type: 'toggle.pseudospatial.refImg.visible',
                }),
            },
          ]
        : []),
    ];
  }, [
    dispatch,
    imageUrl,
    setShowControls,
    settings.pseudospatial?.refImg?.visible,
  ]);

  if (!_.keys(settings.data.pseudospatial).length) {
    return (
      <>
        <Alert variant="warning">No pseudospatial data</Alert>
      </>
    );
  } else if (!serverError) {
    return (
      <div className="cherita-pseudospatial">
        <>
          {hasSelections && isPending && <LoadingSpinner />}
          {hasSelections && (
            <Plot
              data={data}
              layout={{
                ...layout,
                autosize: true,
                height: height,
                margin: { l: 0, r: 0, t: 0, b: 0, pad: 0 },
                images: images,
              }}
              useResizeHandler={true}
              className="cherita-pseudospatial-plot"
              config={{
                displaylogo: false,
                displayModeBar: true,
                modeBarButtonsToAdd: modeBarButtons,
              }}
            />
          )}
          {hasSelections && showLegend && (
            <Legend
              min={layout?.coloraxis?.cmin}
              max={layout?.coloraxis?.cmax}
              addText={
                plotType === PLOT_TYPES.GENE
                  ? ' - Mean expression'
                  : plotType === PLOT_TYPES.CATEGORICAL
                    ? ' - %'
                    : plotType === PLOT_TYPES.CONTINUOUS
                      ? ' - Mean value'
                      : ''
              }
            />
          )}
        </>
      </div>
    );
  } else {
    return (
      <>
        <Alert variant="danger">{serverError.message}</Alert>
      </>
    );
  }
}

// @TODO: explore making it a minimap
export function PseudospatialImage() {
  const dataset = useDataset();

  if (dataset.imageUrl) {
    return (
      <ImageViewer src={dataset.imageUrl} alt="Pseudospatial reference image" />
    );
  } else {
    return <></>;
  }
}
