var iconRed = {
  path: "M160.575,0v524.812h203.662V0H160.575z M347.662,508.237H177.148V16.571h170.514V508.237z M335.273,28.538H189.363v465.886   h145.911V28.538z M262.313,45.806c33.175,0,60.08,26.897,60.08,60.077c0,33.183-26.899,60.08-60.08,60.08   c-33.18,0-60.077-26.897-60.077-60.08C202.236,72.703,229.134,45.806,262.313,45.806z M262.313,182.075   c33.175,0,60.08,26.897,60.08,60.077c0,33.172-26.899,60.077-60.08,60.077c-33.18,0-60.077-26.894-60.077-60.077   C202.243,208.973,229.134,182.075,262.313,182.075z M262.405,442.185c-33.174,0-60.077-26.905-60.077-60.083   c0-33.177,26.897-60.077,60.077-60.077c33.183,0,60.077,26.9,60.077,60.077C322.477,415.279,295.576,442.185,262.405,442.185z    M299.224,106.246c0,20.381-16.521,36.904-36.91,36.904c-20.383,0-36.907-16.523-36.907-36.904   c0-20.383,16.524-36.906,36.907-36.906C282.703,69.34,299.224,85.869,299.224,106.246z",
  fillColor: '#ff0000',
  fillOpacity: 1,
  scale: .07,
  strokeColor: 'black',
  strokeWeight: .7
};

var iconSpeed = {
  path: "M465.05,270.789c-8.292,0-15.013-6.722-15.013-15.013c0-8.291,6.723-15.013,15.013-15.013l46.729,0.002    c-3.319-57.814-25.766-112.006-64.298-155.234l-33.045,33.041c-2.931,2.931-6.774,4.397-10.614,4.397    c-3.843,0-7.685-1.466-10.616-4.398c-5.862-5.863-5.862-15.368,0.001-21.233l33.043-33.04C383.021,25.766,328.828,3.319,271.014,0    v46.728c0,8.291-6.722,15.013-15.013,15.013c-8.291,0-15.013-6.722-15.013-15.013V0C183.174,3.319,128.982,25.766,85.754,64.3    l33.042,33.04c5.863,5.862,5.863,15.367,0,21.232c-2.932,2.932-6.774,4.398-10.616,4.398c-3.842,0-7.684-1.465-10.615-4.398    l-33.041-33.04C25.99,128.758,3.543,182.951,0.225,240.765l46.726-0.002c8.291,0,15.013,6.721,15.013,15.013    c0,8.291-6.721,15.013-15.013,15.013L0.21,270.791c2.885,50.424,20.299,98.112,50.808,138.728    c2.836,3.775,7.282,5.996,12.003,5.996H448.98c4.722,0,9.168-2.222,12.003-5.996c30.508-40.617,47.921-88.305,50.806-138.728    L465.05,270.789z M350.113,182.895l-40.058,40.059c5.835,9.574,9.2,20.812,9.2,32.822c0,34.879-28.376,63.255-63.254,63.255    c-34.879,0-63.255-28.377-63.255-63.255c0-34.879,28.377-63.254,63.255-63.254c12.01,0,23.247,3.365,32.823,9.201l40.059-40.059    c5.862-5.862,15.368-5.862,21.232,0C355.976,167.526,355.976,177.033,350.113,182.895z",
  fillColor: '#006DF0',
  fillOpacity: 1,
  scale: .05,
  strokeColor: 'black',
  strokeWeight: .7
};

var address
var geocoder;
var map;
var camerasArray = []
var config = {
  apiKey: "AIzaSyDYK8ax3uqWP-K6DkOg9S-r8_NYYrzJoG8",
  authDomain: "cameras-1420a.firebaseapp.com",
  databaseURL: "https://cameras-1420a.firebaseio.com",
  projectId: "cameras-1420a",
  storageBucket: "cameras-1420a.appspot.com",
  messagingSenderId: "643375403696"
};
firebase.initializeApp(config);

