import { React, useEffect, useState } from "react";
import {
  getChannelStats,
  loadOmeTiff,
  loadBioformatsZarr,
  PictureInPictureViewer,
} from "@hms-dbmi/viv";

// Hardcoded rendering properties.
const props = {
  selections: [
    { z: 0, t: 0, c: 0 },
    { z: 0, t: 0, c: 1 },
    { z: 0, t: 0, c: 2 },
  ],
  colors: [
    [0, 0, 255],
    [0, 255, 0],
    [255, 0, 0],
  ],
  contrastLimits: [
    [0, 255],
    [0, 255],
    [0, 255],
  ],
  channelsVisible: [true, true, true],
};

export function SpatialViewer() {
  const url = "http://localhost:8002/multi-channel.ome.tif"; // OME-TIFF
  const [loader, setLoader] = useState(null);

  useEffect(() => {
    loadOmeTiff(url).then(setLoader);
  }, []);

  // Viv exposes the getChannelStats to produce nice initial settings
  // so that users can have an "in focus" image immediately.
  const [autoProps, setAutoProps] = useState(null);
  useEffect(() => {
    if (!loader) {
      return;
    }

    const source = loader.data[loader.data.length - 1];

    async function fetchData() {
      return await Promise.all(
        props.selections.map(async (selection) => {
          const raster = await source.getRaster({ selection });
          return getChannelStats(raster.data);
        })
      );
    }
    const stats = fetchData();
    // Use lowest level of the image pyramid for calculating stats.

    // These are calculated bounds for the contrastLimits
    // that could be used for display purposes.
    // domains = stats.map(stat => stat.domain);

    // These are precalculated settings for the contrastLimits that
    // should render a good, "in focus" image initially.
    // const contrastLimits = stats.map((stat) => stat.contrastLimits);
    // const newProps = { ...props, contrastLimits };
    setAutoProps(props);
  }, [loader]);

  if (!loader || !autoProps) return null;
  return (
    <div className="mh-100">
      <PictureInPictureViewer
        loader={loader.data}
        contrastLimits={autoProps.contrastLimits}
        colors={autoProps.colors}
        channelsVisible={autoProps.channelsVisible}
        selections={autoProps.selections}
        height={1080}
        width={1920}
      />
    </div>
  );
}
