// Fetch the API key from Netlify Function
fetch("/.netlify/functions/get-api-key")
  .then(response => response.json())
  .then(config => {
    const API_KEY = config.API_KEY;
    initApp(API_KEY); // Initialize the app with the API key
  })
  .catch(error => console.error("Error loading API key:", error));

// Initialize the app with the API key
function initApp(API_KEY) {
  window.API_KEY = API_KEY; // Store the API key in a global variable
  fetchGiveaways(); // Automatically call fetchGiveaways on page load
}

async function fetchGiveaways() {
  if (!window.API_KEY) {
    console.error("API key is not available.");
    return;
  }

  const platform = document.getElementById('platform').value;
  const type = document.getElementById('type').value;
  const sort = document.getElementById('sort').value;

  // Show loading spinner
  document.getElementById('loading').style.display = 'block';
  document.getElementById('results').innerHTML = '';

  // Build the API URL with filters
  let url = 'https://gamerpower.p.rapidapi.com/api/giveaways';
  if (platform) url += `?platform=${platform}`;
  if (type) url += `${platform ? '&' : '?'}type=${type}`;
  if (sort) url += `${platform || type ? '&' : '?'}sort-by=${sort}`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': window.API_KEY, // Use the API key fetched from Netlify Function
        'X-RapidAPI-Host': 'gamerpower.p.rapidapi.com',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    displayResults(data);
  } catch (error) {
    console.error('Error fetching giveaways:', error);
    document.getElementById('results').innerHTML = '<p>Failed to fetch giveaways. Please try again later.</p>';
  } finally {
    // Hide loading spinner
    document.getElementById('loading').style.display = 'none';
  }
}

function displayResults(giveaways) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  if (giveaways.length === 0) {
    resultsDiv.innerHTML = '<p>No giveaways found. Try different filters.</p>';
    return;
  }

  giveaways.forEach(giveaway => {
    const card = document.createElement('div');
    card.className = 'card';

    // Check if the API provides an image
    const image = giveaway.image ? `<img src="${giveaway.image}" alt="${giveaway.title}">` : '';

    // Modify the giveaway URL
    let giveawayUrl = giveaway.open_giveaway_url;

    // Option 1: Remove ?ref=gamerpower
    giveawayUrl = giveawayUrl.replace('?ref=gamerpower', '');

    // Option 2: Replace ?ref=gamerpower with ?ref=gamehov
    // giveawayUrl = giveawayUrl.replace('?ref=gamerpower', '?ref=gamehov');

    // Wrap the image and title in an anchor tag
    card.innerHTML = `
      <a href="${giveawayUrl}" target="_blank" class="clickable">
        ${image}
        <h3>${giveaway.title}</h3>
      </a>
      <p><strong>Platform:</strong> ${giveaway.platforms}</p>
      <p><strong>Type:</strong> ${giveaway.type}</p>
      <p><strong>Worth:</strong> ${giveaway.worth}</p>
      <p><strong>Ends:</strong> ${new Date(giveaway.end_date).toLocaleDateString()}</p>
      <a href="${giveawayUrl}" target="_blank" class="get-it-now">Get it now!</a>
    `;

    resultsDiv.appendChild(card);
  });
}
