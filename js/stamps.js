/* ScienceGenius - an addon for SMART Notebook(R)
* Copyright (C) 2016 Omid Fakourfar and SMART Technologies
* This source code is licensed under a permissive open source license.
* See the LICENSE file for full license text. */

var lines = [];
var timestamps = [];
var bigBtnLine = 1;
var editMode = false;
document.getElementById("nextLine").disabled = true;

/*
// This function retrieves the lyrics from sessionStorage.
// It also retrieves the selected track and attaches it to the player.
*/
function loadLyrics(){
  var lyrics = JSON.parse(sessionStorage.lyricsArray);
  console.log(lyrics);
  document.getElementById("lyrics").innerHTML = lyrics;
  var trackName = JSON.parse(sessionStorage.trackName);
  document.getElementById("player").setAttribute("src", "./mp3/"+trackName);
  if (sessionStorage.getItem("timeStorage") !== null)
    editMode = true;
}


/*
// Play button event listener. Plays the track and disables the play button.
// It also runs the "tablify" function which populates the lyrics table (only once).
*/
function play() {
  document.getElementById("player").play();
  document.getElementById("playBtn").disabled = true;
  document.getElementById("nextLine").disabled = false;  
  // Only tablify at the beginning
  if (document.getElementById("player").currentTime < 0.1)
    tablify();
}

/*
// Pause button event listener. Pauses the track and enables the Play button.
*/
function pause() {
  document.getElementById("player").pause();
  document.getElementById("playBtn").disabled = false;
  document.getElementById("nextLine").disabled = true;
}

/*
// Stop button event listener. Stops the track and resets the time to 0, enables the Play button.
// It also clears the "Lines" and "Timestamps" dictionaries because they need to be re-populated.
// And clears the table in the window.
*/
function stop() {
  document.getElementById("player").pause();
  document.getElementById("player").currentTime = 0;
  document.getElementById("playBtn").disabled = false;
  document.getElementById("nextLine").disabled = true;

  // Clear the table
  lines = [];
  timestamps = [];
  var table = document.getElementById("lyricsTable");
  table.innerHTML = "<tr style='background-color:#ccc;'><td style='width: 85% font-weight: bold'>Lines</td><td style='text-align: center'>Time</td></tr>"
  document.getElementById("nextPage").style.visibility = "hidden";
}

/*
// Goes back to the lyrics compose page.
*/
function back(){
  window.location.href = "./lyrics.html";
}

/*
// Puts the "0" timestamp for the first (title) page. Deletes all pages (in case the user has added anything as a scratchpad),
// Stores timestamps in sessionStorage and navigates to the next step (quick design).
*/
function next(){
  timestamps[0] = 0;
  if (editMode == false)
    deleteAllPages();

  var str = JSON.stringify(timestamps);
  sessionStorage.timeStorage = str;
  if (editMode == false)
    window.location.href = "./quickSetup.html";
  else
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

function str_pad_left(string,pad,length) {
  return (new Array(length+1).join(pad)+string).slice(-length);
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

/*
// Formats the lyrics into the lyrics table with small indicator buttons to show which line should be time stamped next.
*/
function tablify(){
  var split = JSON.parse(sessionStorage.lyricsArray);
  for (var i = 0; i < split.length; i++)
      lines.push(split[i]);
  console.log(split);
  for (var i = 0; i < split.length; i++){
    var table = document.getElementById("lyricsTable");
    var row = table.insertRow(-1);
    row.style.backgroundColor = "#eee";
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var btn = document.createElement("button");
    if (i == 0) btn.className = "btn btn-info btn-xs";
    else {
      btn.className = "btn btn-info btn-xs disabled";
      btn.disabled = true;
      btn.style.visibility = "hidden";
    }
    btn.innerHTML = "&larr;";
    btn.addEventListener("click", function(j) {return function() {addBtnFunc(j+'');};}(i));
    cell1.innerHTML = split[i];
    cell2.appendChild(btn);
    cell2.style.textAlign = "center";
  }  
}

/* 
// Same functionality as "addBtnFunc" (see below). The only difference is that 
// it is a bigger button so that users won't need to visually track the button location.
*/
function bigBtnFunc(){
  var table = document.getElementById("lyricsTable");
  var player = document.getElementById("player");
  thisBtn = table.rows[bigBtnLine].getElementsByTagName("button")[0];
  saveTimeStamp(bigBtnLine, document.getElementById("player").currentTime);
  thisBtn.className = "btn btn-info btn-xs disabled";
  thisBtn.disabled = true;
  thisBtn.style.visibility = "hidden";
  var minutes = Math.floor(player.currentTime / 60);
  var seconds = Math.floor(player.currentTime - minutes * 60);
  table.rows[bigBtnLine].cells[1].innerHTML = "<span style='color: green; font-weight: bold'>"+ str_pad_left(minutes,'0',2)+':'+str_pad_left(seconds,'0',2); +"</span>";
  // If you still have buttons, enable the next button
  if(table.rows.length > bigBtnLine+1){
    nextBtn = table.rows[bigBtnLine+1].getElementsByTagName("button")[0];
    nextBtn.className = "btn btn-info btn-xs";
    nextBtn.disabled = false;
    nextBtn.style.visibility = "visible";
  }
  // If no more buttons, print "finished" -> to be substituted with the next page
  if (parseInt(bigBtnLine) + 1 >= table.rows.length){
    console.log("finished");
    document.getElementById("nextLine").disabled = true;
    document.getElementById("nextPage").style.visibility = "visible";
  }
  console.log(timestamps);
  bigBtnLine++;
}

/* 
// Line-by-line "add" buttons
// index: the row (line) number for which the button was pressed
// index starts from 0, but the first (0th) row of the table is just headers
// So we might need to add index + 1 when referring to rows
*/
function addBtnFunc(index){
  if (index == 0){
    timestamps = [];
  }
  var player = document.getElementById("player");
  var table = document.getElementById("lyricsTable");
  // Rows start from 1, not zero. So + 1.
  i = parseInt(index) + 1;
  // Get the first (and only) button in the row
  thisBtn = table.rows[i].getElementsByTagName("button")[0];
  // Save the current timestamp to storage. i: row/slide number, currentTime
  saveTimeStamp(i, player.currentTime);
  bigBtnLine++;
  // Disable the clicked button
  thisBtn.className = "btn btn-info btn-xs disabled";
  thisBtn.disabled = true;
  thisBtn.style.visibility = "hidden";
  var minutes = Math.floor(player.currentTime / 60);
  var seconds = Math.floor(player.currentTime - minutes * 60);
  table.rows[i].cells[1].innerHTML = "<span style='color: green; font-weight: bold'>"+ str_pad_left(minutes,'0',2)+':'+str_pad_left(seconds,'0',2); +"</span>";
  // If you still have buttons, enable the next button
  if(table.rows.length > i+1){
    nextBtn = table.rows[i+1].getElementsByTagName("button")[0];
    nextBtn.className = "btn btn-info btn-xs";
    nextBtn.disabled = false;
    nextBtn.style.visibility = "visible";
    console.log(lines);
  }
  // If no more buttons, print "finished" -> to be substituted with the next page
  if (parseInt(index) + 1 >= table.rows.length - 1){
    console.log("finished");
    console.log(timestamps);
    document.getElementById("nextPage").style.visibility = "visible";  
  }
}

/* 
// Saves timestamp for each line to the sessionStorage
// Line: the current line number. Starts from 1.
// StartTime: Start time for the current line number/slide number.
*/
function saveTimeStamp(line, startTime){
  timestamps[line] = startTime;
  console.log("Line #" + line + " starts at: " + startTime);
}