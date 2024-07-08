import { WebMercatorViewport } from "@deck.gl/core";

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
    let latMin = Infinity;
    let latMax = -Infinity;
    let lonMin = Infinity;
    let lonMax = -Infinity;

    const RECT_LON_INDEX = 0;
    const RECT_LAT_INDEX = 1;
    coords.forEach(function (coord) {
      if (coord[RECT_LAT_INDEX] < latMin) latMin = coord[RECT_LAT_INDEX];
      if (coord[RECT_LAT_INDEX] > latMax) latMax = coord[RECT_LAT_INDEX];
      if (coord[RECT_LON_INDEX] < lonMin) lonMin = coord[RECT_LON_INDEX];
      if (coord[RECT_LON_INDEX] > lonMax) lonMax = coord[RECT_LON_INDEX];
    });

    const bounds = [
      [lonMin, latMin],
      [lonMax, latMax],
    ];
    const { longitude, latitude, zoom } = view.fitBounds(bounds, {
      padding: { top: 50, bottom: 70, left: 50, right: 50 },
    });

    return { longitude, latitude, zoom };
  }
}
