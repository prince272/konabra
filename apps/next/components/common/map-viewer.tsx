import React, { forwardRef, useState } from "react";
import Map, {
  FullscreenControl,
  GeolocateControl,
  MapProps,
  MapRef,
  Marker,
  NavigationControl,
  Popup
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { Incident, IncidentSeverity } from "@/services/incident-service";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoicHJpbmNlb3d1c3UyNzIiLCJhIjoiY21ibmJ1Z2pyMWI2NDJzcXdsZjB4NnFqbCJ9.75HATZVp3DMj5lzWmuvI-w";

interface MapViewerProps extends MapProps {
  incidents?: Incident[];
}

const MapViewer = forwardRef<MapRef, MapViewerProps>(({ incidents = [], ...props }, ref) => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Default marker position if no incidents are provided
  const defaultMarkerPosition = {
    longitude: -122.4,
    latitude: 37.8
  };

  // Determine initial view state based on incidents or default
  const initialViewState =
    incidents.length > 0
      ? {
          longitude: incidents[0].longitude,
          latitude: incidents[0].latitude,
          zoom: 12
        }
      : {
          longitude: defaultMarkerPosition.longitude,
          latitude: defaultMarkerPosition.latitude,
          zoom: 14
        };

  const getMarkerColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case "low":
        return "bg-secondary";
      case "medium":
        return "bg-warning";
      case "high":
        return "bg-danger";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Map
      ref={ref}
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={initialViewState}
      mapStyle="mapbox://styles/mapbox/streets-v9"
      reuseMaps
      {...props}
    >
      {/* Default marker if no incidents */}
      {incidents.length === 0 && (
        <Marker {...defaultMarkerPosition} anchor="bottom">
          <div className={`h-6 w-6 rounded-full border-2 border-white bg-default-500`} />
        </Marker>
      )}

      {/* Incident markers */}
      {incidents.map((incident) => (
        <Marker
          key={incident.id}
          longitude={incident.longitude}
          latitude={incident.latitude}
          anchor="bottom"
        >
          <Popover>
            <PopoverTrigger>
              <div className="relative">
                <div
                  className={`absolute h-5 w-5 animate-ping rounded-full ${getMarkerColor(incident.severity)} opacity-75`}
                />
                <div
                  className={`relative z-10 h-5 w-5 rounded-full ${getMarkerColor(incident.severity)} cursor-pointer border-2 border-white`}
                  onClick={() => setSelectedIncident(incident)}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent>
              <div className="w-64 p-3">
                {/* Header with severity and status */}
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full ${getMarkerColor(incident.severity)}`}
                    />
                    <span className="text-xs font-medium uppercase tracking-wide text-default-500">
                      {incident.severity}
                    </span>
                  </div>
                  <Chip
                    size="sm"
                    color={
                      (
                        {
                          pending: "secondary",
                          investigating: "warning",
                          resolved: "success",
                          falseAlarm: "default"
                        } as const
                      )[incident.status]
                    }
                    variant="flat"
                  >
                    {incident.status}
                  </Chip>
                </div>

                {/* Incident title */}
                <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-default-900">
                  {incident.summary}
                </h3>

                {/* Details grid */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex">
                    <span className="w-20 shrink-0 text-default-500">Location</span>
                    <span className="text-default-800">{incident.location}</span>
                  </div>
                  <div className="flex">
                    <span className="w-20 shrink-0 text-default-500">Category</span>
                    <span className="text-default-800">{incident.category.name}</span>
                  </div>
                  <div className="flex">
                    <span className="w-20 shrink-0 text-default-500">Reported by</span>
                    <span className="text-default-800">{incident.reportedBy.fullName}</span>
                  </div>
                  <div className="flex">
                    <span className="w-20 shrink-0 text-default-500">Reported at</span>
                    <span className="text-default-800">
                      {new Date(incident.reportedAt).toLocaleDateString([], {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </Marker>
      ))}

      {/* Map controls */}
      <GeolocateControl position="top-left" trackUserLocation showUserHeading />
      <NavigationControl position="top-left" />
      <FullscreenControl position="top-left" />
    </Map>
  );
});

export default MapViewer;
