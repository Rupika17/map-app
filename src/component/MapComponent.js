import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { createStringXY } from "ol/coordinate";
import { defaults as defaultControls, MousePosition } from "ol/control";
import { get as getProjection } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Fill, Stroke, Circle } from 'ol/style';

const MapComponent = () => {
  const mapRef = useRef();

  const [wfsLayerVisible, setWfsLayerVisible] = useState(true);
  const [wfsLayerOpacity, setWfsLayerOpacity] = useState(0.5);

  useEffect(() => {
    if (mapRef.current) {
      const tileLayer = new TileLayer({
        source: new OSM(),
      });
      const vectorSource = new VectorSource({
        format: new GeoJSON(),
        url: "https://service.pdok.nl/lv/bag/wfs/v2_0?service=WFS&version=2.0.0&request=GetFeature&typeName=bag:verblijfsobject&outputFormat=application/json&srsname=EPSG:3857",
      });

      const vector = new VectorLayer({
        source: vectorSource,
        opacity: wfsLayerOpacity,
        visible: wfsLayerVisible,
        style: new Style({
            fill: new Fill({ color: 'rgba(255, 0, 0, 0.2)' }),
            stroke: new Stroke({ color: 'red', width: 1 }),
            image: new Circle({ radius: 5, fill: new Fill({ color: 'red' }) }),
          }),
      });

      const projection = getProjection("EPSG:28992");

      const map = new Map({
        target: mapRef.current,
        layers: [ tileLayer, vector],
        view: new View({
          center: [761963.05,7043067.40],
          maxZoom: 19,
          zoom: 15,
          projection: projection,
        }),
        controls: defaultControls().extend([
          new MousePosition({
            coordinateFormat: createStringXY(2),
            projection: projection,
          }),
        ]),
      });

      return () => {
        map.setTarget(null);
      };
    }
  }, [wfsLayerOpacity, wfsLayerVisible]);

  const handleVisibilityChange = () => {
    setWfsLayerVisible(!wfsLayerVisible);
  };

  const handleOpacityChange = (event) => {
    setWfsLayerOpacity(parseFloat(event.target.value));
  };

  return (
    <div>
      <div
        ref={mapRef}
        style={{ width: "100%", height: "400px" }}
        className="map-container"
      ></div>

      <div>
        <label htmlFor="visibility">WFS Layer Visibility:</label>
        <input
          type="checkbox"
          id="visibility"
          checked={wfsLayerVisible}
          onChange={handleVisibilityChange}
        />
      </div>
      <div>
        <label htmlFor="opacity">WFS Layer Opacity:</label>
        <input
          type="range"
          id="opacity"
          min="0"
          max="1"
          step="0.1"
          value={wfsLayerOpacity}
          onChange={handleOpacityChange}
        />
      </div>
    </div>
  );
};

export default MapComponent;
