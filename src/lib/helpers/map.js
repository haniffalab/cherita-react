import { WebMercatorViewport } from "@deck.gl/core";

export class MapHelper {
  fitBounds = (coords) => {
    let view = new WebMercatorViewport({
      width: 600,
      height: 400,
      longitude: -122.45,
      latitude: 37.78,
      zoom: 12,
      pitch: 30,
      bearing: 15,
    });
    let latMin = 90;
    let latMax = -90;
    let lonMin = 180;
    let lonMax = -180;
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
  };
}
