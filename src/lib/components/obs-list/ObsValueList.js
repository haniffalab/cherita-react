import React, { useCallback, useEffect, useState } from "react";

import { Tooltip } from "@mui/material";
import { Gauge } from "@mui/x-charts";
import { useVirtualizer } from "@tanstack/react-virtual";
import _ from "lodash";
import { ListGroup, Form, Badge } from "react-bootstrap";

export function ObsValueList({
  item,
  onChange,
  getFillColor,
  totalCounts = null,
}) {
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
              const pct = (item.value_counts[value] / totalCounts) * 100;
              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={valueVirtualizer.measureElement}
                >
                  <ListGroup.Item key={value}>
                    <div className="d-flex align-items-center">
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
                      <div className="d-flex align-items-center">
                        <div className="px-1 m-0">
                          <Tooltip
                            title={`${pct.toLocaleString()}%`}
                            placement="left"
                            arrow
                          >
                            <div className="d-flex align-items-center">
                              <Badge
                                className="value-count-badge"
                                style={{
                                  fontWeight: "lighter",
                                }}
                              >
                                {parseInt(
                                  item.value_counts[value]
                                ).toLocaleString()}
                              </Badge>
                              <div className="value-pct-gauge-container">
                                <Gauge
                                  value={pct}
                                  text={null}
                                  innerRadius={"50%"}
                                  margin={{
                                    top: 0,
                                    right: 0,
                                    bottom: 0,
                                    left: 0,
                                  }}
                                />
                              </div>
                            </div>
                          </Tooltip>
                        </div>
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
