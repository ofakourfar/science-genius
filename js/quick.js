/* ScienceGenius - an addon for SMART Notebook(R)
* Copyright (C) 2016 Omid Fakourfar and SMART Technologies
* This source code is licensed under a permissive open source license.
* See the LICENSE file for full license text. */

var timestamps = JSON.parse(sessionStorage.timeStorage);
var selectedFont = "";
var selectedTheme = "";
var gifWidth;


function loadLyrics(){
  var lyrics = JSON.parse(sessionStorage.lyricsArray);
  console.log(lyrics);
  document.getElementById("lyrics").innerHTML = lyrics;
  var trackName = JSON.parse(sessionStorage.trackName);
  document.getElementById("player").setAttribute("src", "./mp3/"+trackName);
}

/* 
// Goes back to the lyrics compose page.
*/
function back(){
  window.location.href = "./lyrics.html";
}

/* 
// This function is triggered when the user selects a font for quick setup.
*/
function fontSelected(){
  selectedFont = document.querySelector('input[name = "fontOptions"]:checked').value;
  document.getElementById("colorChooser").style.fontFamily = selectedFont;
  document.getElementById("colorChooser").style.visibility = "visible";
}

/* 
// This function is triggered when the user selects a color theme for quick setup.
*/
function themeSelected(){
  selectedTheme = document.querySelector('input[name = "themeOptions"]:checked').value;
  document.getElementById("nextPage").style.visibility = "visible";
}

/* 
// Navigates to the next (last) page after creating NB pages for all the slides and storing the timestamps in sessionStorage.
*/
function next(){
  deleteAllPages();
  setTitlePage();
  for (var i = 1 ; i < timestamps.length; i++) {
      createNewNBPage(i);
  }
  var pages = NB.document.getPages();
  for (id in pages){
    NB.document.viewPreviousPage();
  }

  var str = JSON.stringify(timestamps);
  sessionStorage.timeStorage = str;
  window.location.href = "./last.html";
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
// Sets up the title page for the presentation. Sets and insterts the caption, as well as the random gif.
*/
function setTitlePage(){
  if (document.getElementById("titleInput").value == "")
    var caption = new NB.objectPrototype.text("My Rap Title");
  else
    var caption = new NB.objectPrototype.text(document.getElementById("titleInput").value);
  var stamp = timestamps[0];
  var track = sessionStorage.trackName;
  var fullLyrics = String(sessionStorage.plainLyrics);
  titlePage = NB.document.getPage(NB.document.getCurrentPageId()); 
  titlePage.addObject(caption);  
  var pageObjects = NB.page.getObjectsAsArray();
  var titleText = pageObjects[0];
  setTheme(titlePage, titleText);
  titleText.font.size = 24;
  titleText.font.name = selectedFont;
  titleText.x = (NB.page.width / 2) - (titleText.width / 2) - 10;
  titleText.y = 380;
  titleText.lockType = "Allow Move";
  titleText.setCustomProperty("startTime", stamp);
  titleText.setCustomProperty("trackName", track);
  titleText.setCustomProperty("fullLyrics", fullLyrics);
  var gifUrl = putRandomGiphy(titleText);
  var gif;
  if (gifUrl == "empty"){

  }
  else{
    gif = new NB.objectPrototype.file(gifUrl);
    gif.x = (NB.page.width / 2) - (gifWidth / 2) - 10;
    gif.y = 10;
    NB.addObject(gif);
  }
  
}

/* 
// Create new NB Page and set the caption. Also puts a random gif.
*/
function createNewNBPage(index){
  var lines = JSON.parse(sessionStorage.lyricsArray);
  var caption = new NB.objectPrototype.text(lines[index-1]);
  var stamp = timestamps[index];
  var track = sessionStorage.trackName;
  var fullLyrics = String(sessionStorage.plainLyrics);
  newPage = NB.document.addPage(); 
  newPage.addObject(caption);
  var pageObjects = NB.page.getObjectsAsArray();
  var newText = pageObjects[0];
  thisPage = NB.document.getPage(NB.document.getCurrentPageId()); 
  setTheme(thisPage, newText);
  newText.font.size = 24;
  newText.font.name = selectedFont;
  newText.x = (NB.page.width / 2) - (newText.width / 2) - 10;
  newText.y = 380;
  newText.moveToFront();
  newText.lockType = "Lock In Place";
  newText.setCustomProperty("startTime", stamp);
  newText.setCustomProperty("fullLyrics", fullLyrics);
  newText.setCustomProperty("trackName", track);
  var gifUrl = putRandomGiphy(newText);
  var gif;
  if (gifUrl == "empty"){

  }
  else{
    gif = new NB.objectPrototype.file(gifUrl);
    gif.x = (NB.page.width / 2) - (gifWidth / 2) - 10;
    gif.y = 10;
    NB.addObject(gif);
  }
  
}

/* 
// Sets a color theme for all the NB pages.
*/
function setTheme(page, text){
  var background;
  var foreground;
  if (selectedTheme == "black"){
    background = [0, 0, 0];
    foreground = [255, 255, 255];
  }
  else if (selectedTheme == "red"){
    background = [96, 24, 22];
    foreground = [252, 155, 151];
  }
  else if (selectedTheme == "blue"){
    background = [51, 84, 96];
    foreground = [187, 226, 240];
  }
  else if (selectedTheme == "yellow"){
    background = [255, 248, 191];
    foreground = [96, 93, 72];
  }
  else if (selectedTheme == "green"){
    background = [79, 96, 78];
    foreground = [209, 255, 208];
  }
  else if (selectedTheme == "white"){
    background = [255, 255, 255];
    foreground = [0, 0, 0];
  }
  page.fill.color = background;
  text.stroke.color = foreground;
}

/* 
// Searches for a random gif based on the input caption. Search is according to the caption words, excluding those which have less than 3 letters.
// Returns the URL for the selected gif.
*/
function putRandomGiphy(caption){
  var gifSource = "";
  var text = caption.text;
  var words = text.split(" ");
  var qualifiedWords = [];
  for (var i = 0; i < words.length; i++){
    if (words[i].length > 2){
      qualifiedWords.push(words[i]);
    }
  }

  if (qualifiedWords.length == 0)
    return "empty";

  var randomWord = qualifiedWords[Math.floor(Math.random() * qualifiedWords.length)];
  console.log(randomWord);
  var api = "http://api.giphy.com/v1/gifs/search?&rating=g";
  var apiKey = "&api_key=dc6zaTOxFJmzC";
  var q = "&q=";
  var query = randomWord;
  var url = api + apiKey + q + query;

  request = new XMLHttpRequest;
  request.open('GET', url, false);
  
  request.onload = function() {
    if (request.status >= 200 && request.status < 400){
      allGifs = JSON.parse(request.responseText).data;
      var index = Math.floor(Math.random() * allGifs.length);
      if (JSON.parse(request.responseText).data[index].images.original.height < 375)
        gifSource = JSON.parse(request.responseText).data[index].images.original.url;
      else
        gifSource = JSON.parse(request.responseText).data[index].images.fixed_height_small.url;
      gifWidth = JSON.parse(request.responseText).data[index].images.original.width;       
    } else {
      console.log('reached giphy, but API returned an error');
     }
  };

  request.onerror = function() {
    console.log('connection error');
  };

  request.send();

  return gifSource;

}
