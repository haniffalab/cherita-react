import { React, useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import setPosition from "../helpers/nav";

import {
    DatasetProvider,
    ObsColsList,
    VarNamesList,
    Dotplot,
    DotplotControls,
    SELECTION_MODES
} from "@haniffalab/cherita-react";

export default function DotplotDemo({ dataset_url }) {
    return (
        <Container>
            <div className="cherita-container">
                <DatasetProvider dataset_url={dataset_url}>
                    <Navbar expand="lg" bg="primary" className="cherita-navbar">
                        <Container fluid>
                            <Navbar.Toggle aria-controls="navbarScroll" />
                            <Navbar.Collapse id="navbarScroll">
                                <Nav
                                    className="me-auto my-2 my-lg-0"
                                    navbarScroll
                                >
                                    <NavDropdown title="Obs" id="basic-nav-dropdown1" onClick={setPosition} data-bs-theme="dark" className="cherita-navbar-item" renderMenuOnMount>
                                        <ObsColsList />
                                    </NavDropdown>
                                    <NavDropdown title="Features" id="basic-nav-dropdown2" onClick={setPosition} data-bs-theme="dark" className="cherita-navbar-item" renderMenuOnMount>
                                        <VarNamesList mode={SELECTION_MODES.MULTIPLE} />
                                    </NavDropdown>
                                </Nav>
                                <Nav
                                    className="d-flex"
                                >
                                    <NavDropdown title="Controls" id="basic-nav-dropdown3" onClick={setPosition} data-bs-theme="dark" align="end" className="cherita-navbar-item" renderMenuOnMount>
                                        <DotplotControls />
                                    </NavDropdown>
                                </Nav>
                            </Navbar.Collapse>
                        </Container>
                    </Navbar>
                    <div className="cherita-container-plot">
                        <Dotplot />
                    </div>
                </DatasetProvider>
            </div>
        </Container >
    );
}
