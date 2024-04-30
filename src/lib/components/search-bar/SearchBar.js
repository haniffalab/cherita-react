import React, { useEffect, useState } from "react";
import _ from "lodash";
import { Form, FormGroup, Dropdown } from "react-bootstrap";
import { DiseasesSearchResults, VarSearchResults } from "./SearchResults";

export function SearchBar({ searchVar = true, searchDiseases = false }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (text.length > 0) {
      setShowSuggestions(true);
    }
  }, [text]);

  return (
    <div>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <FormGroup>
          <Form.Label>{"Search "}</Form.Label>
          <Form.Control
            onFocus={() => {
              setShowSuggestions(text.length > 0);
            }}
            onBlur={() => {
              _.delay(() => {
                setShowSuggestions(false);
              }, 150);
            }}
            type="text"
            placeholder={"Search "}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
            }}
          />
          <Dropdown
            show={showSuggestions}
            onMouseDown={(e) => {
              e.preventDefault();
            }}
          >
            <Dropdown.Menu style={{ width: "90%" }}>
              {searchVar && (
                <VarSearchResults
                  text={text}
                  setShowSuggestions={setShowSuggestions}
                />
              )}
              {searchVar && searchDiseases && <Dropdown.Divider />}
              {searchDiseases && (
                <DiseasesSearchResults
                  text={text}
                  setShowSuggestions={setShowSuggestions}
                />
              )}
            </Dropdown.Menu>
          </Dropdown>
        </FormGroup>
      </Form>
    </div>
  );
}
