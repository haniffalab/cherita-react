import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link } from "react-router-dom";
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
            <Nav.Link as={Link} to="dotplot">
              Dotplot
            </Nav.Link>
            <Nav.Link as={Link} to="heatmap">
              Heatmap
            </Nav.Link>
            <Nav.Link as={Link} to="matrixplot">
              Matrixplot
            </Nav.Link>
            <Nav.Link as={Link} to="scatterplot">
              Scatterplot
            </Nav.Link>
            <Nav.Link as={Link} to="violin">
              Violin
            </Nav.Link>
            <NavDropdown title="Full Page" id="full-page-dropdown">
              <NavDropdown.Item as={Link} to="full-page/dotplot">
                Dotplot
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="full-page/heatmap">
                Heatmap
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="full-page/matrixplot">
                Matrixplot
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="full-page/scatterplot">
                Scatterplot
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="full-page/violin">
                Violin
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Container>
      </Navbar>
    </header>
  );
}
