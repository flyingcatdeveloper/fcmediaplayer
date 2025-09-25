if ('serviceWorker' in navigator) {
    window.addEventListener('load',async ()=> {
        try {
            const registration = await navigator.serviceWorker.register('./src/scripts/serviceWorker.js', {
            }, {
                scope: '/'
            });
            if (registration.active) {
                console.log('[ServiceWorker] - Activation successful');
            } else if (registration.installing) {
                console.log('[ServiceWorker] - Service worker installing');
            } else {
                console.error("[ServiceWorker] - Activation failed");
            }
        } catch {
            console.error("[ServiceWorker] - Activation failed (catch)");
        }
    });
} else {
    console.error('[ServiceWorker] - Failed to find serviceWorker in navigator');
}

const jsmediatags = window.jsmediatags;
const audio = new Audio();
const songHolder = document.getElementById("song");
const videoPlayer = document.getElementById("video");
const backButton = document.getElementById("back");
const playPauseButton = document.getElementById("playpause");
const skipButton = document.getElementById("skip");
const back15Button = document.getElementById("back15");
const forward15Button = document.getElementById("forward15");
const errorText = document.getElementById("errorText");
const timeRangeSlider = document.getElementById("timeRange");
const timeHolder = document.getElementById("timeHolder");
const fullscreenButton = document.getElementById("fullscreen");
var videoInterval;
var audioInterval;
var files, totalFiles, fileCount, playStatus, playerType, fullDuration, durationString, currentTime, brokenList, brokenCount;

function openFullscreen() {
  if (videoPlayer.requestFullscreen) {
    videoPlayer.requestFullscreen();
  } else if (videoPlayer.mozRequestFullscreen) {
    videoPlayer.mozRequestFullscreen();
  } else if (videoPlayer.webkitRequestFullscreen) { /* Safari */
    videoPlayer.webkitRequestFullscreen();
  } else if (videoPlayer.msRequestFullscreen) { /* IE11 */
    videoPlayer.msRequestFullscreen();
  }
}


var interval = {
    intervals : new Set(),
    
    make(...args) {
        var newInterval = setInterval(...args);
        this.intervals.add(newInterval);
        return newInterval;
    },

    clear(id) {
        this.intervals.delete(id);
        return clearInterval(id);
    },

    clearAll() {
        for (var id of this.intervals) {
            this.clear(id);
        }
    }
};

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  // Pad with leading zeros if necessary
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  if (formattedHours !== "00") {
      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  } else {
    return `${formattedMinutes}:${formattedSeconds}`;
  }
}

