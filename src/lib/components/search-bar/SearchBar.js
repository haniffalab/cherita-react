import React, { useState } from "react";
import _ from "lodash";
import { Form, FormGroup, Stack } from "react-bootstrap";
import { DiseasesSearchResults, VarSearchResults } from "./SearchResults";

export function SearchBar({ searchVar = true, searchDiseases = false }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [text, setText] = useState("");

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
          {searchVar && (
            <VarSearchResults
              text={text}
              showSuggestions={showSuggestions}
              setShowSuggestions={setShowSuggestions}
            />
          )}
          {searchDiseases && (
            <DiseasesSearchResults
              text={text}
              showSuggestions={showSuggestions}
              setShowSuggestions={setShowSuggestions}
            />
          )}
        </FormGroup>
      </Form>
    </div>
  );
}
