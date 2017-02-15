var songData = angular.module('songData', []);

var model = {};

songData.run(function($rootScope ,$http, $compile) {
    $http.get("https://beatlesws.herokuapp.com/getAllSongs").success(function(data){
        model = data;
        $rootScope.$broadcast('init');
    });
});

songData.controller('songscontroller', ['$scope', '$rootScope', '$compile', function($rootScope, $scope, $compile){
    function init() {
        $scope.beatles = [];
        $scope.rolling = [];
        var beatlesArr = [];
        var rollingArr = [];
        var datesArr = [];

        //dividing songs from DB according to band's name
        for(var i = 0; i<model.length; i++){
            var dateString = model[i].release_date;
            if(dateString[1] == '/') {
                dateString = "0".concat("",dateString); //adding '0' to month, if there isn't
            }
            var dateArr = dateString.split("/");
            var d = new Date(dateArr[0] + " 1 " +dateArr[1]); //adding day 01 to initialize date object
            model[i].release_date = dateString;
            model[i].date = d;
            model[i].month = dateArr[0];
            model[i].year = dateArr[1];
            if(model[i].band_name == "Beatles"){
                beatlesArr.push(model[i]); //pushing beatles songs to beatlesArr
            }
            else {
                rollingArr.push(model[i]); //pushing rolling songs to rollingArr
            }
        }

        //building datesArr which contains all dates from 1962 to 1970
        for(var i = 1962; i<=1970; i++){
            for(var j = 1; j<=12; j++){
                if(j<10) j = "0"+j;
                var d = j+"/"+i;
                datesArr.push(d);
            }     
        }

        //sorting arrays chronologically by date
        beatlesArr.sort(function(a,b) { 
            return a.date - b.date;
        });

        rollingArr.sort(function(a,b) { 
            return a.date - b.date;
        });

        var counter = 0; //given to blank lines in order to prevent duplicates  
        var songsArray = []; //object that contains all dates, with their matching beatles & rolling songs

        //match date to beatles & rolling songs in this date
        for(var j = 0; j<datesArr.length; j++){ //for every date
            var beatlesSongsPerMonth = []; 
            var dateArr = datesArr[j].split("/");
            var month = dateArr[0];
            var year = dateArr[1];
            for(var i = 0; i<beatlesArr.length; i++){ //checking which beatles songs match the date
                if(beatlesArr[i].month == month && beatlesArr[i].year == year) beatlesSongsPerMonth.push(beatlesArr[i]); 
            } 
            var rollingSongsPerMonth = [];
            var dateArr = datesArr[j].split("/");
            var month = dateArr[0];
            var year = dateArr[1];
            for(var i = 0; i<rollingArr.length; i++){ //checking which rolling songs match the date
                if(rollingArr[i].month == month && rollingArr[i].year == year) rollingSongsPerMonth.push(rollingArr[i]); 
            }
            var diff = 0;
            //adding blank lines if needed
            if(rollingSongsPerMonth.length != 0 || beatlesSongsPerMonth.length != 0){
                if(beatlesSongsPerMonth.length < rollingSongsPerMonth.length) {
                    diff = rollingSongsPerMonth.length - beatlesSongsPerMonth.length;                
                    for(var k = 0; k<diff; k++){
                        beatlesSongsPerMonth.push({
                            band_name: "emptyBand",
                            release_date: datesArr[j],
                            emotion_fear: "emptyRow",
                            emotion_joy: "emptyRow",
                            song_writer: "",
                            album_name: "",
                            emotion_anger: "emptyRow",
                            song_lyrics: "",  
                            song_name: counter,
                            emotion_sadness: "emptyRow"
                        });
                        counter++;
                    }
                } else {
                    diff = beatlesSongsPerMonth.length - rollingSongsPerMonth.length;
                    for(var k = 0; k<diff; k++) {
                        rollingSongsPerMonth.push({band_name: "emptyBand",
                            release_date: datesArr[j],
                            emotion_fear: "emptyRow",
                            emotion_joy: "emptyRow",
                            song_writer: "",
                            album_name: "",
                            emotion_anger: "emptyRow",
                            song_lyrics: "",  
                            song_name: counter,
                            emotion_sadness: "emptyRow"
                        });
                        counter++;
                    }
                }
            }
            //checking for dates without any songs, and giving them proper id
            var emptyDate;
            if(rollingSongsPerMonth.length==0 && beatlesSongsPerMonth==0) emptyDate = "empty";
                else emptyDate = "full"; 
            var songObject = { "date": datesArr[j], "beatlesSongs": beatlesSongsPerMonth, "rollingSongs": rollingSongsPerMonth, "id": emptyDate};
            songsArray.push(songObject); 
        }    
        $scope.songs = songsArray;
    }

    //show chosen song details and lyrics when mouse clicked
    $scope.showSong = function(songName, bandName, writerName, albumName, releaseDate, songLyrics) {
        if(bandName != "emptyBand"){
            var row = angular.element(event.currentTarget);
            if(bandName == "Beatles"){    
                if($scope.bSongChosen != null) {
                    if(!(angular.equals(row, $scope.bSongChosen))){ 
                        $scope.bSongChosen.removeClass('chosenSong');
                        $scope.bChoose = true;
                        $scope.bFlag = 0;
                    } else { 
                        if($scope.bFlag == 1) {
                            $scope.bChoose = true;
                            $scope.bFlag = 0;
                        }
                        else {
                            $scope.bChoose = false; 
                            $scope.bFlag = 1;
                        }
                    } 
                } else { $scope.bChoose = true; }
                $scope.bSongChosen = row;
                var songSec = "";
                songSec = angular.element(document.querySelector('#bSong'));
                if($scope.bChoose == false) { 
                    row.removeClass('chosenSong'); 
                    songSec.html("");  
                }
                else { 
                    row.addClass('chosenSong');
                    var song = '<h1 id = "songName" class="animatedSong fadeIn">' + songName +'</h1> <p id = "songDetails" class="animatedSong fadeIn"> <b> writer(s): </b>'
                    + writerName + '<br> <b> Album: </b>' + albumName
                    + '<br> <b> Released: </b>' + releaseDate + '</p>'
                    + '<p id = "lyrics" class="animatedSong fadeIn">' + songLyrics +'</p>';
                    songSec.html(song);  
                }
            } else if(bandName == "Rolling Stones") {
                if($scope.rSongChosen != null) {
                    if(!(angular.equals(row, $scope.rSongChosen))){ 
                        $scope.rSongChosen.removeClass('chosenSong');
                        $scope.rChoose = true;
                        $scope.rFlag = 0;
                    } else { 
                         if($scope.rFlag == 1) {
                            $scope.rChoose = true;
                            $scope.rFlag = 0;
                        }
                        else {
                            $scope.rChoose = false; 
                            $scope.rFlag = 1;
                        }
                    }
                } else { $scope.rChoose = true; }
                $scope.rSongChosen = row;
                var songSec = "";
                songSec = angular.element(document.querySelector('#rSong'));
                if($scope.rChoose == false) { 
                    $scope.showRSong = false;
                    row.removeClass('chosenSong'); 
                    songSec.html("");  
                }
                else { 
                    row.addClass('chosenSong');
                    $scope.showRSong = true;
                    var song = '<h1 id = "songName" class="animatedSong fadeIn">' + songName +'</h1> <p id = "songDetails" class="animatedSong fadeIn"> <b> writer(s): </b>'
                    + writerName + '<br> <b> Album: </b>' + albumName
                    + '<br> <b> Released: </b>' + releaseDate + '</p>'
                    + '<p id = "lyrics" class="animatedSong fadeIn">' + songLyrics +'</p>';
                    songSec.html(song);  
                }
            }  
        }   
    }    
 
    //handeling hovering each song
    $scope.hoverSong = function(songName, bandName, releaseDate) {
        if(bandName != "emptyBand") {
            var songSec = "";
            if(bandName == "Beatles") {
                songSec = angular.element(document.querySelector('#bSongNameSec'));
            } else if(bandName == "Rolling Stones") {
                songSec = angular.element(document.querySelector('#rSongNameSec'));
            }
            var song = '<h1 id = "hoverSongName">' + songName +'</h1>'; 
            songSec.html(song); 
        }
            dateSec = angular.element(document.querySelector('#headDate'));
            dateSec.html(releaseDate);
    }

    //handeling hover-out each song
    $scope.coverSong = function(bandName) {
        if(bandName != "emptyBand"){
            if(bandName == "Beatles") {
                songSec = angular.element(document.querySelector('#bSongNameSec'));
            } else if(bandName == "Rolling Stones") {
                songSec = angular.element(document.querySelector('#rSongNameSec'));
            }  
            songSec.html(""); 
        }
    }

    var unbindHandler = $rootScope.$on('init', function($scope){
        init();
        unbindHandler();
    });
}]);

