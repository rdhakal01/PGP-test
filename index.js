let markerCluster; // Declare the variable outside of the async function
let infoWindow;
let isMarkerClicked = false;

async function initMap() {
  try {
    const trails = await fetchData(); // Wait for data to be fetched

    // Create map and initialize markers
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 7,
      center: { lat: 28.216984195129687, lng: -81.48471842669254 }
    });

    infoWindow = new google.maps.InfoWindow();

    const markerElements = trails.map((trail) => {
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

      return marker;
    });

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
  } catch (error) {
    console.error('Error fetching or parsing data:', error);
    // Handle errors gracefully (e.g., display an error message)
  }
}

async function fetchData() {
  try {
    const csvResponse = await fetch('https://us-central1-flawless-snow-415416.cloudfunctions.net/proxyRequest');
    if (!csvResponse.ok) {
      throw new Error('Network response was not ok.');
    }
    const csvData = await csvResponse.text();
    const parsedData = parseCSV(csvData);
    const trails = parsedData.map((trail) => {
      const defaultTrail = {
        address: '',
        description: 'Unknown',
        type: 'Unknown',
        length: 0,
        difficulty: 'Unknown',
        time: 'Unknown',
        position: undefined,
      };
      if (trail.lat && trail.lng) {
        defaultTrail.position = {
          lat: parseFloat(trail.lat),
          lng: parseFloat(trail.lng),
        };
      }
      return { ...defaultTrail, ...trail };
    });
    const validTrails = trails.filter((trail) => trail.position);
    return validTrails;
  } catch (error) {
    console.error('Error fetching data:', error);
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


initMap();
