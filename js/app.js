var map; // map is a global variable.

//the initial locations are hard coded and the detailed infomation is manually getting from google map.
//For simplicity, no photoUrl is included.
// var locations = [
//     {title: 'China Agricultural University Gymnasium',
//         location: {lat:40.003973, lng: 116.35936},
//         address: '17 Qinghua E Rd, Haidian Qu, Beijing Shi, China, 100083',
//         review: '体育馆好大，不过外墙有点掉色的感觉，保养没有工大好…',
//         rating: 9.4,
//         },
//     {title: 'Yuanmingyuan Park',
//         location: {lat: 40.008098, lng: 116.298215},
//         address: 'Yuanmingyuan Park, Haidian, China',
//         review: 'Park featuring colorful gardens & ruins dating from 1707 & burned during Second Opium War of 1860.',
//         rating: 8.8,
//         },
//     {title: 'Tsinghua University',
//         location: {lat: 39.999667, lng: 116.326444},
//         address: '30 Shuangqing Rd, Haidian Qu, Beijing Shi, China',
//         review: 'The most famous university in China, like Oxford and Cambridge in UK.Quit and beautiful, good place to stay.',
//         rating: 9.2,},
//     {title: 'Olympic Forest Park',
//         location: {lat: 40.032680, lng: 116.406112 },
//         address: 'China, Beijing Shi, Chaoyang Qu, 林翠路2号',
//         review: 'It was a nice walk around greenish forest area.there is a walking track distance around 10 km.',
//         rating: 8.8,},
//     {title: '798 Art Zone',
//         location: {lat: 39.982954, lng: 116.493244 },
//         address: '1 Qixing W St, Chaoyang Qu, Beijing Shi, China, 100096',
//         review: 'interesting but not expect lots of local arts, mainly a place with imported little gifts with some kinda designs',
//         rating: 8.6,},
//     {title: 'Palace Museum',
//         location: {lat: 39.916345, lng: 116.397155 },
//         address: '4 Jingshan Front St, Dongcheng Qu, Beijing Shi, China, 100006',
//         review: 'This place is incredible. Cannot believe this was built to accommodate for one person hundreds of years ago!',
//         rating: 9.0,},
//     {title: 'Peking University',
//         location: {lat: 39.986913, lng: 116.305874 },
//         address: '5 Yiheyuan Rd, Haidian Qu, Beijing Shi, China, 100080',
//         review: 'I have lived here for more than three years and will always miss it. Life was so convenient.',
//         rating: 9.0,},
//     {title: 'Quanjude',
//         location: {lat: 39.912235, lng: 116.411924},
//     address: '9 Shuaifuyuan Hutong, DongDan, Dongcheng Qu, Beijing Shi, China, 100005',
//         review: 'The waitress is nice, they teach us how to wrap the duck correctly.  The duck is nice.  We ordered a little bit more than enough.  Half duck is only one small plate, whole duck  is 2 plates.  They offer us a free duck soup.  Very nice.  They keep the duck  warm the with a candle under the plate like my picture here. ',
//         rating: 8.2,},
//     {title: 'Jian Wai SOHO',
//         location: {lat: 39.905696, lng: 116.459838},
//     address: 'China, Beijing Shi, Chaoyang Qu, JianWai DaJie, JianWai SOHO',
//         review: 'A pretty modern place.',
//         rating: 8.0,},
//     {title: 'Zhongguancun',
//         location: {lat: 39.983245, lng: 116.315509 },
//     address: 'ZhongGuanCun, Haidian Qu, Beijing Shi, China, 100080',
//         review: 'It was full of vitality.',
//         rating: 8.2,}
// ];
var locations = [];
// Give hints when google map can't load properly.
var handleGoogleMapError = function() {
    document.getElementById('map').innerHTML = "<h2 class='map-error'>Sorry, an error happened. Can't load the map.</h2>";
};
//the callback function, initialize the map and the autocomplete, apply ko bindings
var initMap = function() {
    var center = {lat: 39.921211, lng: 116.410253 };
    map = new window.google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: center
    });
    var autoComplete = new window.google.maps.places.Autocomplete(document.getElementById('initialLocationQuery'), {
        componentRestrictions: {country: 'cn'}
    });
    ko.applyBindings(new ViewModel());
};

// View Model, keeping track of all the events, input variables and others.
var ViewModel = function() {
    var self = this;
    this.currentState = ko.observable(1); // observes the state of the list panel
    this.searchText = ko.observable(""); // the input of the filter
    this.initialLocationQuery = ko.observable('Palace Museum'); // the input of the top search
    this.markers = ko.observableArray([]);

     // Since only ont infowindow is opened at one time, so I declare the infowindow as a property of viewmodel.
    this.infoWindow = new window.google.maps.InfoWindow();
    this.currentMarker = null; // keeping track of the current marker to handle bounce event so only one marker is animated at a time.

    // filteredMarkers is computed from this.markers and the list is binding to it.
    //When this.markers change, this.filteredMarkers will automatically change and so does the list.
    this.filteredMarkers = ko.computed(function() {
        var pattern = self.searchText().toLowerCase();
        if(pattern === '') {
            return self.markers();
        }else {
            return ko.utils.arrayFilter(self.markers(), function(marker, index) {
                // console.log(marker.title.toLowerCase());
                return marker.title.toLowerCase().indexOf(pattern) >= 0;
            });
        }
    });//.extend({ notify: 'always' })

    // When filter button is clicked or keyup is happened, reset the markers
    this.filterPlaces = function(el, event) {
        console.log(event);
        if(event.keyCode === 13 || event.target) {
            self.currentState(-1);
            return;
        }
        hideMarkers(self.markers()); //notice observables are functions
        showMarkers(self.filteredMarkers());
        self.infoWindow.close();
        if(self.currentMarker !== null)  self.currentMarker.setAnimation(null);

    };

    // Toggle the list panel when the hamburger menu is clicked.
    this.toggleShow = function() {
        self.currentState(-self.currentState());
    };
    this.locationQuery = function(el, event) {
        if(event.keyCode == 13) self.searchTopPicks();
    };

    //When the search button is clicked, searchTopPicks will be called.
    //It will geocode the input to lat and lng and then call getTopPicksFromSquare function to retrieve data from FourSquare API.
    //But when user doesn't select a place from autoComplete, things get a little uncontrolled.
    this.searchTopPicks = function() {
        var geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({'address': self.initialLocationQuery(),
                        componentRestrictions: {country: 'cn'}},
        function(results, status) {
            if(status === 'OK') {
                // console.log(results);
                var center = results[0].geometry.location;
                getTopPicksFromSquare(center);
            }else {
                self.initialLocationQuery('Geocode was not successful for the reason: ' + status);
            }
        });
    };
    var padding = function(num) {
        if(num > 0 && num <= 9) {
            return '0' + num;
        }else   return num.toString();
    };

    // Get top picks from FourSquare API using axios library. After getting the new data, locations array will be cleared and reused.
    //Then, InitListView function is called.
    var getTopPicksFromSquare = function(center) {
        var fourSquareUrl = 'https://api.foursquare.com/v2/venues/explore?';
        var date = new Date();
        var dateStr = date.getFullYear() + '' + padding(date.getMonth()) + padding(date.getDay());
        window.axios.get(fourSquareUrl, {
            params: {
                ll: center.lat().toFixed(3) + ',' + center.lng().toFixed(3),
                section: 'topPicks',
                venuePhotos: 1,
                limit: 10,
                client_id: 'N5WZOLWC4GO3MSQFIMODIP5ULRAVCKRGGYCKSAIH3FH41HIC',
                client_secret: 'GKNWBWCDZMCBHEQPDFWW3YRNHAYFZZ1AKU4EM1DKXPNFOLM0',
                v: dateStr
            }
        })
        .then(function (results) {
            // console.log(results);
            var topPicks = results.data.response.groups[0].items;// an array
            // console.log(topPicks);
            locations = [];// make locations array empty to store new data
            for(var i = 0; i < topPicks.length; i++) {
                var location = {};// if put this line out of the loop, then items in locations will be the same
                location.location = {};
                var venue = topPicks[i].venue;
                location.title = venue.name;
                location.location.lat = venue.location.lat;
                location.location.lng = venue.location.lng;
                // console.log(topPicks[i].tips);
                if(topPicks[i].tips !== undefined) { // some places didn't have tips property, also notice null !== undefined
                    var tip = topPicks[i].tips[0];
                    location.review = tip.text;
                    location.imgSrc = tip.photourl;
                    location.referenceUrl = tip.canonicalUrl;
                }
                location.rating = venue.rating;
                location.address = venue.location.formattedAddress.join(",");
                locations.push(location); //locations actually is an array full of pointers
            }
            console.log(locations);
            InitListView();
        })
        .catch(function (error) {
            console.log(error);
            self.initialLocationQuery('Can not get top picks from FourSquare API due to: ' + error.message); // need to test
        });
    };

    // This function is responsive for getting data from locations to markers and thus update the view.
    var InitListView = function() {
        if(window.innerWidth < 450) {
            self.currentState(-1);
        }
        var marker;
        var bounds = new google.maps.LatLngBounds();
        if(self.markers().length > 0) { // if it's length > 0, meaning it has previous data, so markers need to be removed.
            for(var i = 0; i < self.markers().length; i++) {
                self.markers()[i].setMap(null); // setMap is needed because old markers should be completely removed
            }
            self.markers.removeAll();
        }
        for(var j = 0; j < locations.length; j++) {
            marker = new window.google.maps.Marker({
                position: locations[j].location,
                title: locations[j].title,
                map: map,
                draggable: true,
                animation: window.google.maps.Animation.DROP
            });
            marker.addListener('click', handleMarkerClick);
            bounds.extend(marker.position);
            self.markers.push(marker);
            map.fitBounds(bounds);
        }
    };
    // the event handler for marker clicking events
    var handleMarkerClick = function() {
        var markerCopy = this;
        self.highlightMarker(markerCopy);
    };

    // When a list item is clicked or a marker is clicked, this function will be called.
    // And there are 2 conditions:
    //      (1)click the previous one, toggle;
    //      (2)click a new one, need to set previous one's animation to null and update the currentMarker
    this.highlightMarker = function(marker) {
        if(self.currentMarker == marker)    toggleBounce(marker);
        else {
            if(self.currentMarker !== null)  {
                 self.currentMarker.setAnimation(null);
            }
            self.currentMarker = marker;
            toggleBounce(marker);
        }
        getDetail(marker, self.infoWindow);
        if(window.innerWidth <= 420)    self.currentState(-1);
    };

    // show all the markers using setMap method. At the same time, I reset the bounds during the filter process.
    var showMarkers = function(markers) {
        var bounds = new google.maps.LatLngBounds();
        for(var i = 0; i < markers.length; i++) {
            // markers[i].setMap(map);
            markers[i].setVisible(true);
            bounds.extend(markers[i].position);
        }
        map.fitBounds(bounds);
    };
    // hide all the markers using setMap method.
    var hideMarkers = function(markers) {
        for(var i = 0; i < markers.length; i++) {
            // markers[i].setMap(null);
            markers[i].setVisible(false);
        }
    };

    // toggle the marker's animation
    var toggleBounce = function(marker) {
        if(marker.getAnimation() !== null) {
            marker.setAnimation(null);
        }else {
            marker.setAnimation(window.google.maps.Animation.BOUNCE);
        }
    };

    // When the list item or marker is clicked, it will show animation as well as the detailed information.
    // This function will get details from locations array.
    var getDetail = function(marker, infoWindow) {
        map.panTo(marker.position);
        var index = self.markers.indexOf(marker);
        var item = locations[index];
        var ratingHTML = (item.rating === undefined) ? "" : ('<p><span class="glyphicon glyphicon-heart"></span>   ' + item.rating + '</p>');
        var reviewHTML = (item.review === undefined) ? "" : ('<p><span class="glyphicon glyphicon-pencil"></span>  ' + item.review + '</p>');
        var linkHTML = (item.referenceUrl === undefined) ? "" : ('<a href="' + item.referenceUrl + '" target="blank">' + 'More about this place</a>');
        var imgHTML = (item.imgSrc === undefined) ? "" : ('<img class="infowindow" src="' + item.imgSrc + '">');
        infoWindow.setContent('<div class="infowindow"><h4>' + item.title + '</h4>' + '<p><span class="glyphicon glyphicon-map-marker"></span> ' + item.address+ '</p>' + ratingHTML + reviewHTML + imgHTML + linkHTML + '</div>');
        infoWindow.open(map, marker);
    };
    this.searchTopPicks();
    InitListView();
};
