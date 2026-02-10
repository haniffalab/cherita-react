import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link } from 'react-router-dom';
export default function Header() {
  return (
    <header>
      <Navbar bg="primary" variant="dark">
        <Container fluid>
          <Navbar.Brand href="#">Demo</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            <NavDropdown
              title="ObservationFeature"
              id="observation-feature-dropdown"
            >
              <NavDropdown.Header>Standard View</NavDropdown.Header>
              <NavDropdown.Item
                as={Link}
                to="observation-feature/standard-view/dotplot"
              >
                Dotplot
              </NavDropdown.Item>
              <NavDropdown.Item
                as={Link}
                to="observation-feature/standard-view/heatmap"
              >
                Heatmap
              </NavDropdown.Item>
              <NavDropdown.Item
                as={Link}
                to="observation-feature/standard-view/matrixplot"
              >
                Matrixplot
              </NavDropdown.Item>
              <NavDropdown.Item
                as={Link}
                to="observation-feature/standard-view/scatterplot"
              >
                Scatterplot
              </NavDropdown.Item>
              <NavDropdown.Item
                as={Link}
                to="observation-feature/standard-view/violin"
              >
                Violin
              </NavDropdown.Item>
              <NavDropdown.Header>Split View</NavDropdown.Header>
              <NavDropdown.Item as={Link} to="observation-feature/split-view">
                Split View
              </NavDropdown.Item>
              <NavDropdown.Header>Embedded Plots</NavDropdown.Header>
              <NavDropdown.Item
                as={Link}
                to="observation-feature/embedded-plot/dotplot"
              >
                Dotplot
              </NavDropdown.Item>
              <NavDropdown.Item
                as={Link}
                to="observation-feature/embedded-plot/heatmap"
              >
                Heatmap
              </NavDropdown.Item>
              <NavDropdown.Item
                as={Link}
                to="observation-feature/embedded-plot/matrixplot"
              >
                Matrixplot
              </NavDropdown.Item>
              <NavDropdown.Item
                as={Link}
                to="observation-feature/embedded-plot/scatterplot"
              >
                Scatterplot
              </NavDropdown.Item>
              <NavDropdown.Item
                as={Link}
                to="observation-feature/embedded-plot/violin"
              >
                Violin
              </NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="PerturbationMap" id="perturbation-map-dropdown">
              <NavDropdown.Header>Standard Views</NavDropdown.Header>
              <NavDropdown.Item as={Link} to="perturbation-map/standard-view">
                StandardView
              </NavDropdown.Item>
              <NavDropdown.Header>Embedded Plots</NavDropdown.Header>
              <NavDropdown.Item as={Link} to="perturbation-map/embedded-plot">
                EmbeddedPlot
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Container>
      </Navbar>
    </header>
  );
}
