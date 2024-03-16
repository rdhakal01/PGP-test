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
  const iconSize = new google.maps.Size(35, 50); // Adjust the size based on your preference
const iconAnchor = new google.maps.Point(iconSize.width / 2, iconSize.height / 1);
// const svgData = await getFontAwesomeSvgData();
  const marker = new google.maps.Marker({
    position: trail.position,
    map: map,
    title: trail.description,
    icon: {


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
    optimized: true, // Disable marker optimization
    zIndex: 1, // Ensure markers are above other elements

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

/*
async function getFontAwesomeSvgData() {
    const response = await fetch('https://api.fontawesome.com/v5/svg/icons/map-pin-solid.svg');
    const svgData = await response.text();
    return svgData;
}
*/

// Enable marker clustering with MarkerClusterer
markerCluster = new MarkerClusterer(map, markerElements, {
  gridSize: 25, // Adjust the gridSize based on your preference
  imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
  minimumClusterSize: 2, // Set the minimum number of markers to form a cluster
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
// const csvUrl = 'https://drive.google.com/uc?export=download&id=1Evj-TsTB6w9WQEocbmIXtlQ1-uwk6OoL';
//const response = await fetch(csvUrl);
    const response = await fetch('FloridaHikes.csv');
   const data = await response.text();

// const token = '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';  // Replace with your actual personal access token
   // const url = `https://raw.githubusercontent.com/rdhakal01/PGP-CSV/main/FloridaHikes.csv?token=${token}`;
 // const response = await fetch(url);
    // const data = await response.text();

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









/*
function buildContent(trail) {

console.log("Build content called:", trail);
  const content = document.createElement("div");

  content.classList.add("trail");
  content.innerHTML = `
    <div class="icon">
        <i aria-hidden="true" class="fa fa-icon fa-${trail.type}" title="${trail.type}"></i>
        <span class="fa-sr-only">${trail.type}</span>
    </div>
    <div class="details">
        <div class="description">${trail.description}</div>
        <div class="address">${trail.address}</div>
        <div class="features">
        <div>
            <i aria-hidden="true" class="fa fa-ruler fa-lg ruler" title="length"></i>
            <span class="fa-sr-only">length</span>
            <span>${trail.length} mile</span></span>
        </div>
        <div>
            <i aria-hidden="true" class="fa fa-stairs fa-lg stairs" title="difficulty"></i>
            <span class="fa-sr-only">difficulty</span>
            <span>${trail.difficulty}</span>
        </div>
        <div>
            <i aria-hidden="true" class="fa fa-clock fa-lg clock" title="time"></i>
            <span class="fa-sr-only">time</span>
            <span>${trail.time} hour</sup></span>
        </div>
        </div>
    </div>
    `;
  return content;
}

*/

initMap();
