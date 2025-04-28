import React, { useEffect, useRef, useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import _ from "lodash";
import { Button, Form, FormGroup, InputGroup, Modal } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

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
      <Modal show={isModalOpen} onHide={handleClose} size="lg">
        <Modal.Body>
          <Container>
            <Row>
              <Col xs={12}>
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <FormGroup>
                    <div className="d-flex align-items-center my-3">
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
                      </InputGroup>

                      <Button
                        variant="outline-secondary"
                        onClick={handleClose}
                        className="ms-2"
                      >
                        <CloseIcon />
                      </Button>
                    </div>
                  </FormGroup>
                </Form>
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={6}>
                {searchVar && (
                  <VarSearchResults
                    text={text}
                    setShowSuggestions={setShowSuggestions}
                    handleSelect={handleSelect}
                  />
                )}
              </Col>
              <Col xs={12} md={6}>
                {searchDiseases && (
                  <DiseasesSearchResults
                    text={text}
                    setShowSuggestions={setShowSuggestions}
                  />
                )}
              </Col>
            </Row>
          </Container>
        </Modal.Body>
      </Modal>
    </div>
  );
}
