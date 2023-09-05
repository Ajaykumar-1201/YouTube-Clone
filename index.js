const apiKey = "AIzaSyClFqwB1q-yDPV4eq0UmeknB_5ko9BKqWw";
const baseUrl = "https://www.googleapis.com/youtube/v3";

const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");
const container = document.getElementById("container");

function calculateTheTimeGap(publishTime) {
  let publishDate = new Date(publishTime);
  let currentDate = new Date();

  let secondsGap = (currentDate.getTime() - publishDate.getTime()) / 1000;

  const secondsPerDay = 24 * 60 * 60;
  const secondsPerWeek = 7 * secondsPerDay;
  const secondsPerMonth = 30 * secondsPerDay;
  const secondsPerYear = 365 * secondsPerDay;

  if (secondsGap < secondsPerDay) {
    return `${Math.ceil(secondsGap / (60 * 60))}hrs ago`;
  }
  if (secondsGap < secondsPerWeek) {
    return `${Math.ceil(secondsGap / secondsPerWeek)} weeks ago`;
  }
  if (secondsGap < secondsPerMonth) {
    return `${Math.ceil(secondsGap / secondsPerMonth)} months ago`;
  }

  return `${Math.ceil(secondsGap / secondsPerYear)} years ago`;
}

function navigateToVideoDetails(videoId) {
  window.location.href = `videoDetails.html?id=${videoId}`;
}

function formatYouTubeViewCount(viewCountS) {
  const viewCount = parseInt(viewCountS, 10);
  if (viewCount >= 1e9) {
    return (viewCount / 1e9).toFixed(0) + "B";
  } else if (viewCount >= 1e6) {
    return (viewCount / 1e6).toFixed(0) + "M";
  } else if (viewCount >= 1000) {
    return (viewCount / 1000).toFixed(0) + "K";
  } else {
    return viewCount.toLocaleString();
  }
}

function renderVideosOntoUI(videosList) {
  //   videosList will be an array of video objects.
  container.innerHTML = "";
  videosList.forEach((video) => {
    const videoContainer = document.createElement("div");
    videoContainer.className = "video";
    let viewCount = "";
    if (video.statistics === undefined) {
      return;
    } else {
      viewCount = video.statistics.viewCount;
    }
    videoContainer.innerHTML = `
        <img
            src="${video.snippet.thumbnails.high.url}"
            class="thumbnail"
            alt="thumbnail"
        />
        <div class="bottom-container">
            <div class="logo-container">
            <img class="logo" src="${video.channelLogo}" alt="Channel Logo" />
            </div>
            <div class="title-container">
            <p class="title">
                ${video.snippet.title}
            </p>
            <p class="gray-text">${video.snippet.channelTitle}</p>
            <p class="gray-text">${formatYouTubeViewCount(
              viewCount
            )} . ${calculateTheTimeGap(video.snippet.publishTime)}</p>
            </div>
        </div>`;

    videoContainer.addEventListener("click", () => {
      navigateToVideoDetails(video.id.videoId);
    });

    container.appendChild(videoContainer);
  });
}

async function fetchChannelLogo(channelId) {
  const endpoint = `${baseUrl}/channels?key=${apiKey}&id=${channelId}&part=snippet`;

  try {
    const response = await fetch(endpoint);
    const result = await response.json();
    return result.items[0].snippet.thumbnails.high.url;
  } catch (error) {
    console.log(error);
  }
}

// * this will take videoId and returns the statics of the video.

async function getVideoStatistics(videoId) {
  // https://www.googleapis.com/youtube/v3/videos?key=AIzaSyDvo2p4xMEI3GC-PWH02_0OAIN1h88k4rE&part=statistics
  const endpoint = `${baseUrl}/videos?key=${apiKey}&part=statistics&id=${videoId}`;
  try {
    const response = await fetch(endpoint);
    const result = await response.json();
    return result.items[0].statistics;
  } catch (error) {}
}

async function fetchSearchResults(searchString) {
  // searchString will the input entered by the user
  const endpoint = `${baseUrl}/search?key=${apiKey}&q=${searchString}&part=snippet&maxResults=20`;
  try {
    const response = await fetch(endpoint);
    const result = await response.json();

    for (let i = 0; i < result.items.length; i++) {
      let videoId = result.items[i].id.videoId;
      let channelId = result.items[i].snippet.channelId;

      let statistics = await getVideoStatistics(videoId);
      let channelLogo = await fetchChannelLogo(channelId);

      result.items[i].statistics = statistics;
      result.items[i].channelLogo = channelLogo;
    }

    renderVideosOntoUI(result.items); // 2
  } catch (error) {
    alert("Some error occured");
  }
}

searchButton.addEventListener("click", () => {
  const searchValue = searchInput.value;
  fetchSearchResults(searchValue);
});
searchInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    const searchValue = searchInput.value;
    fetchSearchResults(searchValue);
  }
});

fetchSearchResults("");
