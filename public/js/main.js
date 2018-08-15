(function () {
	'use strict';

	var map;
    

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

  var openedInfoWindow;
  var colors = [];
  //Info window with name when location is tapped
  var addListeners = function(polygon, name) { 
  	google.maps.event.addListener(polygon, 'click', function (event) {
      if (typeof(openedInfoWindow) !== "undefined")
        openedInfoWindow.close()
  		openedInfoWindow = new google.maps.InfoWindow({
  			content: name,
  			position: {lat: event.latLng.lat(), lng: event.latLng.lng()}
  		})
  		openedInfoWindow.open(map)
  	})
  }
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
        center: {lat: x, lng: y},
        zoom: 13
      });
      var marker = new google.maps.Marker({position: {lat: x, lng: y}, map: map});
  	  drawNYNeighborhoods()
      drawChicagoNeighborhoods()
   }
  function onPositionRecieved(position){
  	var coords = position.coords;
  	initMap(coords.latitude, coords.longitude);
  }

  function locationNotRecieved(positionError){
  	console.log(positionError);
  }
  if(navigator.geolocation) {
  	navigator.geolocation.getCurrentPosition(onPositionRecieved, locationNotRecieved);
  }


} ());


