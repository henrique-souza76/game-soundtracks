//HTML elements
const body = document.querySelector("body");
const musicList = document.getElementById("music-list");

//CATCH VIDEO DATA
let videoIds = [];
let videoThumbs = [];
let videoIdsCopy = [];
let videoThumbsCopy = [];
let videoId;
let videoThumb;
let requisitionStatus = 0;
let videoTitles = [];

async function catchVideoData() {
    let playlistItems =  await fetch(`https://youtubeapi-henrique.000webhostapp.com/api/get_content-details.php`)
    .then(response => response.json());

    let playlistItemSnippet = await fetch(`https://youtubeapi-henrique.000webhostapp.com/api/get_snippet.php`)
    .then(response => response.json());

    for(let itemIndex = 0; itemIndex < playlistItems.pageInfo.totalResults;) {
        playlistItems.items.map(data => {
            videoIds.push(data.contentDetails.videoId);
        });

        playlistItemSnippet.items.map(data => {
            if(data.snippet.thumbnails.maxres) videoThumbs.push(data.snippet.thumbnails.maxres.url);
            else videoThumbs.push(data.snippet.thumbnails.high.url);

            videoTitles.push(data.snippet.title);

            itemIndex++;
        });
    
        if(playlistItems.nextPageToken) {
            playlistItems = await fetch(`https://youtubeapi-henrique.000webhostapp.com/api/get_content-details.php?pageToken=${playlistItems.nextPageToken}`).then(response => response.json());

            playlistItemSnippet = await fetch(`https://youtubeapi-henrique.000webhostapp.com/api/get_snippet.php?pageToken=${playlistItemSnippet.nextPageToken}`).then(response => response.json());
        }
    }

    requisitionStatus = 1;
}

const duplicate = (original) => [...original];

const removeElement = (element) => (index) => element.splice(index, 1);
const removeVideo = removeElement(videoIds);
const removeThumb = removeElement(videoThumbs);

const selectRandomVideoId = () => {
    const randomIndex = Math.floor(Math.random() * videoIds.length);

    videoId = videoIds[randomIndex];
    videoThumb = videoThumbs[randomIndex];
    removeVideo(randomIndex);
    removeThumb(randomIndex);
}

//SETUP IFRAME
function startPlayer(event) {
    const awaitRequisition = setInterval(() => {
        if(requisitionStatus === 1) {
            selectRandomVideoId();

            player.loadVideoById(videoId);
            body.style.backgroundImage = `url(${videoThumb})`;

            event.target.playVideo();

            clearInterval(awaitRequisition);
        }
    }, 700);
}

//This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

//This function creates an <iframe> (and YouTube player) after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '360',
        width: '640',
        events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
        }
    });
}

const onPlayerReady = (event) => startPlayer(event);

function onPlayerStateChange(event) {
    if(event.data == 0) {
        if(videoIds.length !== 0) startPlayer(event);
        else {
            videoIds = [...videoIdsCopy];
            videoThumbs = [...videoThumbsCopy];
            
            startPlayer(event);
        }
    }
}

//SETUP SCREEN ELEMENTS
function setupMusicList() {
    for(let i = 0; i < videoTitles.length; i++) {
        const button = document.createElement("button");
        button.onclick = () => {
            player.loadVideoById(videoIdsCopy[i]);
            body.style.backgroundImage = `url(${videoThumbsCopy[i]})`;
            if(videoIdsCopy[i] == videoIds[i]) {
                removeVideo(i);
                removeThumb(i);
            }
        };
        button.appendChild(document.createTextNode(videoTitles[i]));

        musicList.appendChild(button);
    }
}

function setupBorderAnimation() {
    const divIframe = document.getElementById("player");
    divIframe.classList.add("border-animation");
}

//START PROGRAM
catchVideoData();

const awaitRequisition = setInterval(() => {
    if(requisitionStatus === 1) {
        videoIdsCopy = duplicate(videoIds);
        videoThumbsCopy = duplicate(videoThumbs);

        setupMusicList();
        setupBorderAnimation();

        clearInterval(awaitRequisition);
    }
}, 700);