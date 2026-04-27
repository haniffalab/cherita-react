import { faList, faSearch, faSliders } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import _ from 'lodash';
import { Container, Nav, Navbar, Button, ButtonGroup } from 'react-bootstrap';

import { useDataset } from '../../context/DatasetContext';
import usePlotVisibility from '../../utils/usePlotVisibility';

export const PlotlyToolbar = ({
  setShowCategories,
  setShowSearch,
  isFullscreen,
}) => {
  const { showCategoriesBtn, showSearchBtn } = usePlotVisibility(isFullscreen);
  const dataset = useDataset();
  return (
    <ButtonGroup>
      {showCategoriesBtn && (
        <Button
          variant="primary"
          onClick={() => setShowCategories(true)}
          title="Explore Categories"
        >
          <FontAwesomeIcon icon={faList} className="me-1" />
          Categories
        </Button>
      )}
      {showSearchBtn && (
        <Button
          variant="primary"
          onClick={() => setShowSearch(true)}
          title={`Search ${dataset.varLabel.plural}`}
        >
          <FontAwesomeIcon icon={faSearch} className="me-1" />
          {_.capitalize(dataset.varLabel.plural)}
        </Button>
      )}
    </ButtonGroup>
  );
};

export const PlotlyModebarControls = ({ onClick }) => {
  return {
    name: 'Controls',
    icon: {
      width: 512,
      height: 512,
      path: faSliders.icon[4],
    },
    click: onClick,
  };
};
