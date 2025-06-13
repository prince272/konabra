import React, { forwardRef, useRef, useState, useCallback } from "react";
import Map, {
  FullscreenControl,
  GeolocateControl,
  MapRef,
  MapProps,
  Marker,
  NavigationControl
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { Chip } from "@heroui/chip";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { RadioGroup, Radio } from "@heroui/radio";
import { Incident, IncidentSeverity } from "@/services/incident-service";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoicHJpbmNlb3d1c3UyNzIiLCJhIjoiY21ibmJ1Z2pyMWI2NDJzcXdsZjB4NnFqbCJ9.75HATZVp3DMj5lzWmuvI-w";

interface MapViewerProps extends MapProps {
  incidents?: Incident[];
}

const MapViewer = forwardRef<MapRef, MapViewerProps>(({ incidents = [], ...props }, externalRef) => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  const internalRef = useRef<MapRef>(null);
  const mapRef = (externalRef && typeof externalRef !== "function") ? externalRef : internalRef;

  const defaultMarkerPosition = {
    longitude: -122.4,
    latitude: 37.8
  };

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

  const handleIncidentSelect = useCallback(
    (incident: Incident) => {
      setSelectedIncident(incident);
      setSelectedIncidentId(incident.id);

      mapRef.current?.flyTo({
        center: [incident.longitude, incident.latitude],
        zoom: 14,
        duration: 1500
      });
    },
    [mapRef]
  );

  return (
    <div className="flex h-full w-full">
      <div className="w-80 border-default-200 text-current p-4">
        <h2 className="mb-4 text-lg font-semibold">Incidents ({incidents.length})</h2>
        <RadioGroup
          value={selectedIncidentId || ""}
          onValueChange={(id) => {
            const incident = incidents.find((i) => i.id === id);
            if (incident) handleIncidentSelect(incident);
          }}
          className="space-y-2"
        >
          {incidents.map((incident) => (
            <Radio
              key={incident.id}
              value={incident.id}
              classNames={{
                base: `max-w-full flex items-center justify-between m-0 p-3 rounded-lg border-2 border-transparent hover:bg-default-100 ${
                  selectedIncidentId === incident.id ? "border-primary bg-default-100" : ""
                }`,
                wrapper: "hidden"
              }}
            >
              <div className="flex w-full items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${getMarkerColor(incident.severity)}`} />
                <div className="flex-1">
                  <h3 className="line-clamp-1 text-sm font-medium">{incident.summary}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-default-500">{incident.category.name}</span>
                    <span className="text-xs text-default-500">
                      {new Date(incident.reportedAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </Radio>
          ))}
        </RadioGroup>
      </div>

      <div className="flex-1">
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={initialViewState}
          mapStyle="mapbox://styles/mapbox/streets-v9"
          reuseMaps
          {...props}
        >
          {incidents.length === 0 && (
            <Marker {...defaultMarkerPosition} anchor="bottom">
              <div className={`h-6 w-6 rounded-full border-2 border-white bg-default-500`} />
            </Marker>
          )}

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
                      onClick={() => handleIncidentSelect(incident)}
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="w-64 p-3">
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

                    <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-default-900">
                      {incident.summary}
                    </h3>

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

          <GeolocateControl position="top-left" trackUserLocation showUserHeading />
          <NavigationControl position="top-left" />
          <FullscreenControl position="top-left" />
        </Map>
      </div>
    </div>
  );
});

export default MapViewer;
