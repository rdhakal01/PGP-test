let markerCluster;
let infoWindow;
let trails;
let isMarkerClicked = false;

const { Storage } = require('@google-cloud/storage');

// Specify the path to your service account key JSON file
const keyFilePath = 'C:/Users/rdhak/TestFolder/flawless-snow-415416-28b42ecb7461.json';

// Specify the bucket name and file path
const bucketName = 'pgp-csv-bucket';
const fileName = 'FloridaHikes.csv';

// Initialize the Google Cloud Storage client with the service account key
const storage = new Storage({
  keyFilename: keyFilePath,
});

// Now you can use the 'storage' object to interact with Google Cloud Storage
// For example, to download a file
storage.bucket(bucketName).file(fileName).download({ destination: 'local-file.csv' }, (err) => {
  if (err) {
    console.error('Error downloading file:', err);
  } else {
    console.log('File downloaded successfully!');
  }
});


// Function to fetch and process the CSV file
async function fetchAndProcessCSV() {
  try {
    // Create a read stream for the CSV file
    const readStream = storage.bucket(bucketName).file(fileName).createReadStream();

    // Buffer to store CSV data
    let csvData = '';

    // Event handlers for stream events
    readStream
      .on('error', (err) => {
        console.error('Error reading file:', err);
      })
      .on('data', (chunk) => {
        // Append each chunk of data to the buffer
        csvData += chunk.toString();
      })
      .on('end', () => {
        // Process the complete CSV data using your parsing function
        trails = parseCSV(csvData);

        // Filter out entries with undefined positions
        const validTrails = trails.filter((trail) => trail.position);

        // Now you can use the 'validTrails' array to create markers or perform other operations
        initMap();
      });
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
async function initMap() {
  // Your existing map initialization code here
    // Request needed libraries.
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  const center = { lat: 28.216984195129687, lng: -81.48471842669254 };
  const map = new Map(document.getElementById("map"), {
    zoom: 7,
    center,
    mapId: "938d538613c03fe6",


  });

/*
// Insert the testMarker code here
  const testMarker = new google.maps.Marker({
    position: { lat: 27.9485, lng: -82.29025 },
    map: map,
    title: 'Test Marker',
  });
*/

infoWindow = new google.maps.InfoWindow();



// Fetch data from CSV and create trails array
 // Ensure that the global 'trails' variable is already populated by calling 'fetchData'
  if (!trails) {
    trails = await fetchData();
  }
 

// console.log('Trails Data:', trails);

// console.log("Trails array:", trails);


  // Create an array to hold standard Google Maps markers
  const markerElements = [];
  const markers = trails.map((trail) => {
    // Your existing marker creation logic here
   const iconSize = new google.maps.Size(35, 50); // Adjust the size based on your preference
const iconAnchor = new google.maps.Point(iconSize.width / 2, iconSize.height / 1);
// const svgData = await getFontAwesomeSvgData();


    const marker = new google.maps.Marker({
      position: trail.position,
      map: map,
      title: trail.description,
      icon: {
        // Your existing icon configuration here
        // url: `data:image/svg+xml;base64,${btoa(svgData)}`,
           // scaledSize: new google.maps.Size(30, 30),
  url: 'https://i.imgur.com/w7drtat.png',
       // url: 'paws.png',
      scaledSize: iconSize,

// labelContent: '<i class="fa fa-map-pin fa-3x" style="color:rgba(153,102,102,0.8);"></i>',
       // labelAnchor: new google.maps.Point(iconSize.width / 2, iconSize.height),
       // labelClass: "custom-marker-label", // Add a custom CSS class for styling if needed


anchor: iconAnchor, // Set the anchor point

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



function toggleHighlight(marker, trail) {
    if (marker) {
        // If animation is not needed, you can remove these lines
        // marker.setAnimation(null);
        // infoWindow.close();

        // Replace the above lines with your logic or leave it empty if no action is needed
        // For example, you can directly open the info window without animation
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




// Call the function to fetch and process the CSV file
fetchAndProcessCSV();