document.getElementById("selector").addEventListener("change", (event) => {
    interval.clearAll();
    files = null;
    videoPlayer.src = "";
    audio.src = "";
    files = event.target.files;
    totalFiles = (files.length) - 1;
    fileCount = 0;
    playStatus = true;
    playerType = "";
    fullDuration = 0;
    durationString = "";
    currentTimeString = "00:00";
    brokenList = [];
    brokenCount = -1;
    
    function audioTime() {
        currentTimeString = formatTime(audio.currentTime);
        document.getElementById("currentTime").textContent = currentTimeString;
        timeRangeSlider.value = Math.floor(audio.currentTime);
        if (fullDuration <= audio.currentTime) {
            fileCount++;
            if (fileCount > totalFiles) {
                fileCount = 0;
            }
            tryToPlay(true);
        }
    }

    function videoTime() {
        currentTimeString = formatTime(videoPlayer.currentTime);
        document.getElementById("currentTime").textContent = currentTimeString;
        timeRangeSlider.value = Math.floor(videoPlayer.currentTime);
        if (fullDuration <= videoPlayer.currentTime) {
            fileCount++;
            if (fileCount > totalFiles) {
                fileCount = 0;
            }
            tryToPlay(true);
        }
    }

    if (totalFiles < 0) {
        audio.src = "";
        videoPlayer.src = "";
        document.title = "Media Player";
        errorText.textContent = "Can't play files.";
        videoPlayer.style.display = "none";
        songHolder.style.display = "none";
        timeHolder.style.display = "none";
        back15Button.style.display = "none";
        forward15Button.style.display = "none";
        skipButton.style.display = "none";
        fullscreenButton.style.display = "none";
        backButton.style.display = "none";
        playPauseButton.style.display = "none";
        errorText.style.display = "block";
    } else {
        tryToPlay();
    }


    function tryToPlay(wasAuto, back) {
        interval.clearAll();
        if (files[fileCount].type.includes("audio")) {
            try {
                playSong(fileCount);
                if(wasAuto) {
                    playStatus = true;
                    playPauseButton.value = "Pause";
                    audio.play();
                }
            } catch {
                if (!brokenList[fileCount]) {
                    brokenCount++;
                    brokenList[fileCount] = true;
                }
                if (back) {
                    if (fileCount <= 0) {
                        fileCount = totalFiles;
                    } else {
                        fileCount--;
                    }
                } else {
                    if (fileCount >= totalFiles) {
                        fileCount = 0;
                    } else {
                        fileCount++;
                    }
                }
                if ((fileCount <= totalFiles) && (fileCount >= 0)) {
                    tryToPlay(wasAuto, back)
                } else if ((fileCount < 0) || (fileCount > totalFiles))  {
                    fileCount = 0; 
                    tryToPlay(wasAuto, back);
                } else {
                    document.getElementById("favicon").href = "./favicon.ico";
                    audio.src = "";
                    videoPlayer.src = "";
                    document.title = "Media Player";
                    errorText.textContent = "Can't play files.";
                    videoPlayer.style.display = "none";
                    songHolder.style.display = "none";
                    timeHolder.style.display = "none";
                    back15Button.style.display = "none";
                    forward15Button.style.display = "none";
                    skipButton.style.display = "none";
                    fullscreenButton.style.display = "none";
                    backButton.style.display = "none";
                    playPauseButton.style.display = "none";
                    errorText.style.display = "block";
                }
            }
        } else if (files[fileCount].type.includes("video")) {
            try {
                playVideo(fileCount);
                if(wasAuto) {
                    playStatus = true;
                    playPauseButton.value = "Pause";
                    videoPlayer.play();
                }
            } catch {
                if (!brokenList[fileCount]) {
                    brokenCount++;
                    brokenList[fileCount] = true;
                }
                if (back) {
                    if (fileCount <= 0) {
                        fileCount = totalFiles;
                    } else {
                        fileCount--;
                    }
                } else {
                    if (fileCount >= totalFiles) {
                        fileCount = 0;
                    } else {
                        fileCount++;
                    }
                }
                if ((fileCount <= totalFiles) && (fileCount >= 0)) {
                    tryToPlay(wasAuto, back);
                } else if ((fileCount < 0) || (fileCount > totalFiles)) {
                    fileCount = 0;
                    tryToPlay(wasAuto, back);
                }  else {
                    audio.src = "";
                    videoPlayer.src = "";
                    document.title = "Media Player";
                    errorText.textContent = "Can't play files.";
                    videoPlayer.style.display = "none";
                    songHolder.style.display = "none";
                    timeHolder.style.display = "none";
                    back15Button.style.display = "none";
                    forward15Button.style.display = "none";
                    skipButton.style.display = "none";
                    fullscreenButton.style.display = "none";
                    backButton.style.display = "none";
                    playPauseButton.style.display = "none";
                    errorText.style.display = "block";
                }
            }
        } else {
            if (!brokenList[fileCount]) {
                brokenCount++;
                brokenList[fileCount] = true;
            }
            if (back) {
                if (fileCount <= 0) {
                    fileCount = totalFiles;
                } else {
                    fileCount--;
                }
            } else {
                if (fileCount >= totalFiles) {
                    fileCount = 0;
                } else {
                    fileCount++;
                }
            }
            if ((fileCount <= totalFiles) && (fileCount >= 0)) {
                tryToPlay(wasAuto,back);
            } else if ((fileCount < 0) || (fileCount > totalFiles)) {
                fileCount = 0;
                tryToPlay(wasAuto,back);
            } else {
                fileCount++;
                audio.src = "";
                videoPlayer.src = "";
                document.title = "Media Player";
                errorText.textContent = "Can't play files.";
                videoPlayer.style.display = "none";
                songHolder.style.display = "none";
                timeHolder.style.display = "none";
                back15Button.style.display = "none";
                forward15Button.style.display = "none";
                skipButton.style.display = "none";
                fullscreenButton.style.display = "none";
                backButton.style.display = "none";
                playPauseButton.style.display = "none";
                errorText.style.display = "block";
            }
        }
    }
    function playVideo(num) {
        errorText.style.display = "none";
        playerType = "video";
        audio.src = "";
        songHolder.style.display = "none";
        var videoUrl = URL.createObjectURL(files[num]);
        videoPlayer.src = videoUrl;
        videoPlayer.style.display = "block";
        videoPlayer.addEventListener("loadedmetadata", () => {
            timeRangeSlider.max = Math.floor(videoPlayer.duration);
            timeRangeSlider.min = 0;
            timeRangeSlider.value = Math.floor(videoPlayer.currentTime);
            fullscreenButton.style.display = "block";
            backButton.style.display = "inline-block";
            playPauseButton.style.display = "inline-block";
            skipButton.style.display = "inline-block";
            back15Button.style.display = "inline-block";
            forward15Button.style.display = "inline-block";
            document.getElementById("currentTime").textContent = currentTimeString;
            fullDuration = videoPlayer.duration;
            durationString = formatTime(fullDuration);
            document.getElementById("duration").textContent = durationString;
            timeHolder.style.display = "block";
            videoInterval = interval.make(videoTime, 1000);
            document.title = "Playing a video";
            document.getElementById("favicon").href = "./favicon.ico";
            if (playStatus) {
                videoPlayer.play();
                playPauseButton.value = "Pause";
            }
            navigator.mediaSession.metadata = new MediaMetadata({
                title: "Video"
            })
        })
    }
    function playSong(num) {
        errorText.style.display = "none";
        playerType = "audio";
        videoPlayer.src = "";
        videoPlayer.style.display = "none";
        songHolder.style.display = "block";
        var audioUrl = URL.createObjectURL(files[num]);
        audio.src = audioUrl;
        fullDuration = 0;
        durationString = "";
        currentTimeString = "00:00";
        audio.addEventListener("loadedmetadata", () => {
            timeRangeSlider.max = Math.floor(audio.duration);
            timeRangeSlider.min = 0;
            timeRangeSlider.value = Math.floor(audio.currentTime);
            fullscreenButton.style.display = "none";
            backButton.style.display = "inline-block";
            playPauseButton.style.display = "inline-block";
            back15Button.style.display = "inline-block";
            forward15Button.style.display = "inline-block";
            skipButton.style.display = "inline-block";
            document.getElementById("currentTime").textContent = currentTimeString;
            fullDuration = audio.duration;
            durationString = formatTime(fullDuration);
            document.getElementById("duration").textContent = durationString;
            timeHolder.style.display = "block";
            audioInterval = interval.make(audioTime, 1000);
            if (playStatus) {
                audio.play();
                playPauseButton.value = "Pause";
            }
        })

        jsmediatags.read(files[num], {
            onSuccess: function(tag) {
                var pictureLink = placeholderBase64;
                var title = "Untitled",
                artist = "Unknown",
                album = "Unknown",
                artwork = [{src: placeholderBase64, sizes: "250x250"}];
                if (tag.tags.picture) {
                    var data = tag.tags.picture.data;
                    var format = tag.tags.picture.format;
                    let base64String = "";
                    for (let i = 0; i < data.length; i++) {
                        base64String += String.fromCharCode(data[i]);
                    }
                    document.getElementById("cover").style.backgroundImage = `url(data:${format};base64,${window.btoa(base64String)})`;
                    document.getElementById("favicon").href = `data:${format};base64,${window.btoa(base64String)}`;
                    pictureLink = `data:${format};base64,${window.btoa(base64String)}`;
                    artwork = [{src: pictureLink, sizes: "250x250"}];
                } else {
                    document.getElementById("cover").style.backgroundImage = `url(${placeholderBase64})`;
                    document.getElementById("favicon").href = placeholderBase64;
                }
                if (tag.tags.title) {
                    document.getElementById("title").textContent = tag.tags.title;
                    title = tag.tags.title;
                } else {
                    document.getElementById("title").textContent = "Untitled";
                }
                if (tag.tags.artist) {
                    document.getElementById("artist").textContent = tag.tags.artist;
                    artist = tag.tags.artist;
                } else {
                    document.getElementById("artist").textContent = "Unknown";
                }
                if (tag.tags.album) {
                    document.getElementById("album").textContent = tag.tags.album;
                    album = tag.tags.album;
                } else {
                    document.getElementById("album").textContent = "Unknown";
                }
                if (tag.tags.title && tag.tags.artist) {
                    document.title = "Playing " + `"` + tag.tags.title + `"` + " by " + tag.tags.artist;
                } else if (tag.tags.title) {
                    document.title = "Playing " + `"` + tag.tags.title + `"`;
                } else if (tag.tags.artist) {
                    document.title = "Playing an audio by " + tag.tags.artist;
                } else {
                    document.title = "Playing an audio";
                }

                navigator.mediaSession.metadata = new MediaMetadata({
                    title: title,
                    artist: artist,
                    album: album,
                    artwork: artwork
                });
            },
            onError: function() {
                document.getElementById("cover").style.backgroundImage = `url("${placeholderBase64}")`;
                document.getElementById("favicon").href = `${placeholderBase64}`;
                document.getElementById("title").textContent = "Untitled";
                document.getElementById("artist").textContent = "Unknown";
                document.getElementById("album").textContent = "Unknown";
                document.title = "Playing an audio";
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: "Untitled",
                    artwork: [{
                        src: placeholderBase64,
                        sizes: '250x250'
                    }]
                })
            }
        })
    }

    var tryingToPause = false;

    function goBack() {
        if (fileCount <= 0) {
            fileCount = totalFiles;
        } else {
            fileCount--;
        }
        if (!playStatus) {
            tryingToPause = true;
            playStatus = true;
            tryToPlay(false, true);
        } else {
            tryToPlay(false, true);
        }
    } 
    backButton.onclick = function() {goBack();};

    function forward15() {
        if (playerType === "audio") {
            var newTime = (audio.currentTime + 15);
            if (newTime > fullDuration) {
                newTime = fullDuration;
            }
            audio.currentTime = newTime;
        } else if (playerType === "video") {
            var newTime = (videoPlayer.currentTime + 15);
        if (newTime > fullDuration) {
                    newTime = fullDuration;
        }
            videoPlayer.currentTime = newTime;
        }
    }
    forward15Button.onclick = function() {forward15();};

    function back15() {
        if (playerType === "audio") {
            var newTime = (audio.currentTime - 15);
            if (newTime < 0) {
                newTime = 0;
            }
            audio.currentTime = newTime;
        } else if (playerType === "video") {
            var newTime = (videoPlayer.currentTime - 15);
            if (newTime < 0) {
                newTime = 0;
            }
            videoPlayer.currentTime = newTime;
        }
    }
    back15Button.onclick = function() {back15();};

    function playPause() {
        if (playStatus) {
            if (playerType === "audio") {
                audio.pause();
                playStatus = false;
                playPauseButton.value = "Play";
            } else if (playerType === "video") {
                videoPlayer.pause();
                playStatus = false;
                playPauseButton.value = "Play";
            }
            navigator.mediaSession.playbackState = 'paused';
        } else {
            if (playerType === "audio") {
                audio.play();
                playStatus = true;
                playPauseButton.value = "Pause";
            } else if (playerType === "video") {
                videoPlayer.play();
                playStatus = true;
                playPauseButton.value = "Pause";
            }
            navigator.mediaSession.playbackState = 'playing';
        }
    }
    playPauseButton.onclick = function() {playPause();};

    function skipMedia() {
        if (fileCount >= totalFiles) {
            fileCount = 0;
        } else {
            fileCount++;
        }
        if (!playStatus) {
            tryingToPause = true;
            playStatus = true;
            tryToPlay();
        } else {
            tryToPlay();
        }
    }
    skipButton.onclick = function() {skipMedia();};

    timeRangeSlider.onchange = function() {
        if (playerType === "audio") {
            audio.currentTime = timeRangeSlider.value;
        } else if (playerType === "video") {
            videoPlayer.currentTime = timeRangeSlider.value;
        }
    }

    fullscreenButton.onclick = function() {
        if (playerType === "video") {
            openFullscreen();
        }
    }

    document.addEventListener("fullscreenchange", () => {
        if (!document.fullscreenElement) {
            if (playerType === "video") {
                if (videoPlayer.paused) {
                    playStatus = false;
                    playPauseButton.value = "Play";
                } else {
                    playStatus = true;
                    playPauseButton.value = "Pause";
                }
            }
        }
    })

    audio.addEventListener("playing", function() {
        if (tryingToPause) {
            playPause();
            tryingToPause = false;
        }
    })

    videoPlayer.addEventListener("playing", function() {
        if (tryingToPause) {
            playPause();
            tryingToPause = false;
        }
    })

    navigator.mediaSession.setActionHandler("pause", () => {
        playStatus = false;
        if(playerType === "audio") {
            audio.pause();
        } else if (playerType === "video") {
            videoPlayer.pause();
        }
        playPauseButton.value = "Play";
        navigator.mediaSession.playbackState = "paused";
    })

    navigator.mediaSession.setActionHandler("play", () => {
        playStatus = true;
        if(playerType === "audio") {
            audio.play();
        } else if (playerType === "video") {
            videoPlayer.play();
        }
        playPauseButton.value = "Pause";
        navigator.mediaSession.playbackState = "playing";
    })

    navigator.mediaSession.setActionHandler("previoustrack", () => {
        goBack();
        if (playStatus) {
            navigator.mediaSession.playbackState = "playing";
        } else {
            navigator.mediaSession.playbackState = "paused";
        }
    })

    navigator.mediaSession.setActionHandler("nexttrack", () => {
        skipMedia();
        if (playStatus) {
            navigator.mediaSession.playbackState = "playing";
        } else {
            navigator.mediaSession.playbackState = "paused";
        }
    })
})