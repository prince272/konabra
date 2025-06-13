import React, { useState, forwardRef } from "react";
import Map, {
  Marker,
  Popup,
  GeolocateControl,
  NavigationControl,
  FullscreenControl,
  MapRef,
  MapProps
} from "react-map-gl/mapbox";
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = "pk.eyJ1IjoicHJpbmNlb3d1c3UyNzIiLCJhIjoiY21ibmJ1Z2pyMWI2NDJzcXdsZjB4NnFqbCJ9.75HATZVp3DMj5lzWmuvI-w";

interface MapViewerProps extends MapProps {
  // Accept any additional props if needed
}

const MapViewer = forwardRef<MapRef, MapViewerProps>((props, ref) => {
  const [showPopup, setShowPopup] = useState(true);

  const markerPosition = {
    longitude: -122.4,
    latitude: 37.8
  };

  return (
    <Map
      ref={ref}
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={{
        longitude: markerPosition.longitude,
        latitude: markerPosition.latitude,
        zoom: 14
      }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
      reuseMaps
      {...props}
    >
      <Marker {...markerPosition} anchor="bottom">
        <img
          src="https://docs.mapbox.com/help/demos/custom-markers-gl-js/mapbox-icon.png"
          alt="Marker"
          style={{ width: 30, height: 30, cursor: "pointer" }}
          onClick={() => setShowPopup(!showPopup)}
        />
      </Marker>
      <GeolocateControl position="top-left" trackUserLocation showUserHeading />
      <NavigationControl position="top-left" />
      <FullscreenControl position="top-left" />
    </Map>
  );
});

export default MapViewer;
