/* ScienceGenius - an addon for SMART Notebook(R)
* Copyright (C) 2016 Omid Fakourfar and SMART Technologies
* This source code is licensed under a permissive open source license.
* See the LICENSE file for full license text. */

var trial = 0;
var timer = null;
var stopped = false;

var timestamps = JSON.parse(sessionStorage.timeStorage);

/*
// When the page loads, this function loads the track (stored in sessionStorage) into the player element.
*/ 
function loadTrack(){
  var trackName = JSON.parse(sessionStorage.trackName);
  document.getElementById("player").setAttribute("src", "./mp3/"+trackName);
}

/*
// Giphy search API. Sets the search url, sends a request and puts the results one by one on page.
*/
function search(){
  document.getElementById("searchResults").innerHTML = "";
  var api = "http://api.giphy.com/v1/gifs/search?&rating=g";
  var apiKey = "&api_key=dc6zaTOxFJmzC";
  var q = "&q=";
  var query = document.getElementById("searchInput").value;
  var url = api + apiKey + q + query;

  request = new XMLHttpRequest;
  request.open('GET', url, true);
  
  request.onload = function() {
    if (request.status >= 200 && request.status < 400){
      allGifs = JSON.parse(request.responseText).data;       
      for (var i = 0; i < allGifs.length; i++){
        data = JSON.parse(request.responseText).data[i].images.original.url;
        document.getElementById("searchResults").innerHTML += '<img src = "'+data+'"  title="GIF via Giphy" class="gifResult" onclick="putGif(this.src);" style="height: 150px">';
      }           
    } else {
      console.log('reached giphy, but API returned an error');
     }
  };
  request.onerror = function() {
    console.log('connection error');
  };
  request.send();
}

/*
// Puts images/gifs on Notebook page: creates an object prototype and adds it to page.
*/
function putGif (url){
  var gif = new NB.objectPrototype.file(url);
  gif.x = 10;
  gif.y = 10;
  NB.addObject(gif);
}

/*
// Bing search API. Sets the search url, sends a request and puts the results one by one on page.
*/
function searchBing(){
  document.getElementById("searchResults").innerHTML = "";
  var api = "https://api.cognitive.microsoft.com/bing/v5.0/images/search?safeSearch=Strict&license=Public&count=15&q=";
  var query = document.getElementById("searchInput").value;
  var url = api + query;

  request = new XMLHttpRequest;
  
  request.open('GET', url, true);
  request.setRequestHeader("Ocp-Apim-Subscription-Key","fd81840e0dc34101b90f0a1d52d279fa", false);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400){
      allGifs = JSON.parse(request.responseText);       
      for (var i = 0; i < allGifs.value.length; i++){
        data = JSON.parse(request.responseText).value[i].contentUrl;
        document.getElementById("searchResults").innerHTML += '<img src = "'+data+'"  title="Image via Bing" class="gifResult" onclick="putGif(this.src);" height="150">';
      }           
    } else {
      console.log('reached giphy, but API returned an error');
     }
  };
  request.onerror = function() {
    console.log('connection error');
  };
  request.send();      
}

/*
// Time seek styling
*/
function updateTime() {
  var player = document.getElementById("player");
  var minutes = Math.floor(player.currentTime / 60);
  var seconds = Math.floor(player.currentTime - minutes * 60);
  var durMin = Math.floor(player.duration / 60);
  var durSec = Math.floor(player.duration - durMin * 60);
  var curTime = str_pad_left(minutes,'0',2)+':'+str_pad_left(seconds,'0',2);
  var durTime = str_pad_left(durMin,'0',2)+':'+str_pad_left(durSec,'0',2);
  document.getElementById("tracktime").innerHTML = curTime + " / " + durTime;
}

function str_pad_left(string,pad,length) {
  return (new Array(length+1).join(pad)+string).slice(-length);
}

/*
// Goes back to the quick setup page. Saves lyrics text and track name (from the caption) to session storage in case its an imported file.
*/
function back(){
  var pageObjects = NB.page.getObjectsAsArray();
  var caption = pageObjects[0];
  sessionStorage.plainLyrics = caption.getCustomProperty("fullLyrics");
  sessionStorage.trackName = caption.getCustomProperty("trackName");
  window.location.href = "./stamp.html";
}

/*
// Home button event handler: Clears the sessionStorage and all the pages. Re-starts the add-on.
*/
function home(){
  sessionStorage.clear();
  deleteAllPages();
  window.location.href = "./index.html";
}

/*
// Goes back to the first Notebook page. Makes everything ready to be played.
*/
function setup(){  
  var pages = NB.document.getPages();  
    console.log("Next Trials");
    for (id in pages){
      NB.document.viewPreviousPage();
    }
}

/*
// Deletes all NB pages.
*/
function deleteAllPages(){
  var pages = NB.document.getPages();
  for (id in pages){
    pagetoDel = NB.document.getPage(NB.document.getCurrentPageId());
    NB.document.deletePage(pagetoDel);
  }
}

/*
// Calculates timeout duration for each slide. For each slide, it is calculated from 0. So for the last slide, it is the track duration.
*/
function setSlideInterval(i){
  var interval = timestamps[i] * 1000 + (timestamps[i+1] * 1000) - (timestamps[i] * 1000);
  if (timestamps[i+1] == null){
    interval = document.getElementById("player").duration * 1000;
  }
  console.log("Interval for " + i + " is " + interval);    
  return interval;
}

/*
// Play button event listener. Plays the track and disables the play button and move to next NB pages (sets a timeout for each page).
*/
function play(){
  document.getElementById("player").play();
  document.getElementById("playBtn").disabled = true;
  document.getElementById("setupBtn").disabled = true;
  timer = [];
  for (var i = 0; i < timestamps.length; i++) {
    console.log("Playing " + i);
    timer.push(setTimeout(function() {nextPage(i)}, setSlideInterval(i)));
  }
}

/*
// Goes to the next Notebook page and removes its corresponding timeout from the list of timeouts (timer).
*/
function nextPage (i){
  NB.document.viewNextPage();
  console.log(document.getElementById("player").currentTime);
  timer[i] = null;
}

/*
// Stops the track and clears the current timeout to stop the pages from moving forward as well.
*/
function stop(){
  document.getElementById("player").currentTime = 0;
  document.getElementById("player").pause();
  document.getElementById("playBtn").disabled = false;
  document.getElementById("setupBtn").disabled = false;
  if(timer) {
    for(var i = 0; i < timer.length; ++i) {
      if(timer[i]) {
        window.clearTimeout(timer[i]);
      }
    }
    timer = null;
  } 
}