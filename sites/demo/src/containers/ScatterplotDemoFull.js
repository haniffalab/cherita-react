import { React, useRef, useState, useLayoutEffect } from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Card from "react-bootstrap/Card";

import {
  DatasetProvider,
  Scatterplot,
  ScatterplotControls,
  SELECTION_MODES,
  OffcanvasObs,
  OffcanvasObsm,
  OffcanvasVars,
  OffcanvasControls,
  OffcanvasInfo,
  ObsColsList,
  VarNamesList,
  SearchBar,
} from "@haniffalab/cherita-react";

export default function ScatterplotDemo(props) {
  const targetRef = useRef();

  const [showObs, setShowObs] = useState(false);
  const [showObsm, setShowObsm] = useState(false);
  const [showVars, setShowVars] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const handleCloseObs = () => setShowObs(false);
  const handleShowObs = () => setShowObs(true);
  const handleCloseObsm = () => setShowObsm(false);
  const handleShowObsm = () => setShowObsm(true);
  const handleCloseVars = () => setShowVars(false);
  const handleShowVars = () => setShowVars(true);
  const handleCloseControls = () => setShowControls(false);
  const handleShowControls = () => setShowControls(true);
  const handleCloseInfo = () => setShowInfo(false);
  const handleShowInfo = () => setShowInfo(true);

  useLayoutEffect(() => {
    function updateDimensions() {
      if (targetRef.current) {
        setDimensions({
          width: targetRef.current.offsetWidth,
          height: window.innerHeight - targetRef.current.offsetTop,
        });
      }
    }
    window.addEventListener("resize", updateDimensions);
    updateDimensions();
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <Container
      ref={targetRef}
      fluid
      className="cherita-app"
      style={{ height: dimensions.height }}
    >
      <DatasetProvider {...props}>
        <Row className="g-0">
          <Col
            xs={0}
            lg={4}
            xl={3}
            xxl={3}
            className="cherita-app-obs d-none d-lg-block"
          >
            <ObsColsList />
          </Col>
          <Col xs={12} lg={8} xl={6} xxl={6} class="cherita-app-plot">
            <div className="position-relative">
              <Navbar
                expand="sm"
                bg="primary"
                className="cherita-navbar d-block d-xl-none"
              >
                <Container fluid>
                  <Navbar.Toggle aria-controls="navbarScroll" />
                  <Navbar.Collapse id="navbarScroll">
                    <Nav className="me-auto my-0" navbarScroll>
                      <Nav.Item className="d-block d-lg-none">
                        <Nav.Link onClick={handleShowObs}>Categories</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link onClick={handleShowVars}>Features</Nav.Link>
                      </Nav.Item>
                    </Nav>
                    <Nav className="d-flex">
                      <Nav.Item>
                        <Nav.Link onClick={handleShowControls}>
                          Controls
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link onClick={handleShowInfo}>Info</Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Navbar.Collapse>
                </Container>
              </Navbar>
            </div>
            <div className="cherita-container-scatterplot">
              <Scatterplot />
            </div>
          </Col>
          <Col
            lg={0}
            xl={3}
            xxl={3}
            className="cherita-app-var d-none d-lg-block"
          >
            <Card className="cherita-app-features d-none d-xl-block">
              <Card.Body>
                <SearchBar />
                <VarNamesList mode={SELECTION_MODES.SINGLE} />
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <OffcanvasObs show={showObs} handleClose={handleCloseObs} />
            <OffcanvasObsm show={showObsm} handleClose={handleCloseObsm} />
            <OffcanvasVars
              show={showVars}
              handleClose={handleCloseVars}
              mode={SELECTION_MODES.SINGLE}
            />
            <OffcanvasControls
              show={showControls}
              handleClose={handleCloseControls}
              Controls={ScatterplotControls}
            />
            <OffcanvasInfo show={showInfo} handleClose={handleCloseInfo} />
          </Col>
        </Row>
      </DatasetProvider>
    </Container>
  );
}
