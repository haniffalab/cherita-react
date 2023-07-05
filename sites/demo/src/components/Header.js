import { Link } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

export default function Header() {
    return (
        <header>
            <Navbar bg="primary" data-bs-theme="dark">
                <Container fluid>
                    <Navbar.Brand href="#home">Navbar</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="heatmap">Heatmap</Nav.Link>
                        <Nav.Link as={Link} to="scatterplot">Scatterplot</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
        </header>
    );
}
