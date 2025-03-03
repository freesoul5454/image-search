const accessKey = "8Dy6_rnf4Nc_9_uU1_nlFS74wDDdL549NElhK8KFvq0"; // Replace this with your actual Unsplash API key

const searchBox = document.getElementById("search-box");
const searchBtn = document.getElementById("search-btn");
const searchResult = document.getElementById("search-result");
const showMoreBtn = document.getElementById("show-more-btn");

let keyword = "";
let page = 1;

// Function to fetch images from Unsplash API
async function searchImages() {
    keyword = searchBox.value.trim(); // Get input value
    if (!keyword) return; // Prevent empty searches

    const url = `https://api.unsplash.com/search/photos?page=${page}&query=${keyword}&client_id=${accessKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        
        const data = await response.json();
        
        if (page === 1) searchResult.innerHTML = ""; // Clear previous results on a new search

        data.results.forEach(photo => {
            const imgContainer = document.createElement("div");
            imgContainer.classList.add("image-item");

            const img = document.createElement("img");
            img.src = photo.urls.small;
            img.alt = photo.alt_description;

            imgContainer.appendChild(img);
            searchResult.appendChild(imgContainer);
        });

        // Show "Show More" button if more pages are available
        if (data.total_pages > page) {
            showMoreBtn.style.display = "block";
        } else {
            showMoreBtn.style.display = "none";
        }

        console.log(`Rate Limit Remaining: ${response.headers.get("X-Ratelimit-Remaining")}`);
    } catch (error) {
        console.error("Error fetching images:", error);
    }
}

// Event Listeners
searchBtn.addEventListener("click", () => {
    page = 1;
    searchImages();
});

searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        page = 1;
        searchImages();
    }
});

showMoreBtn.addEventListener("click", () => {
    page++;
    searchImages();
});
