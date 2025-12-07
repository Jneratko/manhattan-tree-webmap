var map = L.map('map').setView([40.77, -73.98], 13);
var geojson;
var legend = L.control({position: 'bottomright'});
var info = L.control();

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


//SYMBOLOGY
function getColor(health){
    return health == 'Good' ? '#24da0cff':
           health == 'Fair' ? '#c5da0cff':
           health == 'Poor' ? '#da0c0cff': '#FFFFFF';
}

function style(feature) {
    return {
      radius: 5,
      fillColor: getColor(feature.properties.health),
      color: "#000",
      weight: .5,
      opacity: 1,
      fillOpacity: 1    
};
}


//Highlight and Zoom

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7,
    weight: 5
});
    layer.bringToFront();
    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
    
}

function zoomToFeature(e) {
    map.setView(e.target.getLatLng(), 20);
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}


//Fetch GeoJSON

fetch('data/NYC_TreeCensus_2015.geojson')
  .then(response => response.json())
  .then(data => {
    geojson = L.geoJSON(data, {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, style(feature));
      },
      onEachFeature: onEachFeature
    }).addTo(map);
  });



legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = ['Good', 'Fair', 'Poor'];

       // Move it up from the bottom-right corner
    div.style.marginBottom = '100px'; // or whatever distance from bottom

    for (var i = 0; i < grades.length; i++) {
        // create a container div for each legend item
        var item = L.DomUtil.create('div', 'legend-item', div);

        // add the colored square
        var colorBox = L.DomUtil.create('i', '', item);
        colorBox.style.background = getColor(grades[i]);
        colorBox.style.width = '40px';
        colorBox.style.height = '40px';
        colorBox.style.display = 'inline-block';
        colorBox.style.marginRight = '10px';
        colorBox.style.verticalAlign = 'middle';

        // add the text
        var text = L.DomUtil.create('span', '', item);
        text.innerHTML = grades[i];
        text.style.verticalAlign = 'middle';
    }

    return div;
};

legend.addTo(map);

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

info.update = function(props) {
    this._div.innerHTML = `
        <h4>Tree Facts</h4>
        ${props ? `
            <ul style="list-style:none; padding:0; margin:0;">
                <li><strong>Species:</strong> ${props.spc_common}</li>
                <li><strong>Health:</strong> ${props.health}</li>
                <li><strong>Status:</strong> ${props.status}</li>
                <li><strong>Problems:</strong> ${props.problems || 'None'}</li>
            </ul>
        ` : 'Hover over a tree'}
    `;
};

info.addTo(map);

