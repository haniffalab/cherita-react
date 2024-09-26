import React, { useCallback, useEffect, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import _ from "lodash";
import { ListGroup, Form } from "react-bootstrap";

export function ObsValueList({ item, onChange, getFillColor }) {
  const [parentNode, setParentNode] = useState(null);

  const valueVirtualizer = useVirtualizer({
    count: item.values.length,
    getScrollElement: () => parentNode,
    estimateSize: () => 44,
    overscan: 25,
  });

  const refCallback = useCallback((node) => {
    setParentNode(node);
  }, []);

  const virtualItems = valueVirtualizer.getVirtualItems();

  useEffect(() => {
    valueVirtualizer.measure();
  }, [valueVirtualizer, parentNode?.clientHeight]);

  return (
    <>
      <div
        ref={refCallback}
        style={{
          overflowY: "auto",
          maxHeight: "80vh",
        }}
      >
        <div
          style={{
            height: `${valueVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
            willChange: "transform",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
            }}
          >
            {virtualItems.map((virtualItem) => {
              const value = item.values[virtualItem.index];
              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={valueVirtualizer.measureElement}
                >
                  <ListGroup.Item key={value}>
                    <div className="d-flex">
                      <div className="flex-grow-1">
                        <Form.Check // prettier-ignore
                          className="obs-value-list-check"
                          type="switch"
                          id="custom-switch"
                          label={value}
                          checked={!_.includes(item.omit, item.codes[value])}
                          onChange={() => onChange(value)}
                        />
                      </div>
                      <div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="currentColor"
                          viewBox="0 0 10 10"
                        >
                          <rect
                            x="0"
                            y="0"
                            width="10"
                            height="10"
                            fill={getFillColor(value)}
                          />
                        </svg>
                      </div>
                    </div>
                  </ListGroup.Item>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
