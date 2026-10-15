import {useEffect, useRef, useState} from "react";
import * as maplibregl from 'maplibre-gl';
import "maplibre-gl/dist/maplibre-gl.css";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import type { FeatureCollection, Point } from "geojson";
import type {BigfootReport} from "../types/BigfootReport.ts";
import SightingDialog from "./SightingDialog.tsx";
import {assetUrl} from "../utils/assetUrl.ts";

maplibregl.setWorkerUrl(workerUrl);

interface MapComponentProps {
    geoJsonUrlOrData: string | FeatureCollection<Point>;
}

export const MapWithGeoJson = ({
                                   geoJsonUrlOrData
                               }: MapComponentProps) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);

    const [selectedReports, setSelectedReports] =
        useState<BigfootReport[] | null>(null);


    // Initialize the map once
    useEffect(() => {
        if (!mapContainerRef.current) return;

        const map = new maplibregl.Map({
            container: mapContainerRef.current,
            style: {
                version: 8,
                sources: {},
                layers: [
                    {
                        id: "background",
                        type: "background",
                        paint: {
                            "background-color": "#BFD8E6"
                        }
                    }
                ]
            },
            center: [-98.5795, 39.8283],
            zoom: 3.5
        });

        mapRef.current = map;

        map.addControl(
            new maplibregl.NavigationControl(),
            "top-right"
        );

        map.on("error", (event) => {
            console.error("MapLibre error:", event.error);
        });

        map.on("load", async () => {

            map.addSource('boundaries', {
                type: 'geojson',
                data: assetUrl("data/bigfoot_states.geojson")
            });

            map.addSource("bigfoot", {
                type: "geojson",
                data: geoJsonUrlOrData,
                cluster: true,
                clusterRadius: 50,
                clusterMaxZoom: 14
            });


            const bigfootImage = await map.loadImage(
                assetUrl("/images/bigfoot-idle.png"));
            map.addImage("bigfoot-icon", bigfootImage.data);

            const clusterImage = await map.loadImage(
                assetUrl("/images/bigfoot-cluster.png"));
            map.addImage("bigfoot-cluster", clusterImage.data);


            // 1. Subtle illustrated shadow
            map.addLayer({
                id: "boundary-shadow",
                type: "fill",
                source: "boundaries",
                paint: {
                    "fill-color": "#5E6F53",
                    "fill-opacity": 0.3,
                    "fill-translate": [3, 4]
                }
            });

            // 2. Land fill
            map.addLayer({
                id: "boundary-fill",
                type: "fill",
                source: "boundaries",
                paint: {
                    "fill-color": [
                        "interpolate",
                        ["linear"],
                        ["coalesce", ["get", "reports"], 0],
                        0, "#D8E4C6",
                        25, "#BFD19E",
                        100, "#A2BF7A",
                        250, "#89A962",
                        500, "#6F8C4B",
                        700, "#5D7840"
                    ],
                    "fill-opacity": 1
                }
            });

            // 3. Cream-colored outer stroke
            map.addLayer({
                id: "boundary-outline-under",
                type: "line",
                source: "boundaries",
                paint: {
                    "line-color": "#F3F0DF",
                    "line-width": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        3, 2,
                        6, 3.5,
                        9, 5
                    ]
                }
            });

            // 4. Darker inner stroke
            map.addLayer({
                id: "boundary-line",
                type: "line",
                source: "boundaries",
                paint: {
                    "line-color": "#5E6F53",
                    "line-width": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        3, 1,
                        6, 1.8,
                        9, 2.5
                    ]
                }
            });

            map.addLayer({
                id: "states-labels",
                type: "symbol",
                source: "boundaries",
                minzoom: 3,
                layout: {
                    "text-field": ["get", "stateCode"],
                    "text-size": 12,
                    "text-allow-overlap": false
                },
                paint: {
                    "text-color": "#34462F",
                    "text-halo-color": "#F3F0DF",
                    "text-halo-width": 1.5
                }
            });


            map.addLayer({
                id: "cluster-bigfoot",
                type: "symbol",
                source: "bigfoot",
                filter: ["has", "point_count"],
                layout: {
                    "icon-image": "bigfoot-cluster",
                    "icon-size": [
                        "step",
                        ["get", "point_count"],
                        1.0,
                        10, 1.15,
                        50, 1.3,
                        200, 1.45
                    ],
                    "icon-anchor": "center",
                    "icon-offset": [0, -8],
                    "icon-allow-overlap": true,
                    "icon-ignore-placement": true
                }
            });

            // Cluster circles
            map.addLayer({
                id: "cluster-badge",
                type: "circle",
                source: "bigfoot",
                filter: ["has", "point_count"],
                paint: {
                    "circle-color": "#F4D7A5",
                    "circle-stroke-color": "#513421",
                    "circle-stroke-width": 2.5,
                    "circle-radius": 14,
                    "circle-translate": [0, -4]
                }
            });

            // Number of reports per cluster
            map.addLayer({
                id: "cluster-count",
                type: "symbol",
                source: "bigfoot",
                filter: ["has", "point_count"],
                layout: {
                    "text-field": ["get", "point_count_abbreviated"],
                    "text-size": 12,
                    "text-allow-overlap": true,
                    "text-ignore-placement": true
                },
                paint: {
                    "text-color": "#33251A",
                    "text-halo-color": "#F4D7A5",
                    "text-halo-width": 0.5,
                    "text-translate": [0, -4]
                }
            });

            // Individual sightings
            map.addLayer({
                id: "unclustered-point",
                type: "symbol",
                source: "bigfoot",
                filter: ["!", ["has", "point_count"]],
                layout: {
                    "icon-image": "bigfoot-icon",
                    "icon-size": 1,
                    "icon-allow-overlap": true,
                    "icon-ignore-placement": true
                }
            });


            map.on("click", "unclustered-point", (event) => {
                const feature = event.features?.[0];

                if (!feature || feature.geometry.type !== "Point") {
                    return;
                }

                // Report Selection
                const report = feature.properties as BigfootReport;
                setSelectedReports([report]);

            });
        });

        map.on("click", async (event) => {
            const features = map.queryRenderedFeatures(event.point, {
                layers: [
                    "cluster-count",
                    "cluster-badge",
                    "cluster-bigfoot"
                ]
            });

            const feature = features[0];
            if (!feature) return;

            const clusterId = feature.properties?.cluster_id;
            const pointCount = feature.properties?.point_count;

            if (clusterId == null || !pointCount) return;

            const source = map.getSource("bigfoot") as maplibregl.GeoJSONSource;

            const leaves = await source.getClusterLeaves(
                clusterId,
                pointCount,
                0
            );

            const reports = leaves
                .map(feature =>
                    feature.properties as BigfootReport
                )
                .sort((a, b) =>
                    (a.date ?? "").localeCompare(b.date ?? "")
                );

            setSelectedReports(reports);
        });

        map.on("click", "boundary-fill", (event) => {
            const state = event.features?.[0]?.properties;

            console.log(
                state?.shapeName,
                state?.reports
            );
        });

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Update source when the prop changes
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const updateData = () => {
            const source = map.getSource(
                "bigfoot"
            ) as maplibregl.GeoJSONSource | undefined;

            if (source) {
                source.setData(geoJsonUrlOrData);
            }
        };

        if (map.isStyleLoaded()) {
            updateData();
        } else {
            map.once("load", updateData);

            return () => {
                map.off("load", updateData);
            };
        }
    }, [geoJsonUrlOrData]);

    return (
        <>
            <div
                ref={mapContainerRef}
                style={{
                    width: "100%",
                    height: "100%"
                }}
            />

            {selectedReports && selectedReports.length > 0 && (
                <SightingDialog
                    reports={selectedReports}
                    onClose={() => {
                        setSelectedReports(null);
                    }}
                />
            )}
        </>
    );
};

export default MapWithGeoJson;
