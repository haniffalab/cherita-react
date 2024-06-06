import React, { useEffect, useState, useMemo } from "react";
import _ from "lodash";
import "bootstrap/dist/css/bootstrap.min.css";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import { EditableGeoJsonLayer } from "@nebula.gl/layers";
import { ViewMode } from "@nebula.gl/edit-modes";
import Dropdown from "react-bootstrap/Dropdown";

import { Toolbox } from "./Toolbox";
import { SpatialControls } from "./SpatialControls";
import { Legend } from "./Legend";
import { PLOTLY_COLORSCALES } from "../../constants/constants";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { MapHelper } from "../../helpers/map-helper";
import {
  GET_OPTIONS,
  useMultipleZarr,
  useZarr,
} from "../../helpers/zarr-helper";
import { useColor } from "../../helpers/color-helper";
import { LoadingSpinner } from "../../utils/LoadingSpinner";
import { useCallback } from "react";

window.deck.log.level = 1;

export function ScatterplotControls() {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();

  const colormapList = PLOTLY_COLORSCALES.map((item) => (
    <Dropdown.Item
      key={item}
      active={dataset.controls.colorScale === item}
      onClick={() => {
        dispatch({
          type: "set.controls.colorScale",
          colorScale: item,
        });
      }}
    >
      {item}
    </Dropdown.Item>
  ));

  return (
    <Dropdown>
      <Dropdown.Toggle id="dropdownColorscale" variant="light">
        {dataset.controls.colorScale}
      </Dropdown.Toggle>
      <Dropdown.Menu>{colormapList}</Dropdown.Menu>
    </Dropdown>
  );
}

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 0,
  maxZoom: 16,
  pitch: 0,
  bearing: 0,
};

