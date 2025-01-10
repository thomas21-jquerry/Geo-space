// app/components/Map.js
"use client"
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { NavigationControl } from 'mapbox-gl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const Map = ({ datasets, onShapeDrawn }) => {
  const mapContainer = useRef(null);

  useEffect(() => {
    console.log(datasets)
    // Initialize the Mapbox map
    let centerCoordinates = datasets.length > 0 && datasets[0].data.features[0].geometry.coordinates[0];
    centerCoordinates = centerCoordinates instanceof Array ? centerCoordinates?.[0]: centerCoordinates  
const initialCenter = centerCoordinates ? [centerCoordinates[0], centerCoordinates[1]] : [-74.5, 40];

const map = new mapboxgl.Map({
  container: mapContainer.current,
  style: 'mapbox://styles/mapbox/streets-v11',
  center: initialCenter, // Dynamically set center based on dataset
  zoom: 12, // Adjust zoom level as needed
});

    map.addControl(new NavigationControl(), 'top-left');

    // Ensure datasets are available before trying to render them
    if (Array.isArray(datasets)) {
      datasets.forEach((dataset) => {
        console.log(JSON.stringify(dataset.data))
        map.on('load', () => {
          // Add GeoJSON data as a source
          map.addSource(dataset.id, {
            type: 'geojson',
            data: dataset.data, // GeoJSON data
          });

          // Add a line layer (customize this based on your dataset)
          if(dataset.data.features[0].geometry.type == "LineString"){
            map.addLayer({
                id: dataset.id,
                type: 'line',
                source: dataset.id,
                paint: {
                  'line-color': '#ff0000',
                  'line-width': 3,
                },
            });
          } 
          else{
            map.addLayer({
              id: dataset.id,
              type: "fill",
              source: dataset.id,
              paint: {
                "fill-color": "#0000ff",
                "fill-opacity": 0.5,
              },
            });
          }
        });
      });
    }

    // Add an event listener for shape drawing (click to draw)
    map.on('click', (e) => {
      onShapeDrawn(e.lngLat); // Send coordinates to parent component
    });

    // Cleanup map on component unmount
    return () => {
      map.remove();
    };
  }, [datasets]); // Re-run effect if datasets change

  return (
    <div
      ref={mapContainer}
      style={{ width: '100%', height: '500px' }}
    />
  );
};

export default Map;
