// Create the tile layer that will be the background of our map.
var streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Initialize all the LayerGroups that we'll use.
var layers = {
  Quakes: new L.LayerGroup()
};

// Create the map with our layers.
var map = L.map("map", {
  center: [0.000, 0.000],
  zoom: 2.5,
  layers: [
    layers.Quakes
  ]
});

// Add our "streetmap" tile layer to the map.
streetmap.addTo(map);

// Create an overlays object to add to the layer control.
var overlays = {
  "Earthquakes": layers.Quakes
};

// Create a control for our layers, and add our overlays to it.
L.control.layers(null, overlays).addTo(map);

// Perform an call to retrieve the earthquake data for the month in json format.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(EarthquakeData) {

    console.log(EarthquakeData);

    let EarthquakeList = EarthquakeData.features;

    console.log(EarthquakeList[0]);

    for (var i = 0; i < EarthquakeList.length; i++) {

        var Earthquake = EarthquakeList[i];

        var depth = Earthquake.geometry.coordinates[2];


        // Anything deeper than 300, make a solid circle
        depthFill = depth/300 + .1;

        if (depthFill > 1) {depthFill = 1};

        // https://leafletjs.com/examples/choropleth/
        function getColor(depth) {
            return depth > 500 ? "#800026" :
                   depth > 400  ? "#BD0026" :
                   depth > 300  ? "#E31A1C" :
                   depth > 200  ? "#FC4E2A" :
                   depth > 100   ? "#FD8D3C" :
                              "#FEB24C";
        }
        
        var EarthquakeSize = (Earthquake.properties.mag * 50000)*Math.cos((Earthquake.geometry.coordinates[1]/180)*Math.PI)

        var newQuake = L.circle([Earthquake.geometry.coordinates[1],Earthquake.geometry.coordinates[0]], {
            color: 'black',
            weight: 1,
            fillColor: getColor(Earthquake.geometry.coordinates[2]),
            fillOpacity: .65,
            radius: EarthquakeSize
        });

        newQuake.addTo(layers.Quakes);

        newQuake.bindPopup(" Magnitude: " + Earthquake.properties.mag + 
                            "<br> Depth: " + depth +
                            "<br> Place: " + Earthquake.properties.place);
    };

//https://leafletjs.com/examples/choropleth/
     // Create a legend to display information about our map.
    var info = L.control({
        position: "bottomright"
    });
  
  // When the layer control is added, insert a div with the class of "legend".
    info.onAdd = function() {
        var div = L.DomUtil.create('div', 'info legend');
        grades = [0, 100, 200, 300, 400, 500];
        labels = ["#FEB24C","#FD8D3C","#FC4E2A","#E31A1C","#BD0026","#800026"];
  
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + labels[i] + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');  
        }
        return div;
    };
  // Add the info legend to the map.
    info.addTo(map);
});