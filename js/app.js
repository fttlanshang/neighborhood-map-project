var map;

var locations = [ // hard coded here!!!!!!!!!!!
    {title: 'China Agricultural University Gymnasium',
        location: {lat:40.003973, lng: 116.35936}},
    {title: 'Yuan Ming Yuan',
        location: {lat: 40.008098, lng: 116.298215}},
    {title: 'Tsinghua University',
        location: {lat: 39.999667, lng: 116.326444}},
    {title: 'Ao Lin Pi Ke Sen Lin Gong Yuan',
        location: {lat: 40.032680, lng: 116.406112 }},
    {title: 'Xiangshan Park',
        location: {lat: 39.992618, lng: 116.186800 }},
    {title: 'The Palace Museum',
        location: {lat: 39.916345, lng: 116.397155 }},
    {title: 'Peking University Third Hospital',
        location: {lat: 39.981827, lng: 116.359302 }},
    {title: 'Jiangbian Chengwai',
        location: {lat: 39.956689, lng: 116.462028 }},
    {title: 'Jian Wai SOHO',
        location: {lat: 39.905696, lng: 116.459838}},
    {title: 'Zhongguancun',
        location: {lat: 39.983245, lng: 116.315509 }}
];

function initMap() {
    // var center = {lat: 39.999667, lng: 116.326444};
    // map = new google.maps.Map(document.getElementById('map'), {
    //     zoom: 14,
    //     center: center
    // });

    ko.applyBindings(new ViewModel());
}
var Marker = function(data) { // is this good? or inside better?
    return new window.google.maps.Marker({
        position: data.locations,
        title: data.title,
        map: map
    });
}
// var that = window;
var ViewModel = function() {
    var center = {lat: 39.999667, lng: 116.326444};
    this.map = new window.google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: center
    });
    this.markers = ko.observableArray([]);
    // var bounds = new google.maps.LatLngBounds();
    var marker;
    for(var i = 0; i < locations.length; i++) {
        // console.log(window);
        // marker = new window.google.maps.Marker({
        //     position: locations[i].location,
        //     title: locations[i].title,
        //     map: map
        // });
        this.markers.push(new Marker(locations[i]));
        // this.markers.push(marker);
        // bounds.extend(marker.position); // strange for putting here!!!
    }
    // map.fitBounds(bounds);
}
