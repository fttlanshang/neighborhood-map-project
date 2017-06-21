var map;

var locations = [ // hard coded here!!!!!!!!!!!
    {title: 'China Agricultural University Gymnasium',
        location: {lat:40.003973, lng: 116.35936}},
    {title: 'Yuanmingyuan Park',
        location: {lat: 40.008098, lng: 116.298215}},
    {title: 'Tsinghua University',
        location: {lat: 39.999667, lng: 116.326444}},
    {title: 'Olympic Forest Park',
        location: {lat: 40.032680, lng: 116.406112 }},
    {title: '798 Art Zone',
        location: {lat: 39.982954, lng: 116.493244 }},
    {title: 'Palace Museum',
        location: {lat: 39.916345, lng: 116.397155 }},
    {title: 'Peking University',
        location: {lat: 39.986913, lng: 116.305874 }},
    {title: 'Quanjude',
        location: {lat: 39.912235, lng: 116.411924}},
    {title: 'Jian Wai SOHO',
        location: {lat: 39.905696, lng: 116.459838}},
    {title: 'Zhongguancun',
        location: {lat: 39.983245, lng: 116.315509 }}
];

function initMap() {
    var center = {lat: 39.981827, lng: 116.359302 };
    map = new window.google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: center
    });
    ko.applyBindings(new ViewModel());

}
// var Marker = function(data) { // is this good? or inside better?
//     return new window.google.maps.Marker({
//         position: data.locations,
//         title: data.title,
//         map: map
//     });
// }
// var that = window;
var ViewModel = function() {
// now markers and filteredMarkers are all observables, is this OK? thinks filteredMarkers is enough
    var self = this;
    this.searchText = ko.observable("Tsinghua University");// need to change at last
    this.initialLocationQuery = ko.observable('Tsinghua University');
    this.markers = ko.observableArray([]);
    this.filteredMarkers = ko.observableArray([]);
    this.autoCompleteMarkers = ko.observableArray([]);
    this.infoWindow = new window.google.maps.InfoWindow();
    this.currentMarker = null;
    this.searchTopPicks = function() {
        var geocoder = new window.google.maps.Geocoder();
        // console.log(self.initialLocationQuery());
        geocoder.geocode({'address': self.initialLocationQuery()}, function(results, status) {
            if(status === 'OK') {
                var center = results[0].geometry.location;
                map.setCenter(center);
                // map.setZoom(15);
                getTopPicksFromSquare(center);
            }else {
                self.initialLocationQuery('Geocode was not successful for the reason: ' + status);
                // alert('Geocode was not successful for the reason: ' + status);
            }
        });
    }
    function getTopPicksFromSquare(center) {
        // console.log(center.lat());
        var fourSquareUrl = 'https://api.foursquare.com/v2/venues/explore?';
        window.axios.get(fourSquareUrl, {
            params: {
                ll: center.lat().toFixed(3) + ',' + center.lng().toFixed(3),
                section: 'topPicks',
                venuePhotos: 1,
                limit: 10,
                client_id: 'N5WZOLWC4GO3MSQFIMODIP5ULRAVCKRGGYCKSAIH3FH41HIC',
                client_secret: 'GKNWBWCDZMCBHEQPDFWW3YRNHAYFZZ1AKU4EM1DKXPNFOLM0',
                v: 20170621 // need to parse date, but later!!!!!!!!!!!!!!!!!!!!!!!!!
            }
        })
        .then(function (results) {
            // console.log(results);
            var topPicks = results.data.response.groups[0].items;// an array
            console.log(topPicks);
            locations = [];// make it empty here!!
            for(var i = 0; i < topPicks.length; i++) {
                var location = {};// if put this line out of the loop, then items in locations will be the same
                location.location = {};
                var venue = topPicks[i].venue;
                location.title = venue.name;
                location.location.lat = venue.location.lat;
                location.location.lng = venue.location.lng;
                // var venuePhoto = venue.photos.groups[0].items[0]; // I can't add it as an attribute of a marker.
                // if(venuePhoto != null) {
                //     location.imgSrc = venuePhoto.prefix + venuePhoto.suffix;
                // }
                locations.push(location); //locations actually is an array full of pointers
            }
            console.log(locations);
            // updateListView(self.filteredMarkers); // thinks a litter overhead for keeping filtered Markers and markers!!!!!!!!
            // updateListView(self.markers);
            InitListView();
            // var photo = response.data.photos.photo[0];
            // var imgSrc = 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '_m.jpg';
            // infoWindow.setContent('<div><h4>' + marker.title + '</h4><img src="' + imgSrc + '"></div>');
            // infoWindow.open(map, marker);

        })
        .catch(function (error) {
            console.log(error);
            self.initialLocationQuery('Can not get top picks from FourSquare API due to: ' + error.message); // need to test
        });
    }
    function InitListView() {
        var marker;
        var bounds = new google.maps.LatLngBounds();
        if(self.markers().length > 0) {
            for(var i = 0; i < self.markers().length; i++) {
                self.markers()[i].setMap(null);
            }
            self.markers.removeAll();
            self.filteredMarkers.removeAll();
        }
        for(var i = 0; i < locations.length; i++) {
            marker = new window.google.maps.Marker({
                position: locations[i].location,
                title: locations[i].title,
                map: map,
                draggable: true,
                animation: window.google.maps.Animation.DROP
            });
            // console.log(marker);
            // marker.addListener('click', toggleBounce);
            marker.addListener('click', function(markerCopy) {
                return function() {
                    self.highlightMarker(markerCopy);
                }
            }(marker));
            bounds.extend(marker.position);
            // this.markers.push(new Marker(locations[i]));
            self.markers.push(marker);
            self.filteredMarkers.push(marker);
            map.setZoom(14);
            map.fitBounds(bounds);
            // bounds.extend(marker.position); // strange for putting here!!!
        }
    }
    // function updateListView() {// rebind the markers
    //     var marker;
    //     for(var i = 0; i < markers().length; i++) {
    //         self.markers()[i].setMap(null);
    //     }
    //     self.markers.removeAll();
    //     self.filteredMarkers.removeAll();
    //     // console.log(markers());

    //     for(var i = 0; i < locations.length; i++) {
    //         marker = new window.google.maps.Marker({
    //             position: locations[i].location,
    //             title: locations[i].title,
    //             map: map,
    //             draggable: true,
    //             animation: window.google.maps.Animation.DROP
    //         });
    //         // console.log('updateListView');
    //         // marker.title = locations[i].title;
    //         // var latlng = new google.maps.LatLng(locations[i].location.lat, locations[i].location.lng);
    //         // marker.setPosition(latlng);
    //         // marker.setMap(map);

    //         self.markers.push(marker);
    //         self.filteredMarkers.removeAll();
    //     }
    //     map.setZoom(14);
    //     map.fitBounds(bounds);
    // }
    // clear the old history and traverse again to filter
    this.filterPlaces = function() {
        self.autoCompleteMarkers.removeAll();
        hideMarkers(self.filteredMarkers()); //notice observables are functions
        self.filteredMarkers.removeAll();
        var str;
        var pattern = self.searchText().toLowerCase();
        for(var i = 0; i < self.markers().length; i++) {
            str = self.markers()[i].title.toLowerCase();
            // console.log(str);
            if(str.indexOf(pattern) >= 0) self.filteredMarkers.push(self.markers()[i]);
        }
        showMarkers(self.filteredMarkers());
    }
    this.autoComplete = function() {
        // console.log("autoComplete");
        self.autoCompleteMarkers.removeAll();
        var pattern = self.searchText().toLowerCase();
        // if(pattern === "")  return;
        var str;
        for(var i = 0; i < self.markers().length; i++) {
            str = self.markers()[i].title.toLowerCase();
            if(str.indexOf(pattern) >= 0)   self.autoCompleteMarkers.push(self.markers()[i]);
        }
        // self.filterPlaces();
    }
    this.fill = function(marker) {
        console.log(marker.title);
        self.searchText(marker.title);
        self.autoCompleteMarkers.removeAll();
    }
    this.highlightMarker = function(marker) {
        // var infoWindow = new window.google.maps.InfoWindow();
        if(self.currentMarker == marker)    toggleBounce(marker);
        else {
            if(self.currentMarker != null)  {
                 self.currentMarker.setAnimation(null);
            }
            self.currentMarker = marker;
            toggleBounce(marker);
        }
        getDetail(marker, self.infoWindow);
        // should also show css changes!!!!!!!!!!!!!!!!!!
    }
    function showMarkers(markers) {
        for(var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }
    }
    function hideMarkers(markers) {
        for(var i = 0; i < markers.length; i++) {
            // console.log(markers[i]);
            markers[i].setMap(null);
        }
    }
    function toggleBounce(marker) {
        console.log(marker);
        // if(marker == null)  return;
        if(marker.getAnimation() != null) {
            marker.setAnimation(null);
        }else {
            marker.setAnimation(window.google.maps.Animation.BOUNCE)
        }
    }
    function getDetail(marker, infoWindow) {
        var flickrUrl = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=085913c6f0019d1908fba9e14b540b9c';
        window.axios.get(flickrUrl, {
            params: {
                text: marker.title,
                // tag: marker.title + "",// why tag isn't OK here??
                // privacy_filter: 1,
                accuracy: 11,
                // content_type: 1,
                per_page: 1,
                format: 'json',
                nojsoncallback: 1,
                sort: 'relevance'
            }
        }).then(function (response) {
            console.log(response);
            var photoArray = response.data.photos.photo;
            if(photoArray.length != 0) {
                var photo = photoArray[0];
                var imgSrc = 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '_m.jpg';
                infoWindow.setContent('<div><h5>' + marker.title + '</h5><img src="' + imgSrc + '"></div>');
            }else {
                infoWindow.setContent('<div>' + marker.title + '</div>');
            }
            infoWindow.open(map, marker);

        })
        .catch(function (error) {
            console.log(error);
            infoWindow.setContent("<h5>Can't load a photo from Flickr due to: " + error.message + ".</h5>")
        });
    }
    InitListView();
}
// https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=ab797ec82187183fb4de60d218d80505&text=Tsinghua+University&privacy_filter=1&accuracy=11&content_type=1&per_page=2&format=json&nojsoncallback=1
// https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=ab797ec82187183fb4de60d218d80505&text=Tsinghua+University&privacy_filter=1&accuracy=11&content_type=1&per_page=1&format=json&nojsoncallback=1&auth_token=72157683240545810-1ac592bf32b28e41&api_sig=43ca1a1c9225a20e586ba73bbd8789b2