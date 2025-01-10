"use client";
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf'; // Import Turf.js for area calculation
import { NavigationControl } from 'mapbox-gl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const Map = ({ datasets, onShapeDrawn }) => {
  const mapContainer = useRef(null);
  const [roundedArea, setRoundedArea] = useState(null); // State to store the calculated area

  useEffect(() => {
    // Initialize the Mapbox map
    let centerCoordinates =
      datasets.length > 0 && datasets[0].data.features[0].geometry.coordinates[0];
    centerCoordinates = centerCoordinates instanceof Array ? centerCoordinates[0] : centerCoordinates;

    const initialCenter = centerCoordinates
      ? [centerCoordinates[0], centerCoordinates[1]]
      : [-74.5, 40];

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: initialCenter, // Dynamically set center based on dataset
      zoom: 12, // Adjust zoom level as needed
    });

    map.addControl(new NavigationControl(), 'top-left');

    // Initialize Mapbox Draw
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: 'draw_polygon',
    });

    map.addControl(draw);

    // Add drawing event listeners
    map.on('draw.create', updateArea);
    map.on('draw.delete', updateArea);
    map.on('draw.update', updateArea);

    // Function to update the area when a shape is drawn, updated, or deleted
    function updateArea(e) {
      const data = draw.getAll();
      if (data.features.length > 0) {
        const polygon = data.features[0];
        const areaInSquareMeters = turf.area(polygon); // Calculate area using Turf.js
        const rounded = Math.round(areaInSquareMeters * 100) / 100; // Round area to 2 decimal places
        setRoundedArea(rounded); // Update the area state
        onShapeDrawn(polygon); // Send the polygon data to the parent component
      } else {
        setRoundedArea(null);
        if (e.type !== 'draw.delete') alert('Click the map to draw a polygon.');
      }
    }

    // Ensure datasets are available before trying to render them
    if (Array.isArray(datasets)) {
      datasets.forEach((dataset) => {
        map.on('load', () => {
          // Add GeoJSON data as a source
          map.addSource(dataset.id, {
            type: 'geojson',
            data: dataset.data, // GeoJSON data
          });

          // Add a line layer (customize this based on your dataset)
          if (dataset.data.features[0].geometry.type === 'LineString') {
            map.addLayer({
              id: dataset.id,
              type: 'line',
              source: dataset.id,
              paint: {
                'line-color': '#ff0000',
                'line-width': 3,
              },
            });
          } else {
            map.addLayer({
              id: dataset.id,
              type: 'fill',
              source: dataset.id,
              paint: {
                'fill-color': '#0000ff',
                'fill-opacity': 0.5,
              },
            });
          }
        });
      });
    }

    // Cleanup map on component unmount
    return () => {
      map.remove();
    };
  }, [datasets, onShapeDrawn]);

  return (
    <div>
      <div ref={mapContainer} style={{ width: '100%', height: '500px' }} />

      {/* Area display box */}
      <div
        className="calculation-box"
        style={{
          height: 75,
          width: 150,
          position: 'absolute',
          bottom: 40,
          left: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: 15,
          textAlign: 'center',
        }}
      >
        <p style={{ fontFamily: 'Open Sans', margin: 0, fontSize: 13 }}>
          Click the map to draw a polygon.
        </p>
        <div id="calculated-area">
          {roundedArea !== null && (
            <>
              <p style={{ fontFamily: 'Open Sans', margin: 0, fontSize: 13 }}>
                <strong>{roundedArea}</strong>
              </p>
              <p style={{ fontFamily: 'Open Sans', margin: 0, fontSize: 13 }}>
                square meters
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Map;
