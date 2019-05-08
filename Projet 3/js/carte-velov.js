console.log('linked!');

// https://api.jcdecaux.com/vls/v1/stations?contract=lyon&apiKey=74d859ca150a0d64898b62eefd0255bc6f7704fa
var mymap = L.map('mapid').setView([45.76, 4.86], 12.5); // variable les réglages de la map

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
        iconAnchor:   [15, 28],
        shadowAnchor: [13, 26],
        popupAnchor:  [0, -35]
    }
});

var greenIcon = new velovIcon({iconUrl: '../images/velovVert.png'}),
    redIcon = new velovIcon({iconUrl: '../images/velovRouge.png'}),
    orangeIcon = new velovIcon({iconUrl: '../images/velovOrange.png'});

    ajaxGet("https://api.jcdecaux.com/vls/v1/stations?contract=lyon&apiKey=74d859ca150a0d64898b62eefd0255bc6f7704fa", function (reponse){
        var listevelos = JSON.parse(reponse);
        for (velo of listevelos)
        {
            let stationIcon = L.marker([velo.position.lat, velo.position.lng], {icon:redIcon}).addTo(mymap);
            let nb_velo = velo.available_bikes;
            let nb_places = velo.bike_stands;
            let nom_velo = velo.name.split('- ');
            let reservationElt = document.getElementById('reservation');
            let infosElt = document.getElementById('infos');
            stationIcon.addEventListener("click", function(e){
                infosElt.textContent = `station : ${nom_velo[1]}. \r\n
                Il reste ${nb_velo} vélos sur les ${nb_places} places disponibles`;
            })
        }
    });
