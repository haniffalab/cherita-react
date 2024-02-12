import "bootstrap/dist/css/bootstrap.min.css";
import Dropdown from "react-bootstrap/Dropdown";
import { React, useCallback, useEffect, useState } from "react";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import _ from "lodash";
import { ColorHelper } from "../../helpers/color";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { EditableGeoJsonLayer } from "@nebula.gl/layers";
import chroma from "chroma-js";
import Tooltip from "react-bootstrap/Tooltip";
import {
  PLOTLY_COLORSCALES,
  CHROMA_COLORSCALES,
} from "../../constants/constants";

import {
  DrawPolygonMode,
  DrawLineStringMode,
  DrawPolygonByDraggingMode,
  DrawRectangleMode,
  ViewMode,
  ModifyMode,
} from "@nebula.gl/edit-modes";

import Button from "react-bootstrap/Button";
import DropdownButton from "react-bootstrap/DropdownButton";
import ButtonGroup from "react-bootstrap/ButtonGroup";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowPointer } from "@fortawesome/free-solid-svg-icons";

export function Legend({ values }) {
  const dataset = useDataset();
  const colorHelper = new ColorHelper();

  if (dataset.colorEncoding === "var") {
    let c = colorHelper.getScale(dataset, values);
    var dom = c.domain ? c.domain() : [0, 1],
      dmin = Math.min(dom[0], dom[dom.length - 1]),
      dmax = Math.max(dom[dom.length - 1], dom[0]);

    let legendList = [];

    for (var i = 0; i <= 100; i++) {
      var color = c(dmin + (i / 100) * (dmax - dmin));
      //console.log(color.hex());
      legendList.push(
        <span
          className="grad-step"
          style={{ backgroundColor: color.hex() }}
        ></span>
      );
    }

    return (
      <div className="cherita-legend">
        <div className="gradient">
          {legendList}
          <span className="domain-min">{dmin}</span>
          <span className="domain-med">{(dmin + dmax) * 0.5}</span>
          <span className="domain-max">{dmax}</span>
        </div>
      </div>
    );
  }

  return <></>;
}
