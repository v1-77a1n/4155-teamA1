//import {model} from '../models/user.js';

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
}


window.onload = function() {
    checkLocationServicesEnabled();

    //create click event for getResult button to display events
    document.getElementById('getResult').onclick = () => { 
        if(counter === 0) { 
            displayEvents(q_data); 
            counter++;
        }
    };
}
//Holds all geolocation scripting on the index page.

//Init global variables
let q_data;
let counter = 0;
//Coordinates
let userLocation = navigator.geolocation
    ,   lat = 0
    ,   long = 0

    //Location Data
    ,   data

    //Search Criteria
    ,   date_range="w2" //Default to results from last 2 weeks
    ,   requirements="" //MUST be included in result
    ,   exclusions=""   //MUST NOT be included in result
    ,   interests=""    //includes AT LEAST ONE in result
    ,   offset=0       //Start index of search results. Can do 10*offset and split up results into pages of 10 each
;

//Checks for location browser support and continues if true
function checkLocationServicesEnabled() {
    if(userLocation) {
        userLocation.getCurrentPosition(success);
    } else {
        console.log("The geolocation API is not supported by your browser.");
    }
}

//Retrieves user latitude and longitude coordinates and continues to get further info
function success(data) {
    lat = data.coords.latitude;
    long = data.coords.longitude;
    getLocation(lat,long);
}

//Get full address and location from lat/long using mapbox reverse geolocation API
async function getLocation(lat, long){

    //API Key. Do not modify
    var ACCESS_TOKEN = 'sk.eyJ1Ijoiamdvb2Q3IiwiYSI6ImNsZWJvamhiMzBpeWkzdm9kdGE3eXgxeGEifQ.R-t3ZUZURUBxtgOzDsKw3Q';
    //API Key. Do not modify


    const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'+long+', '+lat+'.json?access_token='+ACCESS_TOKEN;
    const reply = await fetch(url);
    const data = await reply.json();
    const city = data.features[3].text;

    //Update headers with city name
    loc_header.innerText = "Location: " + city+ ", " + data.features[5].text;
    result_header.innerText='Here are some things to do in ' + city + ":";
    console.log(data);
    getQuery(data); //TODO: Replace with button on page
}

//Uses Google CustomSearch API call to return JSON of search results with custom params
async function getQuery(data){
    let user_location=data.features[3].text + ", " + data.features[5].text; //City, State

    //Combine all query data to API Call
    let query = "https://customsearch.googleapis.com/customsearch/v1?cx=37c4d5366145548fd&dateRestrict="
        + date_range + "&exactTerms="
        + requirements + "&excludeTerms="
        + exclusions + "&num=10&orTerms="
        + interests + "&q="
        + "Things to do in " + user_location + "&start="
        + offset + "&key=AIzaSyB384QbDLqf1z-2zKAvc1gwb2ADcEsYhTE";

    let q_reply = await fetch(query);
    q_data = await q_reply.json();
    console.log(q_data);
}

//displays events as list items; not most efficient way to do it - rework this if have time
function displayEvents(data) {
    let activityList = document.getElementById('activityList');
    let events = data.items;

    for(let i = 0; i < events.length; i++) {
        let obj = events[i];
        let li = document.createElement("li");
        let a = document.createElement("a");
        let textNode = document.createTextNode(obj["title"]);
        //create Button for register
        let button = document.createElement("button");
        button.innerText = "register for event";

        a.appendChild(textNode);
        a.setAttribute("href", obj["link"]);
        
        li.appendChild(a);

        activityList.appendChild(li);
        activityList.appendChild(button);
        button.onclick = function(){
            alert('You have registerd for this event' + obj["title"] + "!!!");
            return false;
        };
    }
}
