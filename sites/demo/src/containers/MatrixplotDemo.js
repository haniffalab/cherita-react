import { React, useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

import {
    DatasetProvider,
    ObsColsList,
    VarNamesList,
    Matrixplot,
    MatrixplotControls,
    SELECTION_MODES,
} from "@haniffalab/cherita-react";

export default function MatrixplotDemo({ dataset_url }) {
    const [boundingBox, setBoundingBox] = useState(0)
    const [height, setHeight] = useState(0)
    const ref = useRef(null)

    useEffect(() => {
        console.log(ref.current.getBoundingClientRect())
        setHeight(ref.current.clientHeight)
        setBoundingBox(ref.current.getBoundingClientRect())
    }, []);

    const callbackFunc = (e) => {
        const dropdown = e.target.nextElementSibling
        const navbar = e.target.closest(".navbar");

        const navbarBoundingBox = navbar.getBoundingClientRect()
        const parentBoundingBox = e.target.getBoundingClientRect()
        console.log(navbarBoundingBox);

        const top = navbarBoundingBox.top + navbarBoundingBox.height - parentBoundingBox.top
        const left = navbarBoundingBox.left - parentBoundingBox.left
        const right = navbarBoundingBox.right - parentBoundingBox.right

        dropdown.style.position = "absolute"
        dropdown.style.top = top + "px"

        if (dropdown.classList.contains("dropdown-menu-end")) {
            console.log(right)

            dropdown.style.right = right * -1 + "px"
        }
        else {
            dropdown.style.left = left + "px"
        }

        document.documentElement.style.setProperty('--dropdown-height', (height - navbarBoundingBox.height - 40) + "px");

    }

    return (
        <Container>
            <div className="cherita-container" ref={ref}>
                <DatasetProvider dataset_url={dataset_url}>
                    <Navbar expand="lg" bg="primary" className="cherita-navbar">
                        <Container fluid>
                            <Navbar.Toggle aria-controls="navbarScroll" />
                            <Navbar.Collapse id="navbarScroll">
                                <Nav
                                    className="me-auto my-2 my-lg-0"
                                    navbarScroll
                                >
                                    <NavDropdown title="Obs" id="basic-nav-dropdown1" onClick={callbackFunc} data-bs-theme="dark" renderMenuOnMount>
                                        <ObsColsList />
                                    </NavDropdown>
                                    <NavDropdown title="Features" id="basic-nav-dropdown2" onClick={callbackFunc} data-bs-theme="dark" renderMenuOnMount>
                                        <VarNamesList mode={SELECTION_MODES.MULTIPLE} />
                                    </NavDropdown>
                                </Nav>
                                <Nav
                                    className="d-flex"
                                >
                                    <NavDropdown title="Controls" id="basic-nav-dropdown3" onClick={callbackFunc} data-bs-theme="dark" align="end" renderMenuOnMount>
                                        <MatrixplotControls />
                                    </NavDropdown>
                                </Nav>
                            </Navbar.Collapse>
                        </Container>
                    </Navbar>
                    <div className="cherita-container-plot">
                        <Matrixplot />
                    </div>
                </DatasetProvider>
            </div>
        </Container >
    );
}
