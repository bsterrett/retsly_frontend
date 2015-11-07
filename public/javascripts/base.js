/* GOOGLE MAPS STUFF HERE */
var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });
}

function updateMap(lat, lng) {
  map.setCenter({
    'lat': parseFloat(lat),
    'lng': parseFloat(lng)
  });
}

/* SINATRA BINDING STUFF HERE */
function getCaltrainStations(params) {
  $.ajax({
    url: '/services/get_caltrain_stations/' + params['id'],
    method: 'GET',
    success: function(data) {
      updateCalTrainStations(data['heroku_response']);
      updateMap(data['heroku_response']['stop_lat'], data['heroku_response']['stop_lon']);
    },
    error: function() {
      alert('failure!');
    }
  });
}

/* BUTTON HANDLERS HERE */
$(document).ready(function(){
  $('#get_caltrain_stations').click(function(){
    var params = { "id": $("#caltrain_station_id").val() }
    getCaltrainStations(params);
  });
});

/* FRONTEND UI CALLBACKS HERE*/
function updateCalTrainStations(text) {
  $('#caltrain_info').text(text);
}