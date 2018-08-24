var app = angular.module('neighborhoods1.0', [])




app.controller('MapController', ['$scope', '$http', function($scope, $http) {

	var map;
  	var openedInfoWindow;
  	var colors = [];
	var marker;
	var userInfo;
	var authResponse;
	var avg = {};
	$scope.clicked = false;
	const url = 'https://neighborhoodview.cfapps.io/api'	
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

	/*
	* Click event function for buttons in 'Highlights'
	* menu
	*
	* @param: selected neighborhood
	*
	* @behavior: center selected neighborhood and open
	* sidebar for that neighborhood
	*/

	$scope.goToNeighborhood = function(neighborhood) {
		//console.log(neighborhood)
		map.setCenter(avg[neighborhood])
		$scope.openName = neighborhood
		$scope.option = 2;
		openHelper()

	}

    /*-------------------------- BEGIN HIGHLIGHT OPTIONS -----------------------*/

	/*
	* Click event function for save highlight edits
	* 
	*
	* @param: highlight index
	*
	* @behavior: send post request to backend, saving edit and updated view
	*/
	$scope.saveHighlightEdit = function(index) {
		var edit = document.getElementById("edit-text" + index).value
		$http.post(url + '/' + authResponse.authResponse.userID + '/' + index + '/edit',
			{"neighborhood": $scope.openName, "text": edit}).then(function(response) {
				// Response is new list of highlight that contains edits
				$scope.highlights = response.data
				$scope.closeHighlightOptions(index)

			}
		)

	}

	/*
	* Click event for edit button
	* 
	*
	* @param: highlight index
	*
	* @behavior: change view to show textarea for edits and save button
	*/
	$scope.editHighlight = function(index) {
		document.getElementById("p" + index).style.display = "none"
		document.getElementById("edit-text" + index).style.display = "block"
		document.getElementById("edit-save" + index).style.display = "block"
		document.getElementById("edit" + index).style.display = "none"
		document.getElementById("delete" + index).style.display = "none"
	}

	/*
	* Click event for delete highlight button
	* 
	*
	* @param: highlight index
	*
	* @behavior: send delete reqeust to backend, deleting highlight and updating view
	*/
	$scope.deleteHighlight = function(index) {
		if(confirm("Are you sure you want to delete this highlight?")) {
			$scope.highlights.splice(index, 1);
			$http.post(url + '/' + authResponse.authResponse.userID + '/' + index + '/delete',
				{"neighborhood": $scope.openName}).then(function(response) {
					////console.log(response)
				})
		}
	}

	/*
	* Click event for close highlight chnages button
	* 
	*
	* @param: highlight index
	*
	* @behavior: change view to remove edit and delete buttons
	*/
	$scope.closeHighlightOptions = function(index) {
		////console.log(index + ' as index')
		document.getElementById("p" + index).style.display = "block"
		document.getElementById("p" + index).style.width = "100%"
		document.getElementById("edit-text" + index).style.display = "none"
		document.getElementById("edit" + index).style.display = "none"
		document.getElementById("edit-save" + index).style.display = "none"
		document.getElementById("delete" + index).style.display = "none"
		document.getElementById("close" + index).style.display = "none"	
	}


	/*
	* Click event for close highlight chnages button
	* 
	*
	* @param: highlight index
	*
	* @behavior: change view to remove edit and delete buttons
	*/
	$scope.showHighlightOptions = function(index) {
		////console.log("click triggered")
		document.getElementById("p" + index).style.width = "70%"
		document.getElementById("edit" + index).style.display = "block"
		document.getElementById("edit" + index).style.width = "10%"
		document.getElementById("delete" + index).style.display = "block"
		document.getElementById("delete" + index).style.width = "10%"
		document.getElementById("close" + index).style.display = "block"
		document.getElementById("close" + index).style.width = "10%"

	}

	/*-------------------------- END HIGHLIGHT OPTIONS -----------------------*/


	/*
	* Click event for log out 
	* 
	*
	* @behavior: log out of Fb account for app
	*/
	$scope.logOut = function() {
		FB.getLoginStatus(function(response) {
			if (response && response.status === 'connected') {
				FB.logout(function(response) {
					alert("You have been logged out.")
					$scope.loggedIn = false;
					$scope.highlights = [];
					$scope.allHighlights = {};
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
		////console.log("enered 2")
		FB.getLoginStatus(function(response) {
			////console.log(response)
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


	/*
	* Get all highlights for this user for specified neighborhood
	* 
	*
	* @param: neighborhood
	*
	* @behavior: make get request to backend for user and neighborhood, returning highlights
	*/
	function getHighlightsforNeighborhood(neighborhood) {
		$http.get(url + '/' + authResponse.authResponse.userID + '/' + neighborhood +  '/allHighlights').then(function(response) {
			$scope.highlights = response.data
		})
	}


	/*
	* Handle the new highlight submission
	* 
	*
	* @behavior: prompt user to log in if not logged in
	* make post request to backend with new highlight
	* and update view
	*/
	$scope.processNewHighlight = function() {
		////console.log("entered")
		authResponse = checkLoginStatus()
		if(typeof($scope.formData.newHighlight) !== "undefined") {
			// Verify log in status
			if (typeof(authResponse) !== "undefined") {
				// ////console.log("Adding: " + $scope.formData.newHighlight)
				if(typeof($scope.highlights) === "undefined" || $scope.highlights == "") {
					$scope.highlights = [$scope.formData.newHighlight]
				} else {
					$scope.highlights.push($scope.formData.newHighlight)
				}
				$http.post(url + '/' + authResponse.authResponse.userID + '/newHighlight',
					{ "neighborhood": $scope.openName, "text": $scope.formData.newHighlight}).then(function(response){
						////console.log(response)
						getHighlightsforNeighborhood($scope.openName)
					})
			}
		}
	}

	/*
	* Find the center LatLng of specified neighborhood
	* 
	*
	* @param: neighborhood, coords: boundary coordinates for neighborhood 
	*
	* @behavior: 
	*/
	function avgCoords(neighborhood, coords) {
		var latSum = 0, latCount = 0;
		var lngSum = 0, lngCount = 0;
		for (var data in coords) {
			latSum++;
			lngSum++;
			latCount += coords[data].lat;
			lngCount += coords[data].lng;
		}
	  avg[neighborhood] = {lat: latCount/latSum, lng: lngCount/lngSum}
	}


	/*
	* Open sidebar with view specified by option
	* 
	*
	* @param: option: either 1 - if all highlights or 2 if specified neighborhood highlights
	*
	* @behavior: make get request to backend for user and neighborhood, returning highlights
	*/
	$scope.openSidebar = function w3_open(option) {
		$scope.option = option
		if ($scope.option == 1) {
			if (typeof(authResponse) !== "undefined") {
				$http.get(url + '/'+ authResponse.authResponse.userID + '/allHighlights')
				.then(function(response) {
					$scope.allHighlights = response.data.highlights;
				})

			}
			
		}

		$scope.$apply();
		document.getElementById("mySidebar").style.width = "25%";
		document.getElementById("mySidebar").style.display = "block";

	}

	// Close sidebar
	$scope.closeSidebar = function w3_close() {

		document.getElementById("mySidebar").style.display = "none";

	}

	/*
	* Add log in and highlights button on top of google map
	* 
	*
	* @param: controlDiv: parent element
	* @param map: map object
	* @param option: true for log in, false for highlights
	*
	* @behavior: Apply button, event listeners for button, and button style to map view
	*/
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
					////console.log(authResponse)
				})	
			} else 
				$scope.openSidebar(1);
		});

	}

	/*
	* If logged in, get user highlights for specified neighborhood
	* and open sidebar.
	* 
	* @behavior: make get request to backend for user and neighborhood, returning highlights
	*/
	function openHelper() {
		if (typeof(authResponse) !== "undefined") {
				$http.get(url + '/'+ authResponse.authResponse.userID + '/' + $scope.openName + '/allHighlights')
				.then(function(response) {
					$scope.highlights = response.data;
				})
			} else {
				
				$scope.$apply()	
			} 

				
			document.getElementById("mySidebar").style.width = "25%";
			document.getElementById("mySidebar").style.display = "block";

	}

	/*
	* Construct elements in info window
	* 
	*
	* @param: neighborhood name
	*
	* @behavior: add name and button with click handler for each info window
	*/

	function createInfoWindowContents(name) {
		$scope.openName = name
		$scope.option = 2
		$scope.highlights = [];
		var infoWindowContent = document.createElement('div');
		var infoWindowName = document.createElement('p');
		infoWindowName.textContent = name;
		var infoButton = document.createElement('button');
		infoButton.class = 'btn btn-success';
		infoButton.textContent = "View highlights"
		infoButton.addEventListener('click', function() {
				openHelper();
		})
 		infoWindowContent.appendChild(infoWindowName)
		infoWindowContent.appendChild(infoButton)
		return infoWindowContent;
	}

	/*
	* Add click event handler for each neighborhood that
	* opens info window for said neighborhood
	* 
	*
	* @param: polygon: drawn neighborhood on map
	* @param: name: neighborhood name
	*
	* @behavior: 
	*/
	var addListeners = function(polygon, name) { 
		
		google.maps.event.addListener(polygon, 'click', function (event) {
		  	if (typeof(openedInfoWindow) !== "undefined")
		    	openedInfoWindow.close()

			openedInfoWindow = new google.maps.InfoWindow({
				position: {lat: event.latLng.lat(), lng: event.latLng.lng()},
			})
			openedInfoWindow.setContent(createInfoWindowContents(name))
			openedInfoWindow.open(map)
		})
	}

	/*
	* IIFE fro google map initialization, position location and tracking,
	* and neighborhood drawing
	*/
	$scope.init = (function () {
	'use strict';

	
	//draw NY neighborhoods
	//This is a seperate funciton b/c data structue is different for NY
	function drawNYNeighborhoods() {
		var coordinates = boroughedNeighborhoods;
		var hoods = Object.keys(boroughs);
		for (var area in coordinates) {
		    var borough = coordinates[area]
		    for(var neighborhood in borough) {
		       var data = borough[neighborhood];
		       avgCoords(neighborhood, data.coords)
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

	//draw Chicago or SF neighborhoods
	function drawNeighborhoods(option) {
		var i = 0
		var city;
		if (option == 1)
			city = chicagoNeighborhoods
		else if (option == 2)
			city = sfNeighborhoods

		for (var neighborhood in city) {
		  var data = city[neighborhood]
		  avgCoords(neighborhood, data.coords)
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

	// initialize google map
	function initMap(x, y) {
	  var position = {lat: x, lng: y}
	  map = new google.maps.Map(document.getElementById('map'), {
	    center: position,
	    zoom: 13
	  });
	  // marker which tells user where they are
	  marker = new google.maps.Marker({position: position, map: map});
	  beginPositionWatch()
	  drawNYNeighborhoods()
	  drawNeighborhoods(1)
	  drawNeighborhoods(2)

	  //Highlight button
	  var highlightControlDiv = document.createElement('div');
	  var highlightControl = new HighlightControl(highlightControlDiv, map, false);

	  //log in button
	  var loginControlDiv = document.createElement('div');
	  var loginControl = new HighlightControl(loginControlDiv, map, true);


	  highlightControlDiv.index = 1;
	  loginControlDiv.index = 0;
	  map.controls[google.maps.ControlPosition.RIGHT_TOP].push(highlightControlDiv);
	  map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(loginControlDiv);

	}

	// on successful position reception, initilaize google map
	function onPositionRecieved(position){
		var coords = position.coords;
		initMap(coords.latitude, coords.longitude);
	}

	// error if no position tracking
	function locationTrackNotRecieved(positionError){
		////console.log(positionError);
	}

	// error if initial position not recieved
	function locationNotRecieved(positionError){
		////console.log(positionError);
	}

	// set position on map when position tracking coords received
	function watchCoordinatesRecieved(pos) {
		var coords = pos.coords
		marker.setPosition({lat: coords.latitude, lng: coords.longitude})
	}

	// begin watch position for movement tracking
	function beginPositionWatch() {
		navigator.geolocation.watchPosition(watchCoordinatesRecieved, locationTrackNotRecieved, options)
	}

	// Check if DOM navigator object exists
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(onPositionRecieved, locationNotRecieved);
	}


	}) ( ); 
	
}])
