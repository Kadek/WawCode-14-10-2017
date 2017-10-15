var generalMap;
var generalMarkers = [];

var specificMap;
var specificMarker;

var startLocation = {lat: 52.243660, lng: 21.009696}

var geocoder = new google.maps.Geocoder;

var initGeneralMap = function() {
  generalMap = new google.maps.Map(document.getElementById('generalMap'), {
    zoom: 10,
    center: startLocation
  });
}

var initSpecificMap = function() {
  specificMap = new google.maps.Map(document.getElementById('specificMap'), {
    zoom: 14,
    center: startLocation
  });
}

function removeGeneralMarkers(){
  for(var i = 0; i < generalMarkers.length; i++){
    generalMarkers[i].setMap(null);
  }
  generalMarkers = [];
}

// could need refreshing
function clearSpecificMap(){
  if(typeof specificMarker === "undefined"){
    return;
  }
  specificMarker.setMap(null);
  specificMarker = undefined;
}

function updateSpecificMap(evidenceList, activeIndex){
  clearSpecificMap();

  pos = {lat: parseFloat(evidenceList[activeIndex].lat), lng: parseFloat(evidenceList[activeIndex].lon)};

  specificMarker = new google.maps.Marker({
    position: pos,
    map: specificMap
  });

  var infoWindow = new google.maps.InfoWindow({
    content: evidenceList[activeIndex].formattedDate.toString()
  });

  getCurrentLocation(infoWindow, evidenceList[activeIndex]);

  specificMarker.addListener('click', function() { 
    infoWindow.open(specificMap, specificMarker);
  });

  specificMap.setCenter(pos);
}

function getCurrentLocation(infoWindow, activeEvidence){
  var latlng = {lat: parseFloat(activeEvidence.lat), lng: parseFloat(activeEvidence.lon)};
  geocoder.geocode({'location': latlng}, function(results, status) {
    if (status === 'OK') {
      if (results[0]) {
        infoWindow.setContent(infoWindow.getContent() + "\n" + results[0].formatted_address);
      } else {
        console.log('No results found');
      }
    } else {
      console.log('Geocoder failed due to: ' + status);
    }
  });
}

function selectMarkerInGeneralMap(activeIndex){
  setAllGeneralMarkersRed();
  generalMarkers[activeIndex].setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
}

function setAllGeneralMarkersRed(){
  for(var i = 0; i < generalMarkers.length; i++){
    generalMarkers[i].setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
  }
}