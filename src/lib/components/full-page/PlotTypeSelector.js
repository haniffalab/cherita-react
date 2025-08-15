import React from "react";

import { OverlayTrigger, Tooltip } from "react-bootstrap";

import dotplotIcon from "../../../assets/images/plots/dotplot.svg";
import heatmapIcon from "../../../assets/images/plots/heatmap.svg";
import matrixplotIcon from "../../../assets/images/plots/matrixplot.svg";
import scatterplotIcon from "../../../assets/images/plots/scatterplot.svg";
import violinIcon from "../../../assets/images/plots/violin.svg";
import { PLOT_TYPES } from "../../constants/constants";

const iconMap = {
  [PLOT_TYPES.SCATTERPLOT]: scatterplotIcon,
  [PLOT_TYPES.MATRIXPLOT]: matrixplotIcon,
  [PLOT_TYPES.HEATMAP]: heatmapIcon,
  [PLOT_TYPES.DOTPLOT]: dotplotIcon,
  [PLOT_TYPES.VIOLINPLOT]: violinIcon,
};

const plotTypes = Object.entries(iconMap).map(([type, icon]) => ({
  type,
  icon,
  alt: type.charAt(0).toUpperCase() + type.slice(1),
}));

export function PlotTypeSelector({ currentType, onChange }) {
  return (
    <div className="d-flex gap-2 justify-content-between">
      {plotTypes.map(({ type, icon, alt }) => (
        <OverlayTrigger
          placement="auto"
          overlay={<Tooltip id={`tooltip-${alt}`}>{alt}</Tooltip>}
        >
          <img
            key={type}
            src={icon}
            alt={alt}
            height={32}
            width={32}
            className={`plotselector-icon${currentType === type ? " active" : ""}`}
            onClick={() => onChange(type)}
            style={{
              borderBottom: currentType === type ? "2px solid #007bff" : "none",
            }}
            title={alt}
          />
        </OverlayTrigger>
      ))}
    </div>
  );
}
