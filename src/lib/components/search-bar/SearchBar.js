import React, { useEffect, useRef, useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import _ from "lodash";
import { Button, Form, FormGroup, InputGroup, Modal } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Row from "react-bootstrap/Row";
import Tab from "react-bootstrap/Tab";

import { DiseasesSearchResults, VarSearchResults } from "./SearchResults";

function onVarSelect(dispatch, item) {
  dispatch({
    type: "select.var",
    var: item,
  });
  dispatch({
    type: "select.multivar",
    var: item,
  });
  dispatch({
    type: "set.colorEncoding",
    value: "var",
  });
}

export function SearchBar({
  searchVar = true,
  searchDiseases = false,
  handleSelect = onVarSelect,
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [text, setText] = useState("");
  const inputRef = useRef(null);
  const displayText = [
    ...(searchVar ? ["features"] : []),
    ...(searchDiseases ? ["diseases"] : []),
  ].join(" and ");

  useEffect(() => {
    if (text.length > 0) {
      setShowSuggestions(true);
    }
  }, [text]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInputClick = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  //@TODO: Abstract styles
  return (
    <div>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <FormGroup>
          <InputGroup>
            <Form.Control
              onClick={handleInputClick}
              type="text"
              placeholder={"Search " + displayText}
              value={text}
              style={{
                paddingLeft: "2.5rem",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                zIndex: 10,
              }}
            >
              <SearchIcon />
            </div>
          </InputGroup>
        </FormGroup>
      </Form>
      <Modal show={isModalOpen} onHide={handleClose} size="xl">
        <Modal.Header className="bg-primary">
          <Container className="gx-0">
            <Row>
              <Col xs={12}>
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <FormGroup>
                    <div className="d-flex align-items-center">
                      <InputGroup>
                        <Form.Control
                          ref={inputRef}
                          autoFocus
                          onFocus={() => {
                            setShowSuggestions(text.length > 0);
                          }}
                          onBlur={() => {
                            _.delay(() => {
                              setShowSuggestions(false);
                            }, 150);
                          }}
                          type="text"
                          placeholder={"Search " + displayText}
                          value={text}
                          onChange={(e) => {
                            setText(e.target.value);
                          }}
                          style={{
                            paddingLeft: "2.5rem",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            left: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                            zIndex: 10,
                          }}
                        >
                          <SearchIcon />
                        </div>
                        <Button variant="light" onClick={handleClose}>
                          <CloseIcon />
                        </Button>
                      </InputGroup>
                    </div>
                  </FormGroup>
                </Form>
              </Col>
            </Row>
          </Container>
        </Modal.Header>
        <Modal.Body className="p-0">
          <Container>
            <Row>
              <Col xs={12} md={8}>
                <Tab.Container defaultActiveKey="first">
                  <Row>
                    <Col sm={3} className="py-3 border-end">
                      <Nav variant="pills" className="flex-column">
                        {searchVar && (
                          <Nav.Item>
                            <Nav.Link eventKey="first">Genes (0)</Nav.Link>
                          </Nav.Item>
                        )}
                        {searchDiseases && (
                          <Nav.Item>
                            <Nav.Link eventKey="second">Diseases (0)</Nav.Link>
                          </Nav.Item>
                        )}
                      </Nav>
                    </Col>
                    <Col sm={9} className="py-3">
                      <Tab.Content>
                        {searchVar && (
                          <Tab.Pane eventKey="first">
                            <VarSearchResults
                              text={text}
                              setShowSuggestions={setShowSuggestions}
                              handleSelect={handleSelect}
                              setSelectedResult={setSelectedResult}
                            />
                          </Tab.Pane>
                        )}
                        {searchDiseases && (
                          <Tab.Pane eventKey="second">
                            <DiseasesSearchResults
                              text={text}
                              setShowSuggestions={setShowSuggestions}
                              setSelectedResult={setSelectedResult}
                            />
                          </Tab.Pane>
                        )}
                      </Tab.Content>
                    </Col>
                  </Row>
                </Tab.Container>
              </Col>
              <Col
                xs={12}
                md={4}
                className="bg-light p-3"
                style={{
                  position: "sticky",
                  top: 0,
                  height: "100vh",
                  overflowY: "auto",
                  borderLeft: "1px solid #dee2e6",
                }}
              >
                {selectedResult ? (
                  <div>
                    <h5>Selected Result</h5>
                    <pre>{JSON.stringify(selectedResult, null, 2)}</pre>
                  </div>
                ) : (
                  <div className="text-muted">No result selected</div>
                )}
              </Col>
            </Row>
          </Container>
        </Modal.Body>
      </Modal>
    </div>
  );
}
