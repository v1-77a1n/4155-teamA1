/*import {model} from '../models/user.js';

exports.getData = (req, res, next) => {
    let email = req.body.username; //get email to find interests and dislikes from user
    
    model.findOne({email: email}, (err, user) => {
        if(err) { next(err); }

        if(user) {
            interests = user.interests;
            exclusions = user.dislikes;
        } else {
            req.flash('error', 'Not Logged In');
        }
    })
}*/


window.onload = function () {
    checkLocationServicesEnabled();

    //create click event for getResult button to display events
    document.getElementById('getResult').onclick = () => {
        if (counter === 0) {
            displayEvents(q_data);
            counter++;
        }
    };
     //function calls for clock
    displayTime();
    setInterval(displayTime, 1000); // update the clock every second
}
//Holds all geolocation scripting on the index page.

//Init global variables
let q_data;
let counter = 0;
//Coordinates
let userLocation = navigator.geolocation
    , lat = 0
    , long = 0

    //Location Data
    , data

    //Search Criteria
    , date_range = "w2" //Default to results from last 2 weeks
    , requirements = "" //MUST be included in result
    , exclusions = ""   //MUST NOT be included in result
    , interests = ""    //includes AT LEAST ONE in result
    , offset = 0       //Start index of search results. Can do 10*offset and split up results into pages of 10 each
    ;

//Checks for location browser support and continues if true
function checkLocationServicesEnabled() {
    if (userLocation) {
        userLocation.getCurrentPosition(success);
    } else {
        console.log("The geolocation API is not supported by your browser.");
    }
}

//Retrieves user latitude and longitude coordinates and continues to get further info
function success(data) {
    lat = data.coords.latitude;
    long = data.coords.longitude;
    getLocation(lat, long);
}

//Get full address and location from lat/long using mapbox reverse geolocation API
async function getLocation(lat, long) {

    //API Key. Do not modify
    var ACCESS_TOKEN = 'sk.eyJ1Ijoiamdvb2Q3IiwiYSI6ImNsZWJvamhiMzBpeWkzdm9kdGE3eXgxeGEifQ.R-t3ZUZURUBxtgOzDsKw3Q';
    //API Key. Do not modify


    const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + long + ', ' + lat + '.json?access_token=' + ACCESS_TOKEN;
    const reply = await fetch(url);
    const data = await reply.json();
    let l = data.features.length;
    //Update headers with city name
    loc_header.innerText = "Location: " + data.features[l-4].text + ", " + data.features[l-1].text;
    result_header.innerText = 'Here are some things to do in ' + data.features[l-4].text + ":";
    console.log(data);
    getQuery(data); //TODO: Replace with button on page
}

//Uses Google CustomSearch API call to return JSON of search results with custom params
async function getQuery(data) {
    let l = data.features.length;
    interests = interestHolder.textContent;
    let dislikes = dislikeHolder.textContent;
    let user_location = data.features[l-4].text + ", " + data.features[l-1].text; //City, State
    let city = data.features[l-4].text;
    let county = data.features[l-3].text;
    let state = data.features[l-2].text;
    let query="";

    if(interests.length==0){
        query = "https://customsearch.googleapis.com/customsearch/v1?cx=37c4d5366145548fd&dateRestrict="
        + date_range + "&exactTerms=" + state
        + "&excludeTerms="
        + dislikes + "&num=10&orTerms="
        + interests + "&q=" + "Things to do in "+city
        + "&start="
        + offset + "&key=AIzaSyB384QbDLqf1z-2zKAvc1gwb2ADcEsYhTE";
    }
    else{
    
    //Combine all query data to API Call
        query = "https://customsearch.googleapis.com/customsearch/v1?cx=37c4d5366145548fd&dateRestrict="
        + date_range + "&exactTerms=" + requirements
        + "&excludeTerms="
        + dislikes + "&num=10&orTerms="
        + interests + "&q=" + interestHolder.textContent + "," + city + "," + county + "," + state
        + "&start="
        + offset + "&key=AIzaSyB384QbDLqf1z-2zKAvc1gwb2ADcEsYhTE";
    }

    let q_reply = await fetch(query);
    q_data = await q_reply.json();
    console.log(q_data);
}

//displays events as list items; not most efficient way to do it - rework this if have time
function displayEvents(data) {
    let activityList = document.getElementById('activityList');
    let events = data.items;

    if(events == null || events.length == 0) {
        let li = document.createElement("li");
        let textNode = document.createTextNode("There are no events that matches your interests criteria.");
        li.appendChild(textNode);
        activityList.appendChild(li);
    } else {
        for (let i = 0; i < events.length; i++) {
            let obj = events[i];
            let li = document.createElement("li");
            let a = document.createElement("a");
            let buttonLink = document.createElement("a");
            let textNode = document.createTextNode(obj["title"]);
            //create Button for register
            let button = document.createElement("button");
            button.setAttribute("type", "submit");
            let queryStr = "/bookmarks-add?title=" + obj["title"] + "&link=" + obj["link"];
            button.innerText = "Add to Bookmarks";
    
            a.appendChild(textNode);
            a.setAttribute("href", obj["link"]);
            a.setAttribute("target", "_blank");
    
            buttonLink.setAttribute("href", queryStr);
            buttonLink.appendChild(button);
    
            li.appendChild(a);
            li.appendChild(buttonLink);
    
            activityList.appendChild(li);
    
        }
    }
}
//Function to display time.
function displayTime() {
    var date = new Date();
    var currentDate = new Date(date);
    var k = currentDate.getHours();
    var c = currentDate.getMinutes();
    var j = currentDate.getSeconds();
    var session = "AM";
  
    if (k > 12) {
      k = k - 12;
      session = "PM";
    }

    if(k==12){
        session="PM";
    }
    
    if (k == 0) {
      k = 12;
    }
  
    k = (k < 10) ? "0" + k : k;
    c = (c < 10) ? "0" + c : c;
    j = (j < 10) ? "0" + j : j;
  
    var time = k + ":" + c + ":" + j + " " + session;
  
    document.getElementById("WorldClock").innerText = time;
    document.getElementById("WorldClock").textContent = time;
  }
