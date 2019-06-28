// James Dietz
// HW 17

// APIs for GeoJsons

var urlUSGS = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var urlPlates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";



// earthquakes layer includes the markers and the popups

function circleRadius(magnitude) {
    return magnitude * 5;
};


var earthquakes = new L.LayerGroup();

d3.json(urlUSGS, function (createFeatures) {
    L.geoJSON(createFeatures.features, {
        pointToLayer: function (marker, latlng) {
            return L.circleMarker(latlng, { radius: circleRadius(marker.properties.mag) });
        },

        style: function (createFeatures) {
            return {
                fillColor: Color(createFeatures.properties.mag),
                fillOpacity: 0.8,
                weight: 0.1,
                color: 'none'

            }
        },

        onEachFeature: function (feature, layer) {
            layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
        }
    }).addTo(earthquakes);
    createMap(earthquakes);
});

// circle marker colors (also used for legend)
  
function Color(magnitude) {
  if (magnitude > 6) {
      return '#500000'
  } else if (magnitude > 5) {
    return '#800000'
  } else if (magnitude > 4) {
      return '#FF0000'
  } else if (magnitude > 3) {
      return 'darkorange'
  } else if (magnitude > 2) {
      return 'gold'
  } else if (magnitude > 1) {
      return 'yellow'
  } else {
      return 'lightyellow'
  }
};


// plate layer:  adding tectonic plate line strings


var lineStyle = {
  "color": "#6960EC",
  "weight": 3,
  "opacity": 0.65
};

var plateLayer = new L.LayerGroup();

d3.json(urlPlates, function (createFeatures) {
  L.geoJSON(createFeatures.features, {
        style: lineStyle

    }).addTo(plateLayer);
  })



function createMap(earthquakes) {

  // definition of tilelayers

  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // definition of baseMaps object to hold base layers

  var baseMaps = {
    "Light Map": lightmap,
    "Satellite Map": satellitemap,
    "Dark Map": darkmap
  };

  // overlay object to hold overlay layers of earthquakes and plates

  var overlayMaps = {
    Earthquakes: earthquakes,
    Faults: plateLayer
  };

  // actual map and location, zoom level and layer specifications

  var myMap = L.map("map", {
    center: [
      32.09, -95.71
    ],
    zoom: 3,
    layers: [satellitemap, earthquakes, plateLayer]
  });

  

  // layer control
  
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  
  // legend

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        magnitude = [0, 1, 2, 3, 4, 5, 6],
        labels = [];

   

    // loop through magnitude density intervals and generate a label with a colored square for each interval

    for (var i = 0; i < magnitude.length; i++) {
        div.innerHTML += 
            '<i style="background:' + Color(magnitude[i] + 1) + '"></i> ' +
            magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);

}


