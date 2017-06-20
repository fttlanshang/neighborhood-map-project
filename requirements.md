## Neighborhood map project
You will develop a single page application featuring a map of your neighborhood or a neighborhood you would like to visit. You will then add functionality to this map including highlighted locations, third-party data about those locations and various ways to browse the content.

### requirements
- responsive!
- filter locations
    + Includes a text input field or dropdown menu that filters the map markers and list items to locations matching the text input or selection. Filter function runs error-free.
- list view
    + A list-view of location names is provided which displays all locations by default, and displays the filtered subset of locations when a filter is applied.Clicking a location on the list displays unique information about the location, and animates its associated map marker (e.g. bouncing, color change.)List functionality is responsive and runs error free.
- map and markers
    + Map displays all location markers by default, and displays the filtered subset of location markers when a filter is applied.
- based on Knockout!!!!!!use Knockout to update, but not handle google map API
- 除google API 之外，还必须使用一个第三方的API，异步获取，还应处理对应的error信息.we expect students to handle errors if the browser has trouble initially reaching the 3rd-party site as well. For example, imagine a user is using your Neighborhood Map, but her firewall prevents her from accessing the Instagram servers. Here is a reference article on how to block websites with the hosts file. It is important to handle errors to give users a consistent and good experience with the webpage. Read this blogpost to learn more. Some JavaScript libraries provide special methods to handle errors. For example: refer to .fail() method discussed here if you use jQuery's ajax() method. We strongly encourage you to explore ways to handle errors in the library you are using to make API calls.
- Additional Location Data：
    + Functionality providing additional data about a location is provided and sourced from a 3rd party API. Information can be provided either in the marker’s infoWindow, or in an HTML element in the DOM (a sidebar, the list view, etc.)(Foursquare data.)意思是从第三方API中抓取详细地理信息？
-  Knockout must be used to handle the list, filter, and any other information on the page that is subject to changing state. Things that should not be handled by Knockout: anything the Maps API is used for, creating markers, tracking click events on markers, making the map, refreshing the map. Note 1: Tracking click events on list items should be handled with Knockout. Note 2: Creating your markers as a part of your ViewModel is allowed (and recommended). Creating them as Knockout observables is not.

### suggestions:
- Add unique functionality beyond the minimum requirements (i.e. the ability to “favorite” a location, etc.).
- Incorporate a build process allowing for production quality, minified code, to be delivered to the client.!!
- Data persists when the app is closed and reopened, either through localStorage or an external database (e.g. Firebase).!!
- Include additional third-party data sources beyond the minimum required.
- Style different markers in different (and functionally-useful) ways, depending on the data set.!!
- Implement additional optimizations that improve the performance and user experience of the filter functionality (keyboard shortcuts, autocomplete functionality, filtering of multiple fields, etc).
- Integrate all application components into a cohesive and enjoyable user experience.

Write code required to display map markers identifying at least 5 locations that you are interested in within this neighborhood. Your app should display those locations by default when the page is loaded.
Implement a list view of the set of locations defined in step 5.
Provide a filter option that uses an input field to filter both the list view and the map markers displayed by default on load. The list view and the markers should update accordingly in real time. Providing a search function through a third-party API is not enough to meet specifications. This filter can be a text input or a dropdown menu.
third party API: ex: Yelp reviews, Wikipedia, Flickr images, etc
Add functionality to animate a map marker when either the list item associated with it or the map marker itself is selected
Add functionality to open an infoWindow with the information described in step 9 (you can also populate a DOM element with this info, but you should still open an infoWindow, even with minimal info, like location name) when either a location is selected from the list view or its map marker is selected directly.
The web app should be mobile responsive - notice the hamburger menu icon used to hide the list on small screens (this is just one possible mobile implementation).
