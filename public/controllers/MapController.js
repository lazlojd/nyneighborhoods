var app = angular.module('neighborhoods1.0', [])


app.controller('MapController', ['$scope', function($scope) {

	var map;
  	var openedInfoWindow;
  	var colors = [];
	var marker;
	var option;
	var chicago = {lat: 41.85, lng: -87.65};
	var options = {
	enableHighAccuracy: false,
	timeout: 5000,
	maximumAge: 0
	};


	function avgCoords(coords) {
		//console.log(coords);
		var latSum = 0, latCount = 0;
		var lngSum = 0, lngCount = 0;
		for (var data in coords) {
			latSum++;
			lngSum++;
			latCount += coords[data].lat;
			lngCount += coords[data].lng;
		}
	  return {lat: latCount/latSum, lng: lngCount/lngSum}
	}


	$scope.openSidebar = function w3_open(option) {
		console.log(option)
		option = option	
		document.getElementById("mySidebar").style.width = "25%";
		document.getElementById("mySidebar").style.display = "block";

	}


	$scope.closeSidebar = function w3_close() {

		document.getElementById("mySidebar").style.display = "none";

	}

	function CenterControl(controlDiv, map) {

		// Set CSS for the control border.
		var controlUI = document.createElement('div');
		controlUI.style.backgroundColor = '#fff';
		controlUI.style.border = '2px solid #fff';
		controlUI.style.borderRadius = '3px';
		controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
		controlUI.style.cursor = 'pointer';
		controlUI.style.marginBottom = '22px';
		controlUI.style.textAlign = 'center';
		controlUI.title = 'Click to open sidebar menu';
		controlDiv.appendChild(controlUI);

		// Set CSS for the control interior.
		var controlText = document.createElement('div');
		controlText.style.color = 'rgb(25,25,25)';
		controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
		controlText.style.fontSize = '16px';
		controlText.style.lineHeight = '38px';
		controlText.style.paddingLeft = '5px';
		controlText.style.paddingRight = '5px';
		controlText.innerHTML = 'Highlights';
		controlUI.appendChild(controlText);

		// Setup the click event listeners: simply set the map to Chicago.
		controlUI.addEventListener('click', function() {
			$scope.openSidebar(2);
		});

	}

	var addListeners = function(polygon, name) { 
		
		google.maps.event.addListener(polygon, 'click', function (event) {
		  	console.log("event activated")
		  	if (typeof(openedInfoWindow) !== "undefined")
		    	openedInfoWindow.close()
		    
			openedInfoWindow = new google.maps.InfoWindow({
				position: {lat: event.latLng.lat(), lng: event.latLng.lng()},
				name: name
			})

			var infoWindowContent = document.createElement('div');
			var infoWindowName = document.createElement('p');
			infoWindowName.textContent = name;
			var infoButton = document.createElement('button');
			infoButton.class = 'btn btn-success';
			infoButton.textContent = "Add Highlights"
			infoButton.addEventListener('click', function() {
				$scope.openSidebar(1);
			})
	 		infoWindowContent.appendChild(infoWindowName)
			infoWindowContent.appendChild(infoButton)

			openedInfoWindow.setContent(infoWindowContent)
			openedInfoWindow.open(map)
		})
	}


	$scope.init = (function () {
	'use strict';


	//Info window with name when location is tapped
	

	function drawNYNeighborhoods() {
		var coordinates = boroughedNeighborhoods;
		var hoods = Object.keys(boroughs);
		for (var area in coordinates) {
		    var borough = coordinates[area]
		    for(var neighborhood in borough) {
		       var data = borough[neighborhood];
		       colors.push(data.color)
		       var border = new google.maps.Polygon({
		          path: data.coords,
		          geodesic: true,
		          strokeColor: '#' + data.color,
		          strokeOpacity: 1.0,
		          strokeWeight: 2,
		          fillColor: '#' + data.color,
		          fillOpacity: 0.25
		        });
		        addListeners(border, neighborhood)
		        border.setMap(map)
		    }
		}  
	}


	function drawChicagoNeighborhoods() {
		var i = 0
		for (var neighborhood in chicagoNeighborhoods) {
		  //console.log(chicagoNeighborhoods[neighborhood])
		  var data = chicagoNeighborhoods[neighborhood]
		  var border =  new google.maps.Polygon({
		          path: data.coords,
		          geodesic: true,
		          strokeColor: '#' + colors[i],
		          strokeOpacity: 1.0,
		          strokeWeight: 2,
		          fillColor: '#' + colors[i],
		          fillOpacity: 0.25
		  });
		  i += 1
		  if (i >= colors.length)
		    i = 0
		  addListeners(border, neighborhood)
		  border.setMap(map)
		}
	}


	function initMap(x, y) {
	  map = new google.maps.Map(document.getElementById('map'), {
	    center: {lat: 41.826116, lng: -87.642111},
	    zoom: 13
	  });

	  marker = new google.maps.Marker({position: {lat: 41.826116, lng: -87.642111}, map: map});
	  beginPositionWatch()
		  drawNYNeighborhoods()
	  drawChicagoNeighborhoods()
	  var centerControlDiv = document.createElement('div');
	  var centerControl = new CenterControl(centerControlDiv, map);

	  centerControlDiv.index = 1;
	  map.controls[google.maps.ControlPosition.RIGHT_TOP].push(centerControlDiv);
	}


	function onPositionRecieved(position){
		var coords = position.coords;
		initMap(coords.latitude, coords.longitude);
	}


	function locationTrackNotRecieved(positionError){
		console.log("position tracking error: " + positionError);
	}

	function locationNotRecieved(positionError){
		console.log(positionError);
	}


	function watchCoordinatesRecieved(pos) {
		var coords = pos.coords
		marker.setPosition({lat: coords.latitude, lng: coords.longitude})
	}


	function beginPositionWatch() {
		navigator.geolocation.watchPosition(watchCoordinatesRecieved, locationTrackNotRecieved, options)
	}


	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(onPositionRecieved, locationNotRecieved);
	}


	}) ( ); 
	
}])
