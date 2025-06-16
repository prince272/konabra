"use client";

import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import Map, {
  FullscreenControl,
  GeolocateControl,
  MapProps,
  MapRef,
  Marker,
  NavigationControl
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { Radio, RadioGroup } from "@heroui/radio";
import { Select, SelectItem } from "@heroui/select";
import { cn } from "@heroui/theme";
import { formatDistanceToNow } from "date-fns";
import { upperFirst } from "lodash";
import { Clock, Filter, Layers, MapPin, Search, User, X } from "lucide-react";
import { Incident, IncidentSeverity, IncidentStatus } from "@/services/incident-service";
import { Remount } from "./remount";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoicHJpbmNlb3d1c3UyNzIiLCJhIjoiY21ibmJ1Z2pyMWI2NDJzcXdsZjB4NnFqbCJ9.75HATZVp3DMj5lzWmuvI-w";

// Map style options
const MAP_STYLES = [
  { id: "streets", name: "Streets", url: "mapbox://styles/mapbox/streets-v11" },
  { id: "satellite", name: "Satellite", url: "mapbox://styles/mapbox/satellite-streets-v11" },
  { id: "light", name: "Light", url: "mapbox://styles/mapbox/light-v10" },
  { id: "dark", name: "Dark", url: "mapbox://styles/mapbox/dark-v10" },
  { id: "outdoors", name: "Outdoors", url: "mapbox://styles/mapbox/outdoors-v11" }
];

interface MapViewerProps extends MapProps {
  incidents?: Incident[];
  height?: string | number;
}

const MapViewer = forwardRef<MapRef, MapViewerProps>(
  ({ incidents = [], height = "100%", ...props }, externalRef) => {
    const [mapStyle, setMapStyle] = useState(MAP_STYLES[0].url);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

    const internalRef = useRef<MapRef>(null);
    const mapRef = externalRef && typeof externalRef !== "function" ? externalRef : internalRef;

    const defaultMarkerPosition = {
      longitude: -0.186964,
      latitude: 5.603717
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

    useEffect(() => {
      if (incidents.length > 0 && !selectedIncident) {
        setSelectedIncident(incidents[0]);
        setSelectedIncidentId(incidents[0].id);
        mapRef.current?.flyTo({
          center: [incidents[0].longitude, incidents[0].latitude],
          zoom: 14,
          duration: 1500
        });
      }
    }, [incidents, mapRef, selectedIncident]);

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
      <div className="flex w-full" style={{ height }}>
        <div className="flex w-80 flex-col border-default-200 text-current">
          <div className="p-4">
            <h2 className="text-lg font-semibold">Incidents ({incidents.length})</h2>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
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
                    base: cn(
                      "w-full max-w-full items-start flex flex-col gap-2 m-0 p-0 rounded-xl border-2 border-transparent hover:bg-default-100 transition",
                      selectedIncidentId === incident.id && "border-primary bg-default-100"
                    ),
                    labelWrapper: "w-full p-4 m-0",
                    wrapper: "hidden"
                  }}
                  as={"button"}
                >
                  <div className="flex w-full items-start justify-between gap-4">
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "h-2 w-2 rounded-full",
                              {
                                low: "bg-secondary",
                                medium: "bg-warning",
                                high: "bg-danger"
                              }[incident.severity]
                            )}
                          ></div>
                          <span className="text-sm font-semibold">{incident.code}</span>
                        </div>
                        <Chip
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
                          size="sm"
                        >
                          {incident.status}
                        </Chip>
                      </div>
                      <div className="flex flex-col gap-x-6 gap-y-2 text-xs text-default-500">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <Remount interval={1000}>
                            {() =>
                              incident.reportedAt
                                ? upperFirst(
                                    formatDistanceToNow(new Date(incident.reportedAt), {
                                      addSuffix: true
                                    })
                                  )
                                : "N/A"
                            }
                          </Remount>
                        </div>
                        {incident.reportedBy && (
                          <div className="flex items-center gap-1">
                            <User size={14} />
                            <span>{incident.reportedBy.fullName}</span>
                          </div>
                        )}
                        {incident.location && (
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{incident.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-1 flex w-full items-center justify-between text-xs text-default-500">
                    <span>{incident.category?.name}</span>
                    <span>
                      {new Date(incident.reportedAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                  </div>
                </Radio>
              ))}
            </RadioGroup>
          </div>
        </div>

        <div className="relative flex-1">
          <Map
            ref={mapRef}
            mapboxAccessToken={MAPBOX_TOKEN}
            initialViewState={initialViewState}
            mapStyle={mapStyle}
            reuseMaps
            {...props}
          >
            {incidents.length === 0 && (
              <Marker {...defaultMarkerPosition} anchor="bottom">
                <div className="h-6 w-6 rounded-full border-2 border-white bg-default-500" />
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
                        className={cn(
                          "absolute h-5 w-5 animate-ping rounded-full opacity-75",
                          getMarkerColor(incident.severity)
                        )}
                      />
                      <button
                        type="button"
                        aria-label={`Select incident: ${incident.summary}`}
                        onClick={() => handleIncidentSelect(incident)}
                        className={cn(
                          "relative z-10 h-5 w-5 rounded-full border-2 border-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                          getMarkerColor(incident.severity)
                        )}
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="w-64 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "inline-block h-2.5 w-2.5 rounded-full",
                              getMarkerColor(incident.severity)
                            )}
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
                          <span className="text-default-800">{incident.category?.name}</span>
                        </div>
                        <div className="flex">
                          <span className="w-20 shrink-0 text-default-500">Reported by</span>
                          <span className="text-default-800">{incident.reportedBy?.fullName}</span>
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

          {/* Map Style Switcher */}
          <div className="absolute right-3 top-3 z-10 rounded-lg shadow-md">
            <Select
              size="sm"
              selectedKeys={[mapStyle]}
              onSelectionChange={(selection) => {
                if (selection instanceof Set && selection.size > 0) {
                  const value = Array.from(selection)[0];
                  setMapStyle(String(value));
                }
              }}
              placeholder="Select map style"
              startContent={<Layers size={16} className="text-default-500" />}
              className="w-32"
              aria-label="Map style"
            >
              {MAP_STYLES.map((style) => (
                <SelectItem key={style.url}>{style.name}</SelectItem>
              ))}
            </Select>
          </div>
        </div>
      </div>
    );
  }
);

MapViewer.displayName = "MapViewer";

export default MapViewer;
