/**
 * Map initialization and control using Leaflet.js
 * Leaflet is free and open-source: https://leafletjs.com/
 */

let map;
let alertsLayer;

/**
 * Initialize the map
 */
function initMap() {
  // Create map centered on US
  map = L.map('map-container').setView([39.8283, -98.5795], 4);
  
  // Add base map layer (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  // Create a layer for alerts
  alertsLayer = L.layerGroup().addTo(map);
  
  // Add weather radar layer (from NOAA/NWS)
  const radarLayer = L.tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png', {
    attribution: 'NOAA/NWS',
    opacity: 0.5
  });
  
  // Create layer controls
  const baseMaps = {
    "Map": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
    "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}')
  };
  
  const overlayMaps = {
    "Alerts": alertsLayer,
    "Radar": radarLayer
  };
  
  // Add layer control to map
  L.control.layers(baseMaps, overlayMaps).addTo(map);
  
  // Add the alerts to map when data is fetched
  fetchAllActiveAlerts()
    .then(displayAlertsOnMap)
    .catch(error => console.error('Error loading alerts on map:', error));
}

/**
 * Display alerts on the map
 * @param {Array} alerts - Array of alert objects from NWS API
 */
function displayAlertsOnMap(alerts) {
  // Clear existing alerts
  alertsLayer.clearLayers();
  
  alerts.forEach(alert => {
    // Extract geometry and properties
    const geometry = alert.geometry;
    const properties = alert.properties;
    
    if (!geometry) return; // Skip alerts without geometry
    
    // Determine color based on event type
    let color;
    if (properties.severity === 'Extreme' || properties.severity === 'Severe') {
      color = '#dc2626'; // Red for warnings
    } else if (properties.severity === 'Moderate') {
      color = '#d97706'; // Orange for watches
    } else {
      color = '#2563eb'; // Blue for advisories
    }
    
    // Add polygon to map
    if (geometry.type === 'Polygon') {
      // Convert coordinates to format Leaflet expects
      const coordinates = geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
      
      // Create polygon
      const polygon = L.polygon(coordinates, {
        color: color,
        weight: 2,
        opacity: 0.7,
        fillOpacity: 0.3
      }).addTo(alertsLayer);
      
      // Add popup with basic info
      polygon.bindPopup(`
        <strong>${properties.event}</strong><br>
        Expires: ${new Date(properties.expires).toLocaleString()}<br>
        <a href="#alert-${properties.id}">View Details</a>
      `);
    }
  });
}

/**
 * Center map on searched location
 * @param {string} query - Location search query
 */
async function centerMapOnLocation(query) {
  try {
    const coordinates = await geocodeLocation(query);
    map.setView([coordinates[1], coordinates[0]], 8);
    
    // Add a marker at the location
    L.marker([coordinates[1], coordinates[0]])
      .addTo(map)
      .bindPopup(`<b>Location: ${query}</b>`)
      .openPopup();
      
    // Fetch alerts for this area
    fetchAlertsByArea(query)
      .then(displayAlertsList)
      .catch(error => console.error('Error loading alerts for location:', error));
  } catch (error) {
    console.error('Error centering map:', error);
    alert('Location not found. Please try a different search.');
  }
}
