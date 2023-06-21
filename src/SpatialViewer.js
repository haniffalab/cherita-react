import { React, useEffect, useState } from "react";
import {
  getChannelStats,
  loadOmeTiff,
  loadBioformatsZarr,
  PictureInPictureViewer,
  loadOmeZarr,
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

export async function createLoader(url) {
  let source;
  try {
    source = await loadBioformatsZarr(url);
  } catch {
    const res = await loadOmeZarr(url, { type: "multiscales" });
    // const metadata = {
    //   Pixels: {
    //     Channels: res.metadata.omero.channels.map((c) => ({
    //       Name: c.label,
    //       SamplesPerPixel: 1,
    //     })),
    //   },
    // };
    source = { data: res.data, metadata: res.metadata };
  }
  return source;
}

async function computeProps(loader) {
  if (!loader) return null;
  // Use lowest level of the image pyramid for calculating stats.
  const source = loader.data[loader.data.length - 1];
  const stats = await Promise.all(
    props.selections.map(async (selection) => {
      const raster = await source.getRaster({ selection });
      return getChannelStats(raster.data);
    })
  );

  // These are precalculated settings for the contrastLimits that
  // should render a good, "in focus" image initially.
  const contrastLimits = stats.map((stat) => stat.contrastLimits);
  const newProps = { ...props, contrastLimits };
  return newProps;
}

export function SpatialViewer() {
  const url =
    "https://haniffa.cog.sanger.ac.uk/breast-cancer/visium/0.0.1/breast_cancer-visium-raw.zarr/0"; // OME-ZARR
  const [loader, setLoader] = useState(null);
  const [autoProps, setAutoProps] = useState(null);

  useEffect(() => {
    createLoader(url).then(setLoader);
  }, []);

  // Viv exposes the getChannelStats to produce nice initial settings
  // so that users can have an "in focus" image immediately.
  useEffect(() => {
    if (!loader) {
      return;
    }
    computeProps(loader).then(setAutoProps);
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
