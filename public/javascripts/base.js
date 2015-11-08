/* GOOGLE MAPS STUFF HERE */
var map, latest_search_location, latest_marker, geocoder;
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
    map.panTo(place.geometry.location);
    map.setZoom(15);
    // search();
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

/* BUTTON HANDLERS HERE */
$(document).ready(function(){
  $('#search_caltrain_stations').click(function(){
    var params = { "id": $("#caltrain_station_id_search").val() }
    getCaltrainStations(params);
  });

  $('#search_addresses').click(function(){
    geocodeAddress($("#address_search").val());
  });
});

/* FRONTEND UI CALLBACKS HERE*/
function updateCalTrainStations(text) {
  $('#caltrain_info').text(text);
}