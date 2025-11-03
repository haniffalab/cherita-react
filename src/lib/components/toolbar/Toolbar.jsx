import { faList, faSearch, faSliders } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Container, Nav, Navbar } from 'react-bootstrap';

export const Toolbar = ({
  showObsBtn = true,
  showVarsBtn = true,
  showCtrlsBtn = true,
  setShowObs,
  setShowVars,
  setShowControls,
}) => {
  return (
    <Navbar expand="md" bg="primary" variant="dark" className="cherita-navbar">
      <Container fluid>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav navbarScroll>
            {showObsBtn && (
              <Nav.Item className="me-2">
                <Nav.Link onClick={() => setShowObs(true)}>
                  <FontAwesomeIcon icon={faList} className="me-2" />
                  Explore Categories
                </Nav.Link>
              </Nav.Item>
            )}
            {showVarsBtn && (
              <Nav.Item className="me-2">
                <Nav.Link onClick={() => setShowVars(true)}>
                  <FontAwesomeIcon icon={faSearch} className="me-2" />
                  Search Genes
                </Nav.Link>
              </Nav.Item>
            )}
            {showCtrlsBtn && (
              <Nav.Item className="me-2">
                <Nav.Link onClick={() => setShowControls(true)}>
                  <FontAwesomeIcon icon={faSliders} className="me-2" />
                  Controls
                </Nav.Link>
              </Nav.Item>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export const ObsPlotlyToolbar = ({ onClick }) => {
  return {
    name: 'Categories',
    icon: {
      width: 512,
      height: 512,
      path: faList.icon[4],
    },
    click: onClick,
  };
};

export const VarPlotlyToolbar = ({ onClick }) => {
  return {
    name: 'Features',
    icon: {
      width: 512,
      height: 512,
      path: faSearch.icon[4],
    },
    click: onClick,
  };
};

export const ControlsPlotlyToolbar = ({ onClick }) => {
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
