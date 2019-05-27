console.log(localStorage);

{/////////////////////////////////////////////////// PARAMETRES DE L'API LEAFLET ///////////////////////////////////////////////////

// https://api.jcdecaux.com/vls/v1/stations?contract=lyon&apiKey=74d859ca150a0d64898b62eefd0255bc6f7704fa

class customMap {
  constructor(mapId) {
    this.mymap = L.map(mapId).setView([45.76, 4.86], 12.5);
    L.tileLayer(
      // ajout du fond
      "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYmFrb3VuIiwiYSI6ImNqdmNibnpqNDAxbDkzeW8zZnhtcmh0bGoifQ.Vj39v0WupOBNhy5r22UXyA",
      {
        maxZoom: 16,
        id: "mapbox.streets"
      }
    ).addTo(this.mymap);

    this.velovIcon = L.Icon.extend({
      options: {
        shadowUrl: "images/ombre.png",
        iconSize: [30, 30],
        shadowSize: [30, 30],
        iconAnchor: [15, 28],
        shadowAnchor: [13, 26],
        popupAnchor: [0, -35]
      }
    });
    
    this.redIcon = new this.velovIcon({iconUrl: "images/velovRouge.png"});

    this.cluster = L.markerClusterGroup();
    this.selectedStation;
    self = this;
    this.zoom=this.mymap.getZoom();
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
            document.getElementById("mapid").style.flex = "0 0 65%";
            if ((localStorage.getItem("nomUser") && localStorage.getItem("prenomUser")) !== null ) {
              document.getElementById("nom").value = localStorage.getItem("nomUser");
              document.getElementById("prenom").value = localStorage.getItem("prenomUser");
            }
            self.mymap.invalidateSize();
            self.mymap.setView([(velo.position.lat), (velo.position.lng)], (self.mymap.getZoom()+1));
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
						localStorage.setItem("nomUser", document.getElementById("nom").value);
						localStorage.setItem("prenomUser", document.getElementById("prenom").value);
						localStorage.setItem("adresseStation",self.selectedStation.address);
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
/////////////////////////////////////////////////// GESTION DES RESERVATIONS ///////////////////////////////////////////////////
	var timer;
	if ((localStorage.getItem("timerSecondes") === null) || (localStorage.getItem("timerMinutes") === null)){
		var timerMinutes = 20;
		var timerSecondes = 0;
	} else 
	{
		var timerMinutes = localStorage.getItem("timerMinutes");
		var timerSecondes = localStorage.getItem("timerSecondes");
	}
	let reservBtn = document.getElementById("reserverBtn");
  localStorage.setItem("resaInnerHtml", "<p class=\"mx-auto\">Votre vélo à bien été réservé au nom de <b> <span id=\"nomUser\"></span> <span id=\"prenomUser\"></span></b> à l\'adresse suivante : \r\n <i><span id=\"adresseStation\"></span></i> Il restera disponible pendant encore <b><span id=\"minuteur\"></span></b> minutes.</p>");
  if (localStorage.getItem("isReserved") === null) {localStorage.setItem("isReserved", "false");}
	

	if (localStorage.getItem("isReserved") === "false")	{
		reservBtn.addEventListener("click", function(e) {reservation()});
	}	else if	(localStorage.getItem("isReserved") === "true") {
		fillResaInfos();
		initModal();
		timer = setInterval(function(){	timerReserv()	},1000);
		document.getElementById("newReservationBtn").addEventListener("click", function(e) {
		reservation();
	});
	}
	
	function fillResaInfos ()
	{
		document.getElementById("infosReservation").innerHTML = `${localStorage.getItem("resaInnerHtml")}`;
		document.getElementById("prenomUser").innerHTML = localStorage.getItem("prenomUser");
		document.getElementById("nomUser").innerHTML = localStorage.getItem("nomUser");
		document.getElementById("adresseStation").innerHTML = localStorage.getItem("adresseStation");
		if ((localStorage.getItem("timerSecondes") !== null) && (localStorage.getItem("timerMinutes") !== null)){
			var timerMinutes = localStorage.getItem("timerMinutes");
			var timerSecondes = localStorage.getItem("timerSecondes");
		}
	}
	
	function timerReserv() {
		if (timerSecondes === 0 && timerMinutes === 0) {
			clearInterval(timer);
			localestorage.setItem("isReserved", "false");
			document.getElementById("infosReservation").innerHTML = `<p class="mx-auto"><b>Votre réservation a expiré ! Vous pouvez reserver un Vélo'v à nouveau en cliquant sur une des stations.</b></p>`;
		} else if (timerSecondes > 0) {
			timerSecondes--;
			localStorage.setItem("timerSecondes", timerSecondes);
			document.getElementById("minuteur").innerHTML = `${timerMinutes}:${timerSecondes}`;
		} else if (timerSecondes === 0) {
			timerSecondes = 59;
			timerMinutes--;
			localStorage.setItem("timerSecondes", timerSecondes);
			localStorage.setItem("timerMinutes", timerMinutes);
			console.log("timerSecondes = " + timerSecondes);
			document.getElementById("minuteur").innerHTML = `${timerMinutes}:${timerSecondes}`;
		}
	}

  function reservation() {
		timerMinutes = 20;
		timerSecondes = 0;
		if(timer){clearInterval(timer)};
		if (signTest > 30) {
			document.getElementById("erreur").classList.add("hidden");
			document.getElementById("signatureDiv").classList.add("hidden");
			timer = setInterval(timerReserv, 1000);
			document.getElementById("erreur").innerHTML = "";
			fillResaInfos();
			localStorage.setItem("isReserved", "true");
		} else {
			document.getElementById("erreur").classList.remove("hidden");
			document.getElementById("erreur").innerHTML =
				"Veuillez signer s'il vous plait !";
		}
  }
  
  function scrollBottom() {
    window.scrollTo(0, document.body.scrollHeight);
	}
	
	function initModal() {
		let dataToggleAttr = document.createAttribute("data-toggle");
		dataToggleAttr.value = "modal"; //modal d'avertissement 
		reservBtn.setAttributeNode(dataToggleAttr);
	}

	document.getElementById("closeResa").addEventListener("click", function(e) {
  document.getElementById("mapid").style.flex = "0 0 100%";
  });
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
          self.playPauseBtn.classList.remove("fa-pause");
          self.playPauseBtn.classList.add("fa-play");
        }
        else if (self.play === true)
        {
          self.playPauseBtn.classList.remove("fa-play");
          self.playPauseBtn.classList.add("fa-pause");
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