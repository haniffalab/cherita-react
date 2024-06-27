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
      pitch: 0,
      bearing: 0,
    });
    let latMin = 50;
    let latMax = -50;
    let lonMin = 50;
    let lonMax = -50;
    coords.forEach(function (coord) {
      const RECT_LAT_INDEX = "0";
      const RECT_LON_INDEX = "1";
      if (coord[RECT_LAT_INDEX] < latMin) latMin = coord[RECT_LAT_INDEX];
      if (coord[RECT_LAT_INDEX] > latMax) latMax = coord[RECT_LAT_INDEX];
      if (coord[RECT_LON_INDEX] < lonMin) lonMin = coord[RECT_LON_INDEX];
      if (coord[RECT_LON_INDEX] > lonMax) lonMax = coord[RECT_LON_INDEX];
    });

    const bounds = [
      [lonMin, latMax],
      [lonMax, latMin],
    ];
    const { longitude, latitude, zoom } = view.fitBounds(bounds, {
      padding: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    return { longitude, latitude, zoom };
  }
}
