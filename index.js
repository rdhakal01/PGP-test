let markerCluster; // Declare the variable outside of the async function
let infoWindow;
let trails;
let isMarkerClicked = false;

// Function to fetch data from Google Cloud Storage
async function fetchDataFromStorage() {
  try {
    // Replace 'bucketName' and 'fileName' with your actual bucket name and CSV file name
    const bucketName = 'pgp-csv-bucket';
    const fileName = 'FloridaHikes.csv';

    // Get the CSV file from Google Cloud Storage
    const [file] = await storage.bucket(bucketName).file(fileName).download();

    // Parse the CSV data
    const csvData = file.toString(); // Assuming CSV data is stored as a string
    // Implement CSV parsing logic here if needed

    // Return the parsed data
    return csvData;
  } catch (error) {
    console.error('Error fetching data from Google Cloud Storage:', error);
    return [];
  }
}

async function initMap() {
  try {
    // Request needed libraries.
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    const center = { lat: 28.216984195129687, lng: -81.48471842669254 };
    const map = new Map(document.getElementById("map"), {
      zoom: 7,
      center,
      mapId: "938d538613c03fe6",
    });

    // Initialize CORS headers
    const corsHeaders = new Headers();
    corsHeaders.append('Content-Type', 'application/json');
    corsHeaders.append('Access-Control-Allow-Origin', '*'); // Allow requests from any origin

    // Fetch data from Cloud Function
    const response = await fetch('https://flawless-snow-415416.cloudfunctions.net/authFun', {
      method: 'GET',
      headers: corsHeaders
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data from Cloud Function');
    }

    const trailsFromCloudFunction = await response.json();

    // Ensure that the global 'trails' variable is already populated by calling 'fetchData'
    if (!trails) {
      trails = trailsFromCloudFunction;
    } else {
      // Merge data from Cloud Function with existing trails
      trails = trails.concat(trailsFromCloudFunction);
    }

    // Create an array to hold standard Google Maps markers
    const markerElements = [];
    const markers = trails.map((trail) => {
      const marker = new google.maps.Marker({
        position: trail.position,
        map: map,
        title: trail.description,
        icon: 'https://i.imgur.com/w7drtat.png',
        optimized: true,
        zIndex: 1
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
  } catch (error) {
    console.error('Error initializing map:', error);
  }
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
