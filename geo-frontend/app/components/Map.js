"use client";
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf'; // Import Turf.js for area and length calculations
import { NavigationControl } from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const Map = ({ datasets, onShapeDrawn }) => {
  const mapContainer = useRef(null);
  const [roundedArea, setRoundedArea] = useState(null); // State to store the calculated area
  const [lineLengthKm, setLineLengthKm] = useState(null); // State to store the line length
  const [lineLengthMiles, setLineLengthMiles] = useState(null);
  const [points, setPoints] = useState([]); 


  useEffect(() => {
    // Initialize the Mapbox map
    let centerCoordinates =
      datasets.length > 0 && datasets[0].data.features[0].geometry.coordinates;
    console.log(JSON.stringify(centerCoordinates))
    centerCoordinates = centerCoordinates[0]?.length>2? centerCoordinates[0][0] : centerCoordinates[0];
    console.log(centerCoordinates)
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

    // Initialize Mapbox Draw with both polygon and line controls
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        line_string: true, 
        point: true,
        trash: true,
      },
      defaultMode: 'draw_polygon', // Start in polygon drawing mode
    });

    map.addControl(draw);

    // Add drawing event listeners
    map.on('draw.create', updateShape);
    map.on('draw.delete', updateShape);
    map.on('draw.update', updateShape);

    // Function to update the area or length when a shape is drawn, updated, or deleted
    function updateShape(e) {
      const data = draw.getAll();
      if (data.features.length > 0) {
        const shape = data.features[0];
        const shapeType = shape.geometry.type;

        if (shapeType === 'Polygon') {
          const areaInSquareMeters = turf.area(shape); // Calculate area using Turf.js
          const rounded = Math.round(areaInSquareMeters * 100) / 100; // Round area to 2 decimal places
          const areaKm = rounded / 1_000_000; // Convert to square kilometers
          setRoundedArea(areaKm); // Update the area state
          setLineLengthKm(null); 
          setLineLengthMiles(null);// Clear line length state
          setPoints(null)
        } else if (shapeType === 'LineString') {
          const lengthInKMeters = turf.length(shape); // Calculate length using Turf.js
          const rounded = Math.round(lengthInKMeters * 100) / 100; // Round length to 2 decimal places
          const lengthInMiles = lengthInKMeters * 0.621;
          const roundedMiles = Math.round(lengthInMiles * 100) / 100;
          setLineLengthKm(rounded); // Update the line length state
          setLineLengthMiles(roundedMiles)
          setRoundedArea(null); // Clear area state
          setPoints(null)
        }
        else if (shapeType === 'Point') {
            // Handle point shape (marker) logic
            const pointCoordinates = shape.geometry.coordinates;
            const newPoint = { id: shape.id, coordinates: pointCoordinates };
            setPoints((prevPoints) => [...prevPoints, newPoint]); // Add the new point to the state
            setRoundedArea(null);
            setLineLengthKm(null);
            setLineLengthMiles(null);
        }
        onShapeDrawn(shape); // Send the shape data to the parent component
      } else {
        setRoundedArea(null);
        setLineLength(null);
        if (e.type !== 'draw.delete') alert('Click the map to draw a shape.');
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
    <div style={{ position: 'relative' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '500px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }} />

      {/* Area or Length display box */}
      <div
        className="calculation-box"
        style={{
          height: '115px',
          width: '200px',
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        
        <div id="calculated-area">
          {roundedArea !== null && (
            <div>
              <p style={{ fontSize: '16px', fontWeight: '500', margin: '5px 0' }}>
                <strong>{roundedArea}</strong>
              </p>
              <p style={{ fontSize: '12px', color: '#555', margin: '0' }}>
                square kilometers
              </p>
            </div>
          )}
          {lineLengthKm !== null && (
            <div>
              <p style={{ fontSize: '16px', fontWeight: '500', margin: '5px 0' }}>
                <strong>{lineLengthKm}</strong>
              </p>
              <p style={{ fontSize: '12px', color: '#555', margin: '0' }}>
                kilometers
              </p>
              <p style={{ fontSize: '16px', fontWeight: '500', margin: '5px 0' }}>
                <strong>{lineLengthMiles}</strong>
              </p>
              <p style={{ fontSize: '12px', color: '#555', margin: '0' }}>
                miles
              </p>
            </div>
          )}
          {points.length > 0 && (
            <div>
              <p style={{ fontSize: '16px', fontWeight: '500', margin: '5px 0' }}>
                <strong></strong> Point Coordinates:
              </p>
              <p style={{ fontSize: '12px', color: '#555', margin: '0' }}>
              <strong>{`Longitude: ${points[0].coordinates[0]}, Latitude: ${points[0].coordinates[1]}`}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Map;