export function Scatterplot({ radius = 30 }) {
  const dataset = useDataset();
  const { getScale, getScaleParams, getColor } = useColor();
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [features, setFeatures] = useState({
    type: "FeatureCollection",
    features: [],
  });
  const [mode, setMode] = useState(() => ViewMode);
  const [selectedFeatureIndexes, setSelectedFeatureIndexes] = useState([]);
  const [featureState, setFeatureState] = useState([]);
  const [scale, setScale] = useState(() => getScale());
  const [isRendering, setIsRendering] = useState(true);
  const [data, setData] = useState({
    ids: [],
    positions: [],
    values: [],
    sliceValues: [],
  });

  const [obsmParams, setObsmParams] = useState({
    url: dataset.url,
    path: "obsm/" + dataset.selectedObsm,
  });
  const [xParams, setXParams] = useState({
    url: dataset.url,
    path: "X",
  });
  const [obsParams, setObsParams] = useState({
    url: dataset.url,
    path:
      "obs/" +
      dataset.selectedObs?.name +
      (dataset.selectedObs?.type === "continuous" ? "" : "/codes"),
  });

  const [labelObsParams, setLabelObsParams] = useState([]);

  // needs to be wrapped in useMemo as it is an array an could cause an infinite loop otherwise
  const xSelection = useMemo(
    () => [null, dataset.selectedVar?.matrix_index],
    [dataset.selectedVar]
  );

  const obsmData = useZarr(obsmParams, null, GET_OPTIONS);
  const xData = useZarr(xParams, xSelection, GET_OPTIONS);
  const obsData = useZarr(obsParams, null, GET_OPTIONS);
  const labelObsData = useMultipleZarr(labelObsParams, GET_OPTIONS);

  useEffect(() => {
    setObsmParams((p) => {
      return {
        ...p,
        path: "obsm/" + dataset.selectedObsm,
      };
    });
  }, [dataset.selectedObsm]);

  useEffect(() => {
    setXParams((p) => {
      return {
        ...p,
        s: [null, dataset.selectedVar?.matrix_index],
      };
    });
  }, [dataset.selectedVar]);

  useEffect(() => {
    setObsParams((p) => {
      return {
        ...p,
        path:
          "obs/" +
          dataset.selectedObs?.name +
          (dataset.selectedObs?.type === "continuous" ? "" : "/codes"),
      };
    });
  }, [dataset.selectedObs]);

  useEffect(() => {
    setLabelObsParams(
      _.map(dataset.labelObs, (obs) => {
        return {
          url: dataset.url,
          path: "obs/" + obs.name + (obs.type === "continuous" ? "" : "/codes"),
          key: obs.name,
        };
      })
    );
  }, [dataset.labelObs, dataset.url]);

  useEffect(() => {
    setObsmParams((p) => {
      return {
        ...p,
        url: dataset.url,
      };
    });
    setXParams((p) => {
      return {
        ...p,
        url: dataset.url,
      };
    });
    setObsParams((p) => {
      return {
        ...p,
        url: dataset.url,
      };
    });
  }, [dataset.url]);

  // @TODO: assert length of obsmData, xData, obsData is equal

  useEffect(() => {
    if (!obsmData.isPending && !obsmData.serverError) {
      setIsRendering(true);
      setData((d) => {
        return { ...d, positions: obsmData.data };
      });
      const mapHelper = new MapHelper();
      const { latitude, longitude, zoom } = mapHelper.fitBounds(obsmData.data);
      setViewState((v) => {
        return {
          ...v,
          longitude: longitude,
          latitude: latitude,
          zoom: zoom,
        };
      });
    } else if (!obsmData.isPending && obsmData.serverError) {
      setIsRendering(true);
      setData((d) => {
        return { ...d, positions: [] };
      });
    }
  }, [
    dataset.selectedObsm,
    obsmData.data,
    obsmData.isPending,
    obsmData.serverError,
  ]);

  useEffect(() => {
    if (dataset.colorEncoding === "var") {
      setIsRendering(true);
      if (!xData.isPending && !xData.serverError) {
        // @TODO: add condition to check obs slicing
        setData((d) => {
          return { ...d, values: xData.data };
        });
      } else if (!xData.isPending && xData.serverError) {
        setScale(() => getScale());
        setData((d) => {
          return { ...d, values: [] };
        });
      }
    }
  }, [
    dataset.colorEncoding,
    xData.data,
    xData.isPending,
    xData.serverError,
    getScaleParams,
    getScale,
    getColor,
  ]);

  useEffect(() => {
    if (dataset.colorEncoding === "obs") {
      setIsRendering(true);
      if (!obsData.isPending && !obsData.serverError) {
        setData((d) => {
          return { ...d, values: obsData.data };
        });
      } else if (!obsData.isPending && obsData.serverError) {
        setScale(() => getScale());
        setData((d) => {
          return { ...d, values: [] };
        });
      }
    } else if (dataset.sliceByObs) {
      setIsRendering(true);
      if (!obsData.isPending && !obsData.serverError) {
        setData((d) => {
          return { ...d, sliceValues: obsData.data };
        });
      }
    }
  }, [
    dataset.colorEncoding,
    obsData.data,
    obsData.isPending,
    obsData.serverError,
    getScaleParams,
    getScale,
    dataset.selectedObs?.scaleParams,
    dataset.sliceByObs,
  ]);

  useEffect(() => {
    if (dataset.colorEncoding === "var") {
      if (!!dataset.sliceByObs && dataset.selectedObs?.omit?.length) {
        const filtered = _.filter(
          data.values,
          (v, i) => !_.includes(dataset.selectedObs?.omit, data.sliceValues[i])
        );
        setScale(() => getScale(getScaleParams({ values: filtered })));
      } else {
        setScale(() => getScale(getScaleParams({ values: data.values })));
      }
    } else {
      setScale(() => getScale(dataset.selectedObs?.scaleParams));
    }
  }, [
    data.values,
    data.sliceValues,
    dataset.sliceByObs,
    dataset.colorEncoding,
    dataset.selectedObs?.omit,
    getScale,
    getScaleParams,
    dataset.selectedObs?.scaleParams,
  ]);

  const getFillColor = useCallback(
    (d) => {
      if (dataset.colorEncoding === "obs") {
        const notInSlice = _.includes(
          dataset.selectedObs?.omit,
          data.values?.[d.index]
        );
        return getColor(scale, data.values?.[d.index], {
          alpha: notInSlice,
          gray: notInSlice,
        });
      } else if (dataset.colorEncoding === "var") {
        const notInSlice =
          !!dataset.sliceByObs &&
          _.includes(dataset.selectedObs?.omit, data.sliceValues?.[d.index]);
        return getColor(scale, data.values?.[d.index], {
          alpha: notInSlice,
          gray: notInSlice,
        });
      }
    },
    [
      data.sliceValues,
      data.values,
      dataset.colorEncoding,
      dataset.selectedObs?.omit,
      dataset.sliceByObs,
      getColor,
      scale,
    ]
  );

  const layers = useMemo(() => {
    return [
      new ScatterplotLayer({
        id: "cherita-layer-scatterplot",
        pickable: true,
        data: data.positions,
        radiusScale: radius,
        radiusMinPixels: 1,
        getPosition: (d) => d,
        getFillColor: (_i, d) => getFillColor(d),
        getRadius: 1,
        updateTriggers: {
          getFillColor: getFillColor,
        },
      }),
      new EditableGeoJsonLayer({
        id: "cherita-layer-draw",
        data: features,
        mode: mode,
        selectedFeatureIndexes,
        onEdit: ({ updatedData, editType, editContext }) => {
          setFeatures(updatedData);
          let updatedSelectedFeatureIndexes = selectedFeatureIndexes;
          setFeatureState({
            data: updatedData,
          });
          if (editType === "addFeature") {
            // when a drawing is complete, the value of editType becomes addFeature
            const { featureIndexes } = editContext; //extracting indexes of current features selected
            updatedSelectedFeatureIndexes = [
              ...selectedFeatureIndexes,
              ...featureIndexes,
            ];
          }
          setSelectedFeatureIndexes(updatedSelectedFeatureIndexes); //now update your state
        },
      }),
    ];
  }, [
    data.positions,
    features,
    getFillColor,
    mode,
    radius,
    selectedFeatureIndexes,
  ]);

  function onLayerClick(info) {
    if (mode !== ViewMode) {
      // don't change selection while editing
      return;
    }

    setSelectedFeatureIndexes(info.object ? [info.index] : []);
  }

  const getTooltip = ({ object, index }) =>
    object &&
    dataset.labelObs.length && {
      text: _.map(labelObsData, (v, k) => {
        const labelObs = _.find(dataset.labelObs, (o) => o.name === k);
        if (labelObs.type === "continuous") {
          return `${k}: ${v?.[index]}`;
        } else {
          return `${k}: ${labelObs.codesMap[v?.[index]]}`;
        }
      }).join("\n"),
    };

  // @TODO: add error message
  return (
    <div className="cherita-scatterplot">
      {(isRendering ||
        obsmData.isPending ||
        xData.isPending ||
        obsmData.isPending) && <LoadingSpinner />}
      <DeckGL
        viewState={viewState}
        onViewStateChange={(e) => setViewState(e.viewState)}
        controller
        layers={layers}
        onClick={onLayerClick}
        getTooltip={getTooltip}
        onAfterRender={() => {
          if (isRendering) {
            setIsRendering(false);
          }
        }}
        useDevicePixels={false}
      ></DeckGL>
      <SpatialControls
        mode={mode}
        setMode={setMode}
        features={mode}
        setFeatures={setFeatures}
      />
      {/* @TODO: add length of sliced to be displayed in Toolbox */}
      <Toolbox
        mode={
          dataset.colorEncoding === "var"
            ? dataset.selectedVar.name
            : dataset.colorEncoding === "obs"
            ? dataset.selectedObs.name
            : null
        }
        obsLength={parseInt(obsmData.data?.length)}
      />
      <Legend scale={scale} />
    </div>
  );
}
