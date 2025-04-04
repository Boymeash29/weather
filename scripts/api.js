// Base URL for NWS API
const NWS_API_BASE_URL = 'https://api.weather.gov';

// NWS API doesn't require an API key, but requests a User-Agent header with contact info
const headers = {
  'User-Agent': '(your-website.com, contact@your-website.com)',
  'Accept': 'application/geo+json'
};

/**
 * Fetch all active alerts across the US
 * @returns {Promise} Promise that resolves to alerts data
 */
async function fetchAllActiveAlerts() {
  try {
    const response = await fetch(`${NWS_API_BASE_URL}/alerts/active`, { headers });
    
    if (!response.ok) {
      throw new Error(`Error fetching alerts: ${response.status}`);
    }
    
    const data = await response.json();
    return data.features; // Returns array of alert objects
  } catch (error) {
    console.error('Failed to fetch alerts:', error);
    throw error;
  }
}

/**
 * Fetch alerts for a specific area (state or zone)
 * @param {string} area - State code or zone ID
 * @returns {Promise} Promise that resolves to alerts data
 */
async function fetchAlertsByArea(area) {
  try {
    const response = await fetch(`${NWS_API_BASE_URL}/alerts/active/area/${area}`, { headers });
    
    if (!response.ok) {
      throw new Error(`Error fetching alerts for ${area}: ${response.status}`);
    }
    
    const data = await response.json();
    return data.features;
  } catch (error) {
    console.error(`Failed to fetch alerts for ${area}:`, error);
    throw error;
  }
}

/**
 * Search for location coordinates using address or zip code
 * We'll use a geocoding service like MapBox or Google
 * @param {string} query - Search query (address, city, zip)
 * @returns {Promise} Promise that resolves to coordinates
 */
async function geocodeLocation(query) {
  // Replace with your preferred geocoding service
  // Example using MapBox (requires API key)
  const MAPBOX_API_KEY = 'YOUR_MAPBOX_API_KEY'; // Store this in config.js in production
  
  try {
    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_API_KEY}&country=us`);
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      // Return [longitude, latitude]
      return data.features[0].center;
    } else {
      throw new Error('No results found');
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}