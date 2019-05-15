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

let cluster = L.markerClusterGroup();
let selectedStation;

    ajaxGet("https://api.jcdecaux.com/vls/v1/stations?contract=lyon&apiKey=74d859ca150a0d64898b62eefd0255bc6f7704fa", function (reponse){
        var listevelos = JSON.parse(reponse);
        let formElt = document.querySelector('form'); //  Séléction des Elts à travers le DOM
        let infosElt = document.getElementById('infos'); // *************

        for (let velo of listevelos)
        {
            let stationIcon = L.marker([velo.position.lat, velo.position.lng], {icon:redIcon}); // Création des marqueurs
            cluster.addLayer(stationIcon); // ajout au plugin MarkerCluster

            stationIcon.addEventListener("click", function(e){ // Fonction affichant info + formulaire réservation
                selectedStation = velo;
                document.getElementById('erreurStation').innerHTML= '';
                formElt.classList.remove('hidden');
                infosElt.textContent = `station : ${velo.name.split('- ')[1]} \r\n
                adresse : ${velo.address} \r\n
                Il reste ${velo.available_bikes} vélos sur les ${velo.bike_stands} places disponibles`;

                document.getElementById('signatureDiv').classList.add('hidden');
            });

            formElt.removeEventListener("submit", testStation);
            var testStation = function(e)
            {
                console.log("test");
                e.preventDefault();
                if (selectedStation.available_bikes > 0 && selectedStation.status === "OPEN") {
                    document.getElementById('erreurStation').innerHTML= '';
                    document.getElementById('signatureDiv').classList.remove('hidden');
                }
                else if (selectedStation.available_bikes === 0) {
                    document.getElementById('erreurStation').innerHTML= 'Station vide ! Vous ne pouvez pas réserver de vélo !';
                }
                else if (selectedStation.status !== "OPEN") {
                    document.getElementById('erreurStation').innerHTML= 'Station indisponible ! Veuillez en choisir une autre !';
                }
            }
            formElt.addEventListener("submit",testStation);

        }
    });



    mymap.addLayer(cluster); // Ajout des clusters à la map;