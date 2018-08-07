//The geocoder wrapper needs node.js to work.
var fs = require('fs');

//This is my JSON database for metro cities with more than 1,000,000 in population.
//Originally my JSON didn't have latitude and longitude so I made this app to solve that.
//Here is my database: https://github.com/nastex21/db_JSON_of_populous_cities
/* an example of one of the objects in my JSON data BEFORE lat and lng were added:
{
    "index": 519,
    "country": "India",
    "city": "Solapur",
    "Population": "1,020,000"
  }
  */
var data = fs.readFileSync("city-data.json"); //read my json file
var cities = JSON.parse(data); //parse the data from the json file

//I'm using the geocoder-geonames node wrapper which can be found at:
//https://github.com/StephanGeorg/geocoder-geonames
//You'll need a username which you can register at Geonames.org.
var GeocoderGeonames = require('geocoder-geonames'),
  geocoder = new GeocoderGeonames({
    username: "ENTER YOUR USERNAME", // enter your username here inside the quotes
  });

//needed to iterate
var i = 0;

//loop through cities JSON object to get city names 
function addLatLng() {
  var len = cities.length;
  //using an interval of about 2 seconds so I won't hammer the server
  //change the interval at your own risk
  setTimeout(function () {
    if (i !== len) { //iterate through to  the end of the object.length
      geocoder.get('search', {
        q: cities[i].city, //this is how my JSON data is structured.
        maxRows: 1 //maxRows of 1 means that it'll display just the first result, which is good enough for this
      })
        .then(function (response) {
          var lngCoor = response.geonames[0].lng; //get the longitude from the search request
          var latCoor = response.geonames[0].lat; //get the latitude
          var ctryName = response.geonames[0].countryName; //use the country name in case of duplicates
          function oopsFunc(error) {
            console.log(error) //in case of errors
          }
          if (cities[i].country == ctryName) { //if the JSON in my country matches the country in the search result
            if (cities[i].lng == undefined && cities[i].lat == undefined) { //if lng and lat are empty
              cities[i].lat = latCoor; //add lat to the JSON
              cities[i].lng = lngCoor; //add lng to the JSON
              correctLat = JSON.stringify(cities[i].lat); //convert lat to JSON string
              correctLng = JSON.stringify(cities[i].lng); //convert lng to JSON string
              fs.writeFile("city-data.json", JSON.stringify(cities, null, 2), oopsFunc); //write to the JSON file and indent
              i++; //add 1 to variable i
              addLatLng(); //recursive function until...
            } else {
              i++; 
              addLatLng();
            }
          }
        })
        .catch(function (error) {
          console.log(error);
          return;
        });
    } else {
      return; //...until you're at the end
    }
  }, 2000)
}
addLatLng();