var app = angular.module('neighborhoods1.0', [])




app.controller('MapController', ['$scope', '$http', function($scope, $http) {

	var map;
  	var openedInfoWindow;
  	var colors = [];
	var marker;
	var userInfo;
	var authResponse;
	const url = 'http://localhost:9000/api'	
	$scope.openName;
	$scope.highlights;
	$scope.allHighlights;
	$scope.formData = {};
	$scope.loggedIn = false;
	$scope.option = 2;
	var chicago = {lat: 41.85, lng: -87.65};
	var options = {
	enableHighAccuracy: false,
	timeout: 5000,
	maximumAge: 0
	};

	$scope.logOut = function() {
		FB.getLoginStatus(function(response) {
			if (response && response.status === 'connected') {
				FB.logout(function(response) {
					alert("You have been logged out.")
					$scope.loggedIn = false;
					$scope.highlights = [];
					authResponse = undefined
					document.getElementById("fbButton").style.display = "block";   
                    document.getElementById("closeModal").style.display = "none";
					$scope.$apply();
				})
			}
		})
	}

	/*
	*
	* Check log in status and update login state
	*
	*/
	function checkLoginStatus() {
		var result;
		console.log("enered 2")
		FB.getLoginStatus(function(response) {
			console.log(response)
			if (response.status === 'connected') {
				$scope.loggedIn = true;
				result = response; 
			} else {
				$scope.loggedIn = false;

			}
			//$scope.$apply();
		})
		return result;
	}
	

	$scope.processNewHighlight = function() {
		console.log("entered")
		authResponse = checkLoginStatus()
		if(typeof($scope.formData.newHighlight) !== "undefined") {
			// Verify log in status
			if (typeof(authResponse) !== "undefined") {
				// console.log("Adding: " + $scope.formData.newHighlight)
				if(typeof($scope.highlights) === "undefined" || $scope.highlights == "") {
					$scope.highlights = [$scope.formData.newHighlight]
				} else {
					$scope.highlights.push($scope.formData.newHighlight)
				}
				$http.post(url + '/' + authResponse.authResponse.userID + '/newHighlight',
					{ "neighborhood": $scope.openName, "text": $scope.formData.newHighlight}).then(function(response){
						console.log(response)
					})
			}

			
		
			console.log($scope.highlights)
		}
	}


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
		$scope.option = option
		if ($scope.option == 1) {
			if (typeof(authResponse) !== "undefined") {
				$http.get(url + '/'+ authResponse.authResponse.userID + '/allHighlights').then(function(response) {
					// console.log(response)
					$scope.allHighlights = response.data.highlights;
					console.log($scope.allHighlights)
				})

			}
			
		}

		$scope.$apply();
		// console.log($scope.option)
		document.getElementById("mySidebar").style.width = "25%";
		document.getElementById("mySidebar").style.display = "block";

	}


	$scope.closeSidebar = function w3_close() {

		document.getElementById("mySidebar").style.display = "none";

	}

	function HighlightControl(controlDiv, map, option) {

		// Set CSS for the control border.
		var controlUI = document.createElement('div');
		controlUI.style.backgroundColor = '#fff';
		controlUI.style.border = '2px solid #fff';
		controlUI.style.borderRadius = '3px';
		controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
		controlUI.style.cursor = 'pointer';
		controlUI.style.marginBottom = '22px';
		controlUI.style.textAlign = 'center';
		

		// Set CSS for the control interior.
		var controlText = document.createElement('div');
		controlText.style.color = 'rgb(25,25,25)';
		controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
		controlText.style.fontSize = '16px';
		controlText.style.lineHeight = '38px';
		controlText.style.paddingLeft = '5px';
		controlText.style.paddingRight = '5px';
		

		if(option) {
			controlUI.title = 'Click to log in';
			controlText.innerHTML = 'Log in';

		} else {
			controlUI.title = 'Click to open sidebar menu';
			controlText.innerHTML = 'Highlights';

		}
		controlDiv.appendChild(controlUI);
		controlUI.appendChild(controlText);

		// Setup the click event listeners: simply set the map to Chicago.
		controlUI.addEventListener('click', function() {
			if(option) {
				FB.login(function(response) {
					authResponse = response;
					if (authResponse.status === 'connected') {
						$scope.loggedIn = true;
					}
					console.log(authResponse)
				})	
			} else 
				$scope.openSidebar(1);
		});

	}

	function createInfoWindowContents(name) {
		var infoWindowContent = document.createElement('div');
		var infoWindowName = document.createElement('p');
		infoWindowName.textContent = name;
		var infoButton = document.createElement('button');
		infoButton.class = 'btn btn-success';
		infoButton.textContent = "View highlights"
		infoButton.addEventListener('click', function() {
			$scope.openSidebar(2);
		})
 		infoWindowContent.appendChild(infoWindowName)
		infoWindowContent.appendChild(infoButton)
		return infoWindowContent;
	}


	var addListeners = function(polygon, name) { 
		
		google.maps.event.addListener(polygon, 'click', function (event) {
		  	// console.log("event activated")
		  	if (typeof(openedInfoWindow) !== "undefined")
		    	openedInfoWindow.close()

			openedInfoWindow = new google.maps.InfoWindow({
				position: {lat: event.latLng.lat(), lng: event.latLng.lng()},
			})
			$scope.openName = name
			// console.log(authResponse)
			if (typeof(authResponse) !== "undefined") {
				$http.get(url + '/'+ authResponse.authResponse.userID + '/' + $scope.openName + '/allHighlights').then(function(response) {
					console.log(response)
					$scope.highlights = response.data;
				})

			}
			
			$scope.$apply()
			openedInfoWindow.setContent(createInfoWindowContents(name))
			openedInfoWindow.open(map)
		})
	}


	$scope.init = (function () {
	'use strict';


	//Info window when neighborhood is clicked
	

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
	  var highlightControlDiv = document.createElement('div');
	  var highlightControl = new HighlightControl(highlightControlDiv, map, false);

	  var loginControlDiv = document.createElement('div');
	  var loginControl = new HighlightControl(loginControlDiv, map, true);

	  highlightControlDiv.index = 1;
	  loginControlDiv.index = 0;
	  map.controls[google.maps.ControlPosition.RIGHT_TOP].push(highlightControlDiv);
	  map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(loginControlDiv);

	}


	function onPositionRecieved(position){
		var coords = position.coords;
		initMap(coords.latitude, coords.longitude);
	}


	function locationTrackNotRecieved(positionError){
		console.log(positionError);
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
