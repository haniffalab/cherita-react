import { faList, faSearch, faSliders } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Container, Nav, Navbar, Button, ButtonGroup } from 'react-bootstrap';

import usePlotVisibility from '../../hooks/usePlotVisibility';

export const Toolbar = ({
  setShowCategories,
  setShowSearch,
  setShowControls,
  Fullscreen,
}) => {
  const { showCategoriesBtn, showSearchBtn } = usePlotVisibility(isFullscreen);
  return (
    <Navbar expand="md" bg="primary" variant="dark" className="cherita-navbar">
      <Container fluid>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav navbarScroll>
            {showCategoriesBtn && (
              <Nav.Item className="me-2">
                <Nav.Link onClick={() => setShowCategories(true)}>
                  <FontAwesomeIcon icon={faList} className="me-2" />
                  Explore Categories
                </Nav.Link>
              </Nav.Item>
            )}
            {showSearchBtn && (
              <Nav.Item className="me-2">
                <Nav.Link onClick={() => setShowSearch(true)}>
                  <FontAwesomeIcon icon={faSearch} className="me-2" />
                  Search Genes
                </Nav.Link>
              </Nav.Item>
            )}
            <Nav.Item className="me-2">
              <Nav.Link onClick={() => setShowControls(true)}>
                <FontAwesomeIcon icon={faSliders} className="me-2" />
                Controls
              </Nav.Link>
            </Nav.Item>{' '}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export const PlotlyToolbar = ({
  setShowCategories,
  setShowSearch,
  isFullscreen,
}) => {
  const { showCategoriesBtn, showSearchBtn } = usePlotVisibility(isFullscreen);
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
          title="Search Genes"
        >
          <FontAwesomeIcon icon={faSearch} className="me-1" />
          Genes
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
