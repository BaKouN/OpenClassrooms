{/////////////////////////////////////////////////// PARAMETRES DE L'API LEAFLET ///////////////////////////////////////////////////

// https://api.jcdecaux.com/vls/v1/stations?contract=lyon&apiKey=74d859ca150a0d64898b62eefd0255bc6f7704fa
var mymap = L.map("mapid").setView([45.76, 4.86], 12.5); // variable les réglages de la map

L.tileLayer(
  // ajout du fond
  "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYmFrb3VuIiwiYSI6ImNqdmNibnpqNDAxbDkzeW8zZnhtcmh0bGoifQ.Vj39v0WupOBNhy5r22UXyA",
  {
    maxZoom: 17,
    id: "mapbox.streets"
  }
).addTo(mymap);

var velovIcon = L.Icon.extend({
  options: {
    shadowUrl: "../images/ombre.png",
    iconSize: [30, 30],
    shadowSize: [30, 30],
    iconAnchor: [15, 28],
    shadowAnchor: [13, 26],
    popupAnchor: [0, -35]
  }
});

var greenIcon = new velovIcon({
    iconUrl: "../images/velovVert.png"
  }),
  redIcon = new velovIcon({
    iconUrl: "../images/velovRouge.png"
  }),
  orangeIcon = new velovIcon({
    iconUrl: "../images/velovOrange.png"
  });
}
{/////////////////////////////////////////////////// AFFICHAGE STATIONS VELO + FORMULAIRE DE RESERVATION ///////////////////////////////////////////////////
let cluster = L.markerClusterGroup();
var selectedStation;

ajaxGet(
  "https://api.jcdecaux.com/vls/v1/stations?contract=lyon&apiKey=74d859ca150a0d64898b62eefd0255bc6f7704fa",
  function(reponse) {
    var listevelos = JSON.parse(reponse);
    let formElt = document.querySelector("form"); //  Séléction des Elts à travers le DOM
    let infosElt = document.getElementById("infos"); // *************
    for (let velo of listevelos) {
      let stationIcon = L.marker([velo.position.lat, velo.position.lng], {
        icon: redIcon
      }); // Création des marqueurs
      cluster.addLayer(stationIcon); // ajout au plugin MarkerCluster

      stationIcon.addEventListener("click", function(e) {
        // Fonction affichant info + formulaire réservation
        selectedStation = velo;
        document.getElementById("erreur").innerHTML = "";
        formElt.classList.remove("hidden");
        infosElt.innerHTML = `<span class ="brand-font">Station :</span> ${
          velo.name.split("- ")[1]
        } \r\n
        <span class ="brand-font">Adresse</span> : ${velo.address} \r\n
                Il reste <b>${velo.available_bikes}</b> vélos sur les <b>${velo.bike_stands}</b> places disponibles`;

        document.getElementById("signatureDiv").classList.add("hidden");
        document.getElementById("erreur").classList.add("hidden");
      });

      formElt.removeEventListener("submit", testStation);
      var testStation = function(e) {
        e.preventDefault();
        if (
          selectedStation.available_bikes > 0 &&
          selectedStation.status === "OPEN"
        ) {
          document.getElementById("erreur").innerHTML = "";
					document.getElementById("signatureDiv").classList.remove("hidden");
					clearCanvas();
        } else if (selectedStation.available_bikes === 0) {
          document.getElementById("erreur").classList.remove("hidden");
          document.getElementById("erreur").innerHTML =
            "Station vide ! Vous ne pouvez pas réserver de vélo !";
        } else if (selectedStation.status !== "OPEN") {
          document.getElementById("erreur").classList.remove("hidden");
          document.getElementById("erreur").innerHTML =
            "Station indisponible ! Veuillez en choisir une autre !";
        }
      };
      formElt.addEventListener("submit", testStation);
    }
  }
);

mymap.addLayer(cluster); // Ajout des clusters à la map;
}
{/////////////////////////////////////////////////// GESTION DES RESERVATIONS ///////////////////////////////////////////////////

let isReserved = false;
var timer;
let reservBtn = document.getElementById("reserverBtn");
reservBtn.addEventListener("click", function(e) {
if (isReserved === false)
{
	reservation("reserverBtn");
}
else if (isReserved === true)
{
	let dataToggleAttr = document.createAttribute("data-toggle");
	dataToggleAttr.value = "modal";
	reservBtn.setAttributeNode(dataToggleAttr);
	document.getElementById("newReservationBtn").addEventListener("click", function(e){
		document.getElementById("infosReservation").innerHTML="";
		reservation("newReservationBtn");
	});
}
});

function reservation(){
		if(timer){clearInterval(timer);}
		let timerMinutes = 20;
		let timerSecondes = 0;
		let nomUser = document.getElementById("nom").value;
		let prenomUser = document.getElementById("prenom").value;
		console.log(timer);
				if (signTest > 30) {
					document.getElementById("erreur").classList.add("hidden");
					document.getElementById("signatureDiv").classList.add("hidden");
					timer = setInterval(timerReserv, 1000);
					function timerReserv() {
						if (timerSecondes === 0 && timerMinutes === 0) {
							clearInterval(timer);
						} else if (timerSecondes > 0) {
							timerSecondes--;
							let formattedTimerSecondes = timerSecondes.toLocaleString(undefined, {
								minimumIntegerDigits: 2
							});
							document.getElementById("minuteur").innerHTML = `${timerMinutes}:${formattedTimerSecondes}`;
						} else if (timerSecondes === 0) {
							timerSecondes = 59;
							timerMinutes--;
							document.getElementById("minuteur").innerHTML = `${timerMinutes}:${timerSecondes}`;
						}
					}
	
					let formattedTimerSecondes = timerSecondes.toLocaleString(undefined, {minimumIntegerDigits: 2});
	
					document.getElementById("erreur").innerHTML = "";
					document.getElementById("infosReservation").innerHTML = `<p class="mt-3 mx-auto">Votre vélo à bien été réservé au nom de <b> ${nomUser} ${prenomUser} </b> à l'adresse suivante : \r\n
							<i>${selectedStation.address}.</i> Il restera disponible pendant encore <b><span id="minuteur">${timerMinutes}:${formattedTimerSecondes}</span></b> minutes.</p>`;
					
					isReserved = true;
				} else {
					document.getElementById("erreur").classList.remove("hidden");
					document.getElementById("erreur").innerHTML =
						"Veuillez signer s'il vous plait !";
				}
}
}
{/////////////////////////////////////////////////// DIAPORAMA ///////////////////////////////////////////////////

var slideIndex = 1;
showSlides(slideIndex);
let play = true;
let carousel = setInterval(function() {plusSlides(1);}, 5000);
let playPauseBtn = document.getElementById("playPause");


playPauseBtn.addEventListener("click", function(e){
  play = !play;
  if(play === false){
    clearInterval(carousel);
    playPauseBtn.classList.remove("fa-play");
    playPauseBtn.classList.add("fa-pause");
  }
  else if (play === true)
  {
    playPauseBtn.classList.remove("fa-pause");
    playPauseBtn.classList.add("fa-play");
    carousel = setInterval(function() {plusSlides(1);}, 5000);
  }
});

function plusSlides(n) {
		showSlides((slideIndex += n));
}

document.addEventListener("keydown", function(e) {
  if (e.keyCode === 37) {
    //press Left
    plusSlides(-1);
  }
  if (e.keyCode === 39) {
    //press Right
    plusSlides(1);
  }
});

function currentSlide(n) {
  showSlides((slideIndex = n));
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("diapo");
  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slides[slideIndex - 1].style.display = "block";
}



}