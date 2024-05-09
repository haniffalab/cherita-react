import React, { useEffect, useState, useRef } from "react";
import _ from "lodash";
import { Form, FormGroup, Dropdown } from "react-bootstrap";
import { DiseasesSearchResults, VarSearchResults } from "./SearchResults";

export function SearchBar({ searchVar = true, searchDiseases = false }) {
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

  return (
    <div>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <FormGroup>
          <Form.Control
            ref={inputRef}
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
          />
          <Dropdown
            show={showSuggestions}
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            onSelect={() => {
              inputRef.current.blur();
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
