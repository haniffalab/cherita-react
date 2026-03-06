import { useState } from 'react';

import { PLOT_TYPES } from '../../constants/constants';
import { useDataset } from '../../context/DatasetContext';
import { StyledTooltip } from '../../utils/StyledTooltip';
import DotPlotIcon from '../icons/DotPlotIcon';
import HeatmapIcon from '../icons/HeatmapIcon';
import MatrixPlotIcon from '../icons/MatrixPlotIcon';
import ScatterplotIcon from '../icons/ScatterplotIcon';
import ViolinPlotIcon from '../icons/ViolinPlotIcon';

const plotTypes = [
  {
    type: PLOT_TYPES.SCATTERPLOT,
    icon: ScatterplotIcon,
    name: 'Scatterplot',
    description: ({ obsLabel }) =>
      `Displays ${obsLabel.plural} in 2D based on dimensionality reduction.`,
  },
  {
    type: PLOT_TYPES.MATRIXPLOT,
    icon: MatrixPlotIcon,
    name: 'Matrix Plot',
    description: ({ varLabel, valueLabel }) =>
      `Shows ${valueLabel.singular} values of ${varLabel.plural} across categories.`,
  },
  {
    type: PLOT_TYPES.DOTPLOT,
    icon: DotPlotIcon,
    name: 'Dot Plot',
    description: ({ varLabel, valueLabel }) =>
      `Shows proportion and ${valueLabel.singular} of ${varLabel.plural} across groups.`,
  },
  {
    type: PLOT_TYPES.HEATMAP,
    icon: HeatmapIcon,
    name: 'Heatmap',
    description: ({ varLabel, valueLabel }) =>
      `Visualises ${valueLabel.singular} of ${varLabel.plural} as a colour-coded matrix.`,
  },
  {
    type: PLOT_TYPES.VIOLINPLOT,
    icon: ViolinPlotIcon,
    name: 'Violin Plot',
    description: ({ varLabel, valueLabel }) =>
      `Displays distribution of ${valueLabel.singular} across ${varLabel.plural}.`,
  },
];

export function PlotTypeSelector({ currentType, onChange }) {
  const { obsLabel, varLabel, valueLabel } = useDataset();
  const [hoveredMap, setHoveredMap] = useState({});

  const handleMouseEnter = (type) =>
    setHoveredMap((prev) => ({ ...prev, [type]: true }));
  const handleMouseLeave = (type) =>
    setHoveredMap((prev) => ({ ...prev, [type]: false }));

  return (
    <div className="d-flex gap-2 justify-content-between">
      {plotTypes.map(({ type, icon: Icon, name, description }) => {
        const isActive = currentType === type;
        const hovered = hoveredMap[type] || false;

        const colour = isActive ? '#005a86' : hovered ? '#0071a7' : '#000';

        return (
          <StyledTooltip
            key={type}
            title={
              <>
                <strong>{name}</strong>
                <br />
                {description({ obsLabel, varLabel, valueLabel })}
              </>
            }
            placement="bottom"
            slotProps={{
              popper: {
                modifiers: [{ name: 'offset', options: { offset: [0, -12] } }],
              },
            }}
          >
            <div
              onMouseEnter={() => handleMouseEnter(type)}
              onMouseLeave={() => handleMouseLeave(type)}
              onClick={() => onChange(type)}
              className={`plotselector-icon${isActive ? ' active' : ''}`}
            >
              <Icon size={34} colour={colour} />
            </div>
          </StyledTooltip>
        );
      })}
    </div>
  );
}
