import { React, useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import {
    DatasetProvider,
    ObsColsList,
    VarNamesList,
    Heatmap,
    Scatterplot,
    ScatterplotControls,

    Dotplot,
    Matrixplot,
    Violin,
    SELECTION_MODES,
    VIOLIN_MODES,
} from "@haniffalab/cherita-react";

export default function ScatterplotDemo({ dataset_url }) {
    const [height, setHeight] = useState(0)
    const ref = useRef(null)

    useEffect(() => {
        setHeight(ref.current.clientHeight)
        document.documentElement.style.setProperty('--dropdown-height', (ref.current.clientHeight - 100) + "px");
    })

    return (
        <Container>
            <div className="cherita-container" ref={ref}>
                <DatasetProvider dataset_url={dataset_url}>
                    <div class="sidenav">
                        <a href="#">About</a>
                        <a href="#">Services</a>s
                        <ObsColsList />
                    </div>
                    <div class="main">
                        <Navbar expand="lg" bg="primary" className="cherita-navbar">
                            <Container fluid>
                                <Navbar.Toggle aria-controls="navbarScroll" />
                                <Navbar.Collapse id="navbarScroll">
                                    <Nav
                                        className="me-auto my-2 my-lg-0"
                                        style={{ maxHeight: '100px' }}
                                        navbarScroll
                                    >
                                        <Nav.Link href="#action1">Home</Nav.Link>
                                        <NavDropdown title="Obs" id="basic-nav-dropdown" data-bs-theme="dark">
                                            <ObsColsList />
                                        </NavDropdown>
                                        <NavDropdown title="Features" id="basic-nav-dropdown" data-bs-theme="dark">
                                            <VarNamesList />
                                        </NavDropdown>
                                    </Nav>
                                    <Form className="d-flex">
                                        <ScatterplotControls />
                                    </Form>
                                </Navbar.Collapse>
                            </Container>
                        </Navbar>
                        <div className="row h-50">
                            <Scatterplot />
                        </div>
                    </div>
                </DatasetProvider>
            </div>
        </Container>

    );
}
