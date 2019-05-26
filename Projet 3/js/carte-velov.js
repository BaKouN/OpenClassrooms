{/////////////////////////////////////////////////// PARAMETRES DE L'API LEAFLET ///////////////////////////////////////////////////

// https://api.jcdecaux.com/vls/v1/stations?contract=lyon&apiKey=74d859ca150a0d64898b62eefd0255bc6f7704fa

class customMap {
  constructor(mapId) {
    this.mymap = L.map(mapId).setView([45.76, 4.86], 12.5);
    L.tileLayer(
      // ajout du fond
      "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYmFrb3VuIiwiYSI6ImNqdmNibnpqNDAxbDkzeW8zZnhtcmh0bGoifQ.Vj39v0WupOBNhy5r22UXyA",
      {
        maxZoom: 16.5,
        id: "mapbox.streets"
      }
    ).addTo(this.mymap);

    this.velovIcon = L.Icon.extend({
      options: {
        shadowUrl: "../images/ombre.png",
        iconSize: [30, 30],
        shadowSize: [30, 30],
        iconAnchor: [15, 28],
        shadowAnchor: [13, 26],
        popupAnchor: [0, -35]
      }
    });
    
    this.redIcon = new this.velovIcon({iconUrl: "../images/velovRouge.png"});

    this.cluster = L.markerClusterGroup();
    this.selectedStation;
    self = this;
    this.zoom=this.mymap.getZoom();
    console.log(this.zoom);
    ajaxGet(
      "https://api.jcdecaux.com/vls/v1/stations?contract=lyon&apiKey=74d859ca150a0d64898b62eefd0255bc6f7704fa",
      function(reponse) {
        var listevelos = JSON.parse(reponse);
        let formElt = document.querySelector("form"); //  Séléction des Elts à travers le DOM
        let infosElt = document.getElementById("infos"); // *************
        for (let velo of listevelos) {
          let stationIcon = L.marker([velo.position.lat, velo.position.lng], {
            icon: self.redIcon
          }); // Création des marqueurs
          self.cluster.addLayer(stationIcon); // ajout au plugin MarkerCluster

          stationIcon.addEventListener("click", function(e) {
            // Fonction affichant info + formulaire réservation
              self.mymap.setView([(velo.position.lat), (velo.position.lng+(0.021/(self.mymap.getZoom()-12)))], (self.mymap.getZoom()+1));
              document.getElementById("mapid").style.flex = "0 0 65%";
            self.selectedStation = velo;
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
              self.selectedStation.available_bikes > 0 &&
              self.selectedStation.status === "OPEN"
            ) {
              document.getElementById("erreur").innerHTML = "";
              document.getElementById("signatureDiv").classList.remove("hidden");
              clearCanvas();
            } else if (self.selectedStation.available_bikes === 0) {
              document.getElementById("erreur").classList.remove("hidden");
              document.getElementById("erreur").innerHTML =
                "Station vide ! Vous ne pouvez pas réserver de vélo !";
            } else if (self.selectedStation.status !== "OPEN") {
              document.getElementById("erreur").classList.remove("hidden");
              document.getElementById("erreur").innerHTML =
                "Station indisponible ! Veuillez en choisir une autre !";
            }
          };
          formElt.addEventListener("submit", testStation);
        }
      }
    );

    this.mymap.addLayer(this.cluster); // Ajout des clusters à la map;
  }
}

var mapLyon = new customMap("mapid");
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
							<i>${self.selectedStation.address}.</i> Il restera disponible pendant encore <b><span id="minuteur">${timerMinutes}:${formattedTimerSecondes}</span></b> minutes.</p>`;
					
					isReserved = true;
				} else {
					document.getElementById("erreur").classList.remove("hidden");
					document.getElementById("erreur").innerHTML =
						"Veuillez signer s'il vous plait !";
				}
}
}
{/////////////////////////////////////////////////// DIAPORAMA ///////////////////////////////////////////////////
class diapo {
  constructor(containerElt, bouttonPlayElt){
    this.target = containerElt;
    var self = this;
    this.slideIndex = 1;
    this.play = true;
    this.carousel = setInterval(function() {self.plusSlides(1);}, 5000);
    this.playPauseBtn = bouttonPlayElt;
    this.slides = this.target.getElementsByClassName("diapo");

    this.showSlides(this.slideIndex);
    this.initEventListeners();
  }

currentSlide(n) {
    this.showSlides((this.slideIndex = n));
  }

plusSlides(n) {
		this.showSlides((this.slideIndex += n));
}

showSlides(n) {
    var i;
    if (n > this.slides.length) {
      this.slideIndex = 1;
    }
    if (n < 1) {
      this.slideIndex = this.slides.length;
    }
    for (i = 0; i < this.slides.length; i++) {
      this.slides[i].style.display = "none";
    }
    this.slides[this.slideIndex - 1].style.display = "block";
  }

initEventListeners() {
      var self = this;
      this.playPauseBtn.addEventListener("click", function(e){
        self.play = !self.play;
        if(self.play === false){
          clearInterval(self.carousel);
          self.playPauseBtn.classList.remove("fa-play");
          self.playPauseBtn.classList.add("fa-pause");
        }
        else if (self.play === true)
        {
          self.playPauseBtn.classList.remove("fa-pause");
          self.playPauseBtn.classList.add("fa-play");
          self.carousel = setInterval(function() {self.plusSlides(1);}, 5000);
        }
      });

    document.addEventListener("keydown", function(e) {
      if (e.keyCode === 37) {
        //press Left
        self.plusSlides(-1);
      }
      if (e.keyCode === 39) {
        //press Right
        self.plusSlides(1);
      }
    });

    document.getElementById('prev').addEventListener("click", function (e) {self.plusSlides(-1)});
    document.getElementById('next').addEventListener("click", function (e) {self.plusSlides(1)});
  }

}

var diapoVelov = new diapo (document.getElementById("diapoContainer"),document.getElementById("playPause"));
}