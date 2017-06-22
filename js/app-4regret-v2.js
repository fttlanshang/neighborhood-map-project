var map;

var locations = [ // hard coded here!!!!!!!!!!!
    {title: 'China Agricultural University Gymnasium',
        location: {lat:40.003973, lng: 116.35936},
        address: '17 Qinghua E Rd, Haidian Qu, Beijing Shi, China, 100083',
        review: '体育馆好大，不过外墙有点掉色的感觉，保养没有工大好…',
        rating: 9.4,
        },
    {title: 'Yuanmingyuan Park',
        location: {lat: 40.008098, lng: 116.298215},
        address: 'Yuanmingyuan Park, Haidian, China',
        review: 'Park featuring colorful gardens & ruins dating from 1707 & burned during Second Opium War of 1860.',
        rating: 8.8,
        },
    {title: 'Tsinghua University',
        location: {lat: 39.999667, lng: 116.326444},
        address: '30 Shuangqing Rd, Haidian Qu, Beijing Shi, China',
        review: 'The most famous university in China, like Oxford and Cambridge in UK.Quit and beautiful, good place to stay.',
        rating: 9.2,},
    {title: 'Olympic Forest Park',
        location: {lat: 40.032680, lng: 116.406112 },
        address: 'China, Beijing Shi, Chaoyang Qu, 林翠路2号',
        review: 'It was a nice walk around greenish forest area.there is a walking track distance around 10 km.',
        rating: 8.8,},
    {title: '798 Art Zone',
        location: {lat: 39.982954, lng: 116.493244 },
        address: '1 Qixing W St, Chaoyang Qu, Beijing Shi, China, 100096',
        review: 'interesting but not expect lots of local arts, mainly a place with imported little gifts with some kinda designs',
        rating: 8.6,},
    {title: 'Palace Museum',
        location: {lat: 39.916345, lng: 116.397155 },
        address: '4 Jingshan Front St, Dongcheng Qu, Beijing Shi, China, 100006',
        review: 'This place is incredible. Cannot believe this was built to accommodate for one person hundreds of years ago!',
        rating: 9.0,},
    {title: 'Peking University',
        location: {lat: 39.986913, lng: 116.305874 },
        address: '5 Yiheyuan Rd, Haidian Qu, Beijing Shi, China, 100080',
        review: 'I have lived here for more than three years and will always miss it. Life was so convenient.',
        rating: 9.0,},
    {title: 'Quanjude',
        location: {lat: 39.912235, lng: 116.411924},
    address: '9 Shuaifuyuan Hutong, DongDan, Dongcheng Qu, Beijing Shi, China, 100005',
        review: 'The waitress is nice, they teach us how to wrap the duck correctly.  The duck is nice.  We ordered a little bit more than enough.  Half duck is only one small plate, whole duck  is 2 plates.  They offer us a free duck soup.  Very nice.  They keep the duck  warm the with a candle under the plate like my picture here. ',
        rating: 8.2,},
    {title: 'Jian Wai SOHO',
        location: {lat: 39.905696, lng: 116.459838},
    address: 'China, Beijing Shi, Chaoyang Qu, JianWai DaJie, JianWai SOHO',
        review: 'A pretty modern place.',
        rating: 8.0,},
    {title: 'Zhongguancun',
        location: {lat: 39.983245, lng: 116.315509 },
    address: 'ZhongGuanCun, Haidian Qu, Beijing Shi, China, 100080',
        review: 'It was full of vitality.',
        rating: 8.2,}
];
// var locations = [];

function initMap() {
    var center = {lat: 39.981827, lng: 116.359302 };
    map = new window.google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: center
    });
    var autoComplete = new window.google.maps.places.Autocomplete(document.getElementById('initialLocationQuery'), {
        componentRestrictions: {country: 'cn'}
    });
    // autoComplete.addListener('place_changed', fillInAddress);
    // function fillInAddress() {
    //     console.log(autoComplete.getPlace());
    //     self.initialLocationQuery(autoComplete.getPlace());
    // }
    // add one line, but what about the bounds, search within China
    ko.applyBindings(new ViewModel());

}

var ViewModel = function() {
// now markers and filteredMarkers are all observables, is this OK? thinks filteredMarkers is enough
    var self = this;
    this.currentState = ko.observable(1);
    this.searchText = ko.observable("");// need to change at last
    this.initialLocationQuery = ko.observable('Tsinghua University');
    this.markers = ko.observableArray([]);
    this.filteredMarkers = ko.computed(function() {
        var pattern = self.searchText().toLowerCase();
        console.log(pattern);
        if(pattern == '') {
            console.log("this way");
            return self.markers();
        }else {
            console.log(self.markers());
            return ko.utils.arrayFilter(self.markers(), function(marker, index) {
                console.log(marker.title.toLowerCase());
                return marker.title.toLowerCase().indexOf(pattern) >= 0;
            })
        }
    }).extend({ notify: 'always' });

    // clear the old history and traverse again to filter
    this.filterPlaces = function() {
        // self.autoCompleteMarkers.removeAll();
        hideMarkers(self.markers()); //notice observables are functions
        // self.filteredMarkers.removeAll();
        // var str;
        // var pattern = self.searchText().toLowerCase();
        // for(var i = 0; i < self.markers().length; i++) {
        //     str = self.markers()[i].title.toLowerCase();
        //     // console.log(str);
        //     if(str.indexOf(pattern) >= 0) self.filteredMarkers.push(self.markers()[i]);
        // }
        showMarkers(self.filteredMarkers());
    }
    // this.filteredMarkers = ko.observableArray([]);
    // this.autoCompleteMarkers = ko.observableArray([]);
    this.infoWindow = new window.google.maps.InfoWindow(); // not that good, right??
    this.currentMarker = null;
    this.toggleShow = function() {
        self.currentState(-self.currentState());
    }
    // this.mapSizeRatio = ko.computed(function() {
    //     return self.currentState() < 0 ? "col-md-12" : "col-md-9";
    // })
    this.searchTopPicks = function() {
        var geocoder = new window.google.maps.Geocoder();
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
                if(topPicks[i].tips != null) {
                    location.review = topPicks[i].tips[0].text;
                    location.imgSrc = topPicks[i].tips[0].photourl;
                }
                location.rating = venue.rating;
                // console.log(topPicks[i])
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
    }
    // function autoCompleteByGoogle() {
        // var input

    // }
    function InitListView() {
        var marker;
        var bounds = new google.maps.LatLngBounds();
        if(self.markers().length > 0) {
            for(var i = 0; i < self.markers().length; i++) {
                self.markers()[i].setMap(null);
            }
            self.markers.removeAll();
            // self.filteredMarkers.removeAll();
        }
        for(var i = 0; i < locations.length; i++) {
            marker = new window.google.maps.Marker({
                position: locations[i].location,
                title: locations[i].title,
                map: map,
                // label: i + '',
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
            // self.filteredMarkers.push(marker);
            // console.log(self.markers());
            // map.setZoom(14);
            map.fitBounds(bounds);
            // bounds.extend(marker.position); // strange for putting here!!!
        }
    }

    // this.autoComplete = function() {
    //     self.autoCompleteMarkers.removeAll();
    //     var pattern = self.searchText().toLowerCase();
    //     // if(pattern === "")  return;
    //     var str;
    //     for(var i = 0; i < self.markers().length; i++) {
    //         str = self.markers()[i].title.toLowerCase();
    //         if(str.indexOf(pattern) >= 0)   self.autoCompleteMarkers.push(self.markers()[i]);
    //     }
    //     // self.filterPlaces();
    // }
    // this.fill = function(marker) {
    //     console.log(marker.title);
    //     self.searchText(marker.title);
    //     self.autoCompleteMarkers.removeAll();
    // }
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
    // function getDetail(marker, infoWindow) {
    //     var flickrUrl = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=085913c6f0019d1908fba9e14b540b9c';
    //     window.axios.get(flickrUrl, {
    //         params: {
    //             text: marker.title,
    //             // tag: marker.title + "",// why tag isn't OK here??
    //             // privacy_filter: 1,
    //             accuracy: 11,
    //             // content_type: 1,
    //             per_page: 1,
    //             format: 'json',
    //             nojsoncallback: 1,
    //             sort: 'relevance'
    //         }
    //     }).then(function (response) {
    //         console.log(response);
    //         var photoArray = response.data.photos.photo;
    //         if(photoArray.length != 0) {
    //             var photo = photoArray[0];
    //             var imgSrc = 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '_m.jpg';
    //             infoWindow.setContent('<div><h5>' + marker.title + '</h5><img src="' + imgSrc + '"></div>');
    //         }else {
    //             infoWindow.setContent('<div>' + marker.title + '</div>');
    //         }
    //         infoWindow.open(map, marker);

    //     })
    //     .catch(function (error) {
    //         console.log(error);
    //         infoWindow.setContent("<h5>Can't load a photo from Flickr due to: " + error.message + ".</h5>")
    //     });
    // }
    function getDetail(marker, infoWindow) {
        // var latLng = new window.google.maps.LatLng(marker.position.lat(), marker.position.lng());
        // map.panTo(latLng);
        map.panTo(marker.position);
        var index = self.markers.indexOf(marker);
        var item = locations[index];
        // console.log(item);
        if(item.imgSrc == undefined) {
            infoWindow.setContent('<div class="infowindow"><h4>' + item.title + '</h4>'
                + '<p><span class="glyphicon glyphicon-map-marker"></span> ' + item.address+ '</p>'
                + '<p><span class="glyphicon glyphicon-heart"></span>   ' + item.rating + '</p>'
                + '<p><span class="glyphicon glyphicon-pencil"></span>  ' + item.review + '</p></div>'); //may not exist the review
        }else {
            infoWindow.setContent('<div class="infowindow"><h4>' + item.title + '</h4>'
                + '<p><span class="glyphicon glyphicon-map-marker"></span> ' + item.address+ '</p>'
                + '<p><span class="glyphicon glyphicon-heart"></span>   ' + item.rating + '</p>'
                + '<p><span class="glyphicon glyphicon-pencil"></span>  ' + item.review + '</p>'
                + '<img class="infowindow" src="' + item.imgSrc + '"></div>');
        }
        infoWindow.open(map, marker);
        //  glyphicon glyphicon-star,glyphicon glyphicon-heart-empty,glyphicon glyphicon-hand-right,glyphicon glyphicon-map-marker, glyphicon glyphicon-pencil
    }
    InitListView();
}
// https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=ab797ec82187183fb4de60d218d80505&text=Tsinghua+University&privacy_filter=1&accuracy=11&content_type=1&per_page=2&format=json&nojsoncallback=1
// https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=ab797ec82187183fb4de60d218d80505&text=Tsinghua+University&privacy_filter=1&accuracy=11&content_type=1&per_page=1&format=json&nojsoncallback=1&auth_token=72157683240545810-1ac592bf32b28e41&api_sig=43ca1a1c9225a20e586ba73bbd8789b2