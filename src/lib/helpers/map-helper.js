import { WebMercatorViewport } from "@deck.gl/core";
import _ from "lodash";

export class MapHelper {
  fitBounds(
    coords,
    { width = 400, height = 600 } = { width: 400, height: 600 }
  ) {
    let view = new WebMercatorViewport({
      width: width,
      height: height,
      longitude: 0,
      latitude: 0,
      zoom: 12,
    });

    let latMin;
    let latMax;
    let lonMin;
    let lonMax;

    if (coords) {
      latMin = _.minBy(coords, (c) => c[1])[1];
      latMax = _.maxBy(coords, (c) => c[1])[1];
      lonMin = _.minBy(coords, (c) => c[0])[0];
      lonMax = _.maxBy(coords, (c) => c[0])[0];
    } else {
      latMin = 0;
      latMax = 1;
      lonMin = 0;
      lonMax = 1;
    }

    const bounds = [
      [lonMin, latMin],
      [lonMax, latMax],
    ];

    const { longitude, latitude, zoom } = view.fitBounds(bounds, {
      padding: {
        top: height * 0.05,
        bottom: height * 0.075,
        left: width * 0.05,
        right: width * 0.05,
      },
    });

    return { longitude, latitude, zoom };
  }
}
