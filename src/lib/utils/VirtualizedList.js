import React, { useState, useEffect, useCallback } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";

export function VirtualizedList({
  data,
  count,
  ItemComponent,
  estimateSize = 44,
  overscan = 25,
  maxHeight = "80vh",
  ...props
}) {
  const [parentNode, setParentNode] = useState(null);

  const itemVirtualizer = useVirtualizer({
    count: count,
    getScrollElement: () => parentNode,
    estimateSize: () => estimateSize,
    overscan: overscan,
  });

  const refCallback = useCallback((node) => {
    setParentNode(node);
  }, []);

  const virtualItems = itemVirtualizer.getVirtualItems();

  useEffect(() => {
    itemVirtualizer.measure();
  }, [itemVirtualizer, parentNode?.clientHeight]);

  return (
    <div
      ref={refCallback}
      style={{
        overflowY: "auto",
        maxHeight: maxHeight,
      }}
    >
      <div
        style={{
          height: `${itemVirtualizer.getTotalSize()}px`,
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
          {virtualItems.map((virtualItem, index) => (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={itemVirtualizer.measureElement}
            >
              <ItemComponent
                data={data}
                index={index}
                {...props}
              ></ItemComponent>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}