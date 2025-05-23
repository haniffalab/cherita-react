import React, { useEffect, useRef, useState } from "react";

import SearchIcon from "@mui/icons-material/Search";
import _ from "lodash";
import { Dropdown, Form, FormGroup, InputGroup } from "react-bootstrap";

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
              style={{
                paddingLeft: "2.5rem",
                borderRadius: "5px",
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
                  handleSelect={handleSelect}
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