var database = firebase.database();
var pointA;
var pointB;
var directionsService;
var directionsDisplay;
var startAddr
var endAddr
var zipCode
var city
var state

function placeMarker() {
  address = localStorage.getItem('address');
  geocoder.geocode( {'address': address}, function(results, status) {
    if (status == 'OK') {
      var location = results[0].geometry.location;
      map.setCenter(location);

      var infowindow = new google.maps.InfoWindow({
        content: address
      });
      var marker = new google.maps.Marker({
        map: map,
        position: location
      });
      marker.addListener('click', function() {
        infowindow.open(map, marker);
      })          
      map.setZoom(18);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}


database.ref('locations').on('child_added', function(snapshot) {
  var icon
  var infoContent
  if (snapshot.child("cameraObj").exists()) {
    if (snapshot.val().cameraObj.cameraType === 1) {
      icon = iconRed
      infoContent = snapshot.val().cameraObj.intersection+" (Red Light Camera)"
    }
    else if (snapshot.val().cameraObj.cameraType === 2) {
      icon = iconSpeed
      infoContent = snapshot.val().cameraObj.intersection
    }
    var position = {
      lat: snapshot.val().cameraObj.latitude,
      lng: snapshot.val().cameraObj.longitude,
      type: snapshot.val().cameraObj.cameraType,
      infoContent: infoContent
    };
    camerasArray.push(position);
  }
});

var startLat
var endLat
var startLng
var endLng

function initMap() {
  geocoder = new google.maps.Geocoder();
  geocoder1 = new google.maps.Geocoder();
  geocoder2 = new google.maps.Geocoder();
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 41.931791, lng: -87.726979},
    zoom: 12
  });

  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer({
    map: map
  });
  async function directions(){
    startAddr = localStorage.getItem('startAddress');
    endAddr = localStorage.getItem('endAddress');
    console.log(startAddr)
    console.log(endAddr)
    geocoder1.geocode( {'address': startAddr}, function(results, status) {
      if (status === 'OK') {

        startLat = results[0].geometry.location.lat();
        startLng = results[0].geometry.location.lng();

        geocoder2.geocode( {'address': endAddr}, function(results, status) {
          if (status === 'OK') {
            endLng = results[0].geometry.location.lng();
            endLat = results[0].geometry.location.lat();
            calculateAndDisplayRoute(directionsService, directionsDisplay)

          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
      } 
      else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });

  }
  directions()
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  var startCoord = {
    lat: startLat,
    lng: startLng
  }
  var endCoord = {
    lat: endLat,
    lng: endLng
  }

  pointA = new google.maps.LatLng(startCoord)
  pointB = new google.maps.LatLng(endCoord)
  directionsService.route({
    origin: pointA,
    destination: pointB,
    travelMode: google.maps.TravelMode.DRIVING
  }, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      for (var i = 0; i < response.routes[0].overview_path.length; i++) {
        var position = new google.maps.LatLng(response.routes[0].overview_path[i].lat(), response.routes[0].overview_path[i].lng())

        for (var j = 0; j < camerasArray.length; j++) { 

         var position1 = new google.maps.LatLng(camerasArray[j].lat, camerasArray[j].lng)

         var distance = google.maps.geometry.spherical.computeDistanceBetween(position, position1)

         if (distance<300) {
          var icon
          if (camerasArray[j].type === 1) {
            icon = iconRed
          }
          else if (camerasArray[j].type === 2) {
            icon = iconSpeed
          }

          var newPosition = {
            lat: camerasArray[j].lat,
            lng: camerasArray[j].lng
          }
          var marker = new google.maps.Marker({
            map: map,
            position: newPosition,
            icon: icon
          });
        }

      }
    }
    directionsDisplay.setDirections(response);
  } else {
    window.alert('Directions request failed due to ' + status);
  }
});
}