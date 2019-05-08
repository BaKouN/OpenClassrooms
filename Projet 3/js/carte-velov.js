console.log('linked!');

// 74d859ca150a0d64898b62eefd0255bc6f7704fa  clé API JCDECAUX
var mymap = L.map('mapid').setView([45.76, 4.87], 12.5); // variable les réglages de la map

L.tileLayer( // ajout du fond
    'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYmFrb3VuIiwiYSI6ImNqdmNibnpqNDAxbDkzeW8zZnhtcmh0bGoifQ.Vj39v0WupOBNhy5r22UXyA', {
        maxZoom: 17,
        id: 'mapbox.streets'
    }).addTo(mymap);


var velovIcon = L.Icon.extend({
    options: {
        shadowUrl: '../images/ombre.png',
        iconSize:     [30, 30],
        shadowSize:   [30, 30],
        iconAnchor:   [15, 30],
        shadowAnchor: [13, 28],
        popupAnchor:  [-3, -76]
    }
});

var greenIcon = new velovIcon({iconUrl: '../images/velovVert.png'}),
    redIcon = new velovIcon({iconUrl: '../images/velovRouge.png'}),
    orangeIcon = new velovIcon({iconUrl: '../images/velovOrange.png'});

var marker = L.marker([45.75, 4.85]).addTo(mymap);
var marker2 = L.marker([45.76, 4.84]).addTo(mymap);
var marker3 = L.marker([45.77, 4.83], {icon: greenIcon}).addTo(mymap);
var marker4 = L.marker([45.74, 4.86], {icon: redIcon}).addTo(mymap);
var marker5 = L.marker([45.78, 4.87], {icon: orangeIcon}).addTo(mymap);

marker.bindPopup("<b>Reserver en deux clics</b><br>Cliquer ici!").openPopup();

marker.id = "marker";