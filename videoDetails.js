const apiKey = "AIzaSyClFqwB1q-yDPV4eq0UmeknB_5ko9BKqWw";
const url = "https://www.googleapis.com/youtube/v3/commentThreads";
const commentsContainer = document.getElementById("comments-container");

window.addEventListener("load", () => {
  let videoId = document.cookie.split("=")[1];

  if (YT) {
    new YT.Player("video-placeholder", {
      height: "300",
      width: "500",
      videoId,
      // playerVars: {
      //   autoplay: 1, // Set autoplay to 1 for true
      // },
    });

    loadComments(videoId);
  }
});

async function loadComments(videoId) {
  let endpoint = `${url}?key=${apiKey}&videoId=${videoId}&maxResults=10&part=snippet`;

  const response = await fetch(endpoint);
  const result = await response.json();

  result.items.forEach((item) => {
    const repliesCount = item.snippet.totalReplyCount;
    const {
      authorDisplayName,
      textDisplay,
      likeCount,
      authorProfileImageUrl: profileUrl,
      publishedAt,
    } = item.snippet.topLevelComment.snippet;

    const div = document.createElement("div");
    div.className = "comment";
    div.innerHTML = `
    <img src="${profileUrl}" class="author-profile" alt="author profile" />
    <b>${authorDisplayName}</b>
    <p>${textDisplay}</p>`;

    commentsContainer.appendChild(div);
  });
}
