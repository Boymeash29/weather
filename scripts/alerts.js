/**
 * Functions to handle the display and filtering of alerts
 */

/**
 * Display the list of alerts in the alerts section
 * @param {Array} alerts - Array of alert objects from NWS API
 */
function displayAlertsList(alerts) {
  const alertsContainer = document.querySelector('.alerts-section');
  const alertsHeaderHTML = `
    <div class="alerts-header">
      <h2 class="alerts-title">Active NWS Alerts (${alerts.length})</h2>
      <div class="filter-controls">
        <span class="filter-label">Filter by:</span>
        <select class="filter-select" id="alert-filter">
          <option value="all">All Alerts</option>
          <option value="warning">Warnings</option>
          <option value="watch">Watches</option>
          <option value="advisory">Advisories</option>
        </select>
      </div>
    </div>
  `;
  
  // Start with header
  let alertsHTML = alertsHeaderHTML;
  
  // Add each alert
  alerts.forEach(alert => {
    const properties = alert.properties;
    
    // Determine alert class based on severity
    let alertClass;
    if (properties.severity === 'Extreme' || properties.severity === 'Severe') {
      alertClass = 'alert-warning';
    } else if (properties.severity === 'Moderate') {
      alertClass = 'alert-watch';
    } else {
      alertClass = 'alert-advisory';
    }
    
    // Format dates
    const issuedDate = new Date(properties.sent).toLocaleString();
    const expiryDate = new Date(properties.expires).toLocaleString();
    
    // Create alert card HTML
    alertsHTML += `
      <div class="alert-card ${alertClass}" id="alert-${properties.id}" data-severity="${properties.severity}">
        <div class="alert-card-header">
          <div class="alert-type">${properties.event.toUpperCase()}</div>
          <div class="alert-expiry">Expires: ${expiryDate}</div>
        </div>
        <div class="alert-card-body">
          <div class="alert-meta">
            <div class="alert-meta-row">
              <div class="alert-meta-label">Areas Affected:</div>
              <div>${properties.areaDesc}</div>
            </div>
            <div class="alert-meta-row">
              <div class="alert-meta-label">Issued:</div>
              <div>${issuedDate}</div>
            </div>
            <div class="alert-meta-row">
              <div class="alert-meta-label">NWS Office:</div>
              <div>${properties.senderName}</div>
            </div>
          </div>
          <div class="alert-description">
            ${properties.description ? `<h4>Description</h4><p>${properties.description}</p>` : ''}
            ${properties.instruction ? `<h4>Recommended Actions</h4><p>${properties.instruction}</p>` : ''}
            <div class="alert-source">Source: National Weather Service</div>
          </div>
        </div>
      </div>
    `;
  });
  
  // If no alerts, show message
  if (alerts.length === 0) {
    alertsHTML += '<p>No active weather alerts for this area.</p>';
  }
  
  // Update the DOM
  alertsContainer.innerHTML = alertsHTML;
  
  // Add event listener for filtering
  document.getElementById('alert-filter').addEventListener('change', filterAlerts);
}

/**
 * Filter alerts based on selected type
 */
function filterAlerts() {
  const filterValue = document.getElementById('alert-filter').value;
  const alertCards = document.querySelectorAll('.alert-card');
  
  alertCards.forEach(card => {
    const severity = card.getAttribute('data-severity');
    
    if (filterValue === 'all') {
      card.style.display = 'block';
    } else if (filterValue === 'warning' && (severity === 'Extreme' || severity === 'Severe')) {
      card.style.display = 'block';
    } else if (filterValue === 'watch' && severity === 'Moderate') {
      card.style.display = 'block';
    } else if (filterValue === 'advisory' && (severity === 'Minor' || severity === 'Unknown')) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

/**
 * Set up event listeners when document is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize map
  initMap();
  
  // Search button click event
  document.querySelector('.search-button').addEventListener('click', () => {
    const query = document.querySelector('.search-input').value.trim();
    if (query) {
      centerMapOnLocation(query);
    }
  });
  
  // Search input enter key event
  document.querySelector('.search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = e.target.value.trim();
      if (query) {
        centerMapOnLocation(query);
      }
    }
  });
  
  // Initial load of all alerts
  fetchAllActiveAlerts()
    .then(alerts => {
      displayAlertsList(alerts);
      displayAlertsOnMap(alerts);
    })
    .catch(error => console.error('Error loading initial alerts:', error));
});
