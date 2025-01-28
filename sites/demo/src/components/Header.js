import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header>
      <Navbar bg="primary" data-bs-theme="dark">
        <Container fluid>
          <Navbar.Brand href="#home">Navbar</Navbar.Brand>
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
          </Nav>
        </Container>
      </Navbar>
    </header>
  );
}
