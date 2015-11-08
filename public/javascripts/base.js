/* GOOGLE MAPS STUFF HERE */
var map, geocoder, latest_search_location, latest_marker, latest_polygon, ring, listing_markers;
var input = document.getElementById('address_search');
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: new google.maps.LatLng(37.7833, -122.4167),
    zoom: 10,
    styles: [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"color":"#000000"},{"lightness":13}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#08304b"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#0c4152"},{"lightness":5}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},{"lightness":25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},{"featureType":"transit","elementType":"all","stylers":[{"color":"#146474"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#021019"}]}]
  });

  geocoder = new google.maps.Geocoder();

  autocomplete = new google.maps.places.Autocomplete(
      /** @type {!HTMLInputElement} */ (
          document.getElementById('address_search')), {
        types: ['address'],
        componentRestrictions: {'country': 'us'}
      });
  places = new google.maps.places.PlacesService(map);

  autocomplete.addListener('place_changed', onPlaceChanged);
}

function onPlaceChanged() {
  var place = autocomplete.getPlace();
  if (place.geometry) {
    // map.panTo(place.geometry.location);
    // map.setZoom(12);
    doPolygonsAndMarkers();
  } else {
    document.getElementById('address_search').placeholder = 'Enter a city';
  }
}

function updateMap(lat, lng) {
  latest_search_location = new google.maps.LatLng(lat, lng);

  resetMarker(latest_search_location);

  map.setOptions({
    center: latest_search_location,
    zoom: 12
  });
}

function resetMarker(position){
  if( latest_marker != undefined )
    latest_marker.setMap(null);

  latest_marker = new google.maps.Marker({
    position: position,
    map: map,
    title: $("#address_search").val()
  });
}

function geocodeAddress(address) {
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      map.setOptions({
        center: results[0].geometry.location,
        zoom: 12
      });
      resetMarker(results[0].geometry.location);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function drawPolygon(ring) {
  if( latest_polygon != undefined )
    latest_polygon.setMap(null);

  latest_polygon = new google.maps.Polygon({
    paths: ring,
    strokeColor: '#FF00FF',
    strokeWeight: 2,
    strokeOpacity: 0.8,
    fillColor: '#FF00FF',
    fillOpacity: '0.2'
  });
  latest_polygon.setMap(map);
}

function drawListingMarker(position, title) {
  listing_markers.push(new google.maps.Marker({
    position: position,
    map: map,
    title: title
  }));
}

/* SINATRA BINDING STUFF HERE */
function getCaltrainStations(params) {
  $.ajax({
    url: '/services/get_caltrain_stations/' + params['id'],
    method: 'GET',
    success: function(data) {
      updateCalTrainStations(data['data']['stop_name']);
      lat = parseFloat(data['data']['stop_lat']);
      lng = parseFloat(data['data']['stop_lon']);
      updateMap(lat, lng);
    },
    error: function() {
      alert('failure!');
    }
  });
}

/* HEROKU BINDING STUFF HERE */
function getPolygon(params) {
  $.ajax({
    url: '/services/get_polygon_for_location',
    method: 'GET',
    success: function(data) {
      ring = [];
      for(i = 0; i < data['polygon'].length; i++) {
        lat = data['polygon'][i]['latitude'];
        lng = data['polygon'][i]['longitude'];
        ring.push(new google.maps.LatLng(lat, lng));
      }
      drawPolygon(ring);

      listing_markers = [];
      for(i = 0; i < data['listings'].length; i++) {
        lat = data['listings'][i]['coordinates'][1];
        lng = data['listings'][i]['coordinates'][0];
        title = data['listings'][i]['address'];
        drawListingMarker(new google.maps.LatLng(lat, lng), title);
      }
    },
    error: function() {
      alert('failure!');
    }
  });
}

function doPolygonsAndMarkers() {
  geocodeAddress($("#address_search").val());
  getPolygon({});
}

/* BUTTON HANDLERS HERE */
$(document).ready(function(){
  $('#search_addresses').click(function(){
    doPolygonsAndMarkers();
  });

  document.getElementById('address_search').onkeypress = function(e) {
    var event = e || window.event;
    var charCode = event.which || event.keyCode;
    if ( charCode == '13' ) {
      doPolygonsAndMarkers();
    }
  }
});

/* FRONTEND UI CALLBACKS HERE*/
function updateCalTrainStations(text) {
  $('#caltrain_info').text(text);
}

function resizeMap() {
  vertical_space_for_map = $(window).height() - $('header').height() - $('footer').height();
  horizontal_space_for_map = $(window).width() - $('header').width() - $('footer').width();

  document.getElementById('map').style.height = String(vertical_space_for_map) + "px";
  document.getElementById('map').style.width = String(horizontal_space_for_map) + "px";
}

function resizeAndRedrawMap() {
  resizeMap();
  google.maps.event.trigger(map, "resize");

  if(latest_search_location != undefined)
    map.setCenter(latest_search_location);
}

$(window).resize(function() {
  resizeAndRedrawMap()
});

$(document).ready(function() {
  resizeMap();
});