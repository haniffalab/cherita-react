import React from "react";

import dotplotIcon from "../../../assets/images/plots/dotplot.svg";
import heatmapIcon from "../../../assets/images/plots/heatmap.svg";
import matrixplotIcon from "../../../assets/images/plots/matrixplot.svg";
import scatterplotIcon from "../../../assets/images/plots/scatterplot.svg";
import violinIcon from "../../../assets/images/plots/violin.svg";

const iconMap = {
  dotplot: dotplotIcon,
  matrixplot: matrixplotIcon,
  violin: violinIcon,
  scatterplot: scatterplotIcon,
  heatmap: heatmapIcon,
};

const plotTypes = Object.entries(iconMap).map(([type, icon]) => ({
  type,
  icon,
  alt: type.charAt(0).toUpperCase() + type.slice(1),
}));

export function PlotTypeSelector({ currentType, onChange }) {
  return (
    <div className="d-flex gap-2">
      {plotTypes.map(({ type, icon, alt }) => (
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
        />
      ))}
    </div>
  );
}
