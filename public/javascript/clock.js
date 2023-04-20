window.onload = function () {
    displayTime(); 
}

function displayTime(){
    var date = new Date();
    var k = date.getHour();
    var j = date.getMin();
    var l = date.getSec();
    var session = "AM";

    if(k > 12){
        k = k - 12;
        session = "PM";
    }

    if(k == 0){
        k=12;
    
    }

    var time = k + ":" + j + ":" + l + " " + session;

    k = (k < 10) ? "0" + k : k;
    j = (j < 10) ? "0" + j : j;
    s = (s < 10) ? "0" + s : s;

    document.getElementById("WorldClock").textContent = time;

    document.getElementById("WorldClock").innerText = time;

    setTimeout(displayTime, 1000);
}

displayTime();