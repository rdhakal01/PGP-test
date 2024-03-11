let markerCluster; // Declare the variable outside of the async function
let infoWindow;
let trails;
let isMarkerClicked = false;

async function initMap() {
  // Request needed libraries.
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  const center = { lat: 28.216984195129687, lng: -81.48471842669254 };
  const map = new Map(document.getElementById("map"), {
    zoom: 7,
    center,
    mapId: "938d538613c03fe6",
  });

  infoWindow = new google.maps.InfoWindow();

  // Fetch data from CSV and create trails array
  // Ensure that the global 'trails' variable is already populated by calling 'fetchData'
  if (!trails) {
    trails = await fetchData();
  }

  // Create an array to hold standard Google Maps markers
  const markerElements = [];
  const markers = trails.map((trail) => {
    const iconSize = new google.maps.Size(35, 50); // Adjust the size based on your preference
    const iconAnchor = new google.maps.Point(iconSize.width / 2, iconSize.height / 1);
    const marker = new google.maps.Marker({
      position: trail.position,
      map: map,
      title: trail.description,
      icon: {
        url: 'https://i.imgur.com/w7drtat.png',
        scaledSize: iconSize,
        anchor: iconAnchor,
      },
      optimized: true,
      zIndex: 1,
    });

    google.maps.event.addListener(marker, "click", () => {
      if (!isMarkerClicked) {
        toggleHighlight(marker, trail);
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

async function fetchData() {
  try {
    // Replace 'your-cloud-function-url' with the actual Cloud Function URL
    const url = 'https://us-central1-flawless-snow-415416.cloudfunctions.net/generateSignedUrl';
    const response = await fetch(url);
    const data = await response.text();

    // Parse CSV data (use a library or implement your own parser)
    const parsedData = parseCSV(data);

    // Create trails array dynamically with default values for missing or invalid entries
    const trails = parsedData.map((trail) => {
      const defaultTrail = {
        address: '',
        description: 'Unknown',
        type: 'Unknown',
        length: 0,
        difficulty: 0,
        time: 0,
        position: undefined, // Set position to undefined initially
      };

      // Check if lat and lng exist and are valid
      if (trail.lat && trail.lng) {
        defaultTrail.position = {
          lat: parseFloat(trail.lat),
          lng: parseFloat(trail.lng),
        };
      }

      return { ...defaultTrail, ...trail };
    });

    // Filter out entries with undefined positions
    const validTrails = trails.filter((trail) => trail.position);

    return validTrails;
  } catch (error) {
    console.error('Error fetching or parsing data:', error);
    return [];
  }
}

function parseCSV(csv) {
  // Implement your CSV parsing logic here
  // This is a simple example, adjust based on your CSV structure
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

function toggleHighlight(marker, trail) {
  if (marker) {
    infoWindow.setContent(buildContent(trail));
    infoWindow.open(map, marker);
  } else {
    console.error('Invalid marker:', marker);
  }
}

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

initMap();
