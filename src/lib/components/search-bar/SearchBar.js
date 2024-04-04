import React, { useState, useEffect, useMemo } from "react";
import _ from "lodash";
import { Dropdown, Form, FormGroup } from "react-bootstrap";

export function SearchBar({ data = [], displayName = null, onSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [text, setText] = useState("");

  const getSuggestions = useMemo(() => {
    const filter = (text) => {
      if (text.length > 0) {
        const regex = new RegExp(`^${text}`, `i`);
        const filtered = data.sort().filter((v) => regex.test(v.name));
        setSuggestions(filtered);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    return _.debounce(filter, 300);
  }, [data]);

  useEffect(() => {
    getSuggestions(text);
  }, [getSuggestions, text]);

  const suggestionsList = suggestions.map((item) => (
    <Dropdown.Item
      key={item.name}
      as="button"
      onClick={() => {
        onSelect(item);
      }}
    >
      {item.name}
    </Dropdown.Item>
  ));

  return (
    <div>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <FormGroup>
          <Form.Label>{"Search " + displayName}</Form.Label>
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
            placeholder={"Search " + displayName}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
            }}
          />
          <Dropdown.Menu
            style={{ width: "90%", maxHeight: "25vh", overflowY: "scroll" }}
            show={showSuggestions}
          >
            {suggestionsList}
          </Dropdown.Menu>
        </FormGroup>
      </Form>
    </div>
  );
}
