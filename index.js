let markerCluster;
let infoWindow;
let trails;
let isMarkerClicked = false;

// Function to fetch and process the CSV file
async function fetchAndProcessCSV() {
  try {
    // Fetch data from the server-side API endpoint
    const response = await fetch('http://localhost:3000/download');
    const csvData = await response.text();

    // Process the complete CSV data using your parsing function
    trails = parseCSV(csvData);

    // Filter out entries with undefined positions
    const validTrails = trails.filter((trail) => trail.position);

    // Initialize the map with valid trails
    initMap(validTrails);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Your existing parsing function
function parseCSV(csv) {
  // Replace this with your actual CSV parsing logic
  // This is your provided parsing function
  const rows = csv.split('\n');
  const header = rows[0].split(',');

  return rows.slice(1).map((row) => {
    const values = row.split(',');
    const obj = {};

    for (let i = 0; i < header.length; i++) {
      const headerKey = header[i].trim(); // Trim extra spaces
      obj[headerKey] = (headerKey === 'lat' || headerKey === 'lng')
        ? parseFloat(values[i])
        : values[i];
    }

    return obj;
  });
}

// Function to initialize the map
async function initMap(trails) {
  // Your existing map initialization code here
  const { Map } = await google.maps.importLibrary('maps');
  const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');
  const center = { lat: 28.216984195129687, lng: -81.48471842669254 };
  const map = new Map(document.getElementById('map'), {
    zoom: 7,
    center,
    mapId: '938d538613c03fe6',
  });

  infoWindow = new google.maps.InfoWindow();

  // Create an array to hold standard Google Maps markers
  const markerElements = [];
  const markers = trails.map((trail) => {
    // Your existing marker creation logic here
    const iconSize = new google.maps.Size(35, 50); // Adjust the size based on your preference
    const iconAnchor = new google.maps.Point(iconSize.width / 2, iconSize.height / 1);

    const marker = new google.maps.Marker({
      position: trail.position,
      map: map,
      title: trail.description,
      icon: {
        // Your existing icon configuration here
        url: 'https://i.imgur.com/w7drtat.png',
        scaledSize: iconSize,
        anchor: iconAnchor,
      },
      optimized: true,
      zIndex: 1,
    });

    google.maps.event.addListener(marker, 'click', () => {
      if (!isMarkerClicked) {
        toggleHighlight(map, marker, trail);
        infoWindow.setContent(buildContent(trail));
        infoWindow.open(map, marker);
      }
    });

    markerElements.push(marker);

    return marker;
  });

  // Enable marker clustering with MarkerClusterer
  markerCluster = new MarkerClusterer(map, markerElements, {
    gridSize: 25,
    imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
    minimumClusterSize: 2,
    zoomOnClick: true,
  });

  google.maps.event.addListener(map, 'click', () => {
    isMarkerClicked = false;
    infoWindow.close();
  });

  google.maps.event.addListener(markerCluster, 'clusterclick', (event) => {
    isMarkerClicked = true;
  });
}

// Function to toggle marker highlight
function toggleHighlight(map, marker, trail) {
  if (marker) {
    infoWindow.setContent(buildContent(trail));
    infoWindow.open(map, marker);
  } else {
    console.error('Invalid marker:', marker);
  }
}

// Function to build content for info window
function buildContent(trail) {
  const infoWindowContent = `
    <div class="info-window-content">
        <div class="icon">
            <i aria-hidden="true" class="fa fa-icon fa-${trail.type}" title="${trail.type}"></i>
            <span class="fa-sr-only">${trail.type}</span>
        </div>
        <div class="details">
            <h3>${trail.description}</h3>
            <p>${trail.address}</p>
            <div class="features">
                <div>
                    <i aria-hidden="true" class="fa fa-ruler fa-lg ruler" title="length"></i>
                    <span class="fa-sr-only">length</span>
                    <span>${trail.length} mile</span>
                </div>
                <div>
                    <i aria-hidden="true" class="fa fa-stairs fa-lg stairs" title="difficulty"></i>
                    <span class="fa-sr-only">difficulty</span>
                    <span>${trail.difficulty}</span>
                </div>
                <div>
                    <i aria-hidden="true" class="fa fa-clock fa-lg clock" title="time"></i>
                    <span class="fa-sr-only">time</span>
                    <span>${trail.time} hour</span>
                </div>
            </div>
        </div>
    </div>
  `;

  return infoWindowContent;
}

// Call the function to fetch and process the CSV file
fetchAndProcessCSV();
