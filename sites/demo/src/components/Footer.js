import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

export default function Footer() {
  return (
    <footer>
      <Navbar bg="secondary" variant="dark">
        <Container fluid>
          <Navbar.Brand href="#">Footer</Navbar.Brand>
        </Container>
      </Navbar>
    </footer>
  );
}
