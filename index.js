


const axios = require('axios');
require('dotenv').config()

// Replace 'YOUR_GITHUB_USERNAME' with the GitHub username you want to fetch data for
const githubUsername = 'CodingErik';


const axiosConfig = {
  headers: {
    Authorization: `token ${process.env.token}`
  }
};

// GitHub API endpoint URL
const githubEventsURL = `https://api.github.com/users/${githubUsername}/events`;

// Create an object to store contribution insights
const contributionInsights = {};

// Function to fetch GitHub events data and calculate insights
async function fetchGitHubEvents() {
  try {
    const response = await axios.get(githubEventsURL,axiosConfig);
    const githubEvents = response.data;

    // Process GitHub events and calculate insights
    githubEvents.forEach((event) => {
      const actor = event.actor.login;
      const eventType = event.type;

      if (!contributionInsights[actor]) {
        contributionInsights[actor] = {
          username: actor,
          role: '',
          byMonth: {},
          commits: 0,
          pullRequests: 0,
          linesAdded: 0,
          linesDeleted: 0,
          linesByCommit: [],
          userEmail: '', // You can fetch the email separately from the GitHub API
        };
      }

      switch (eventType) {
        case 'PushEvent':
          contributionInsights[actor].commits++;
          contributionInsights[actor].linesAdded += event.payload.size;
          contributionInsights[actor].linesDeleted +=
            event.payload.size - event.payload.distinct_size;
          contributionInsights[actor].linesByCommit.push(
            event.payload.distinct_size
          );

          const createdAt = new Date(event.created_at);
          const yearMonth = `${createdAt.getFullYear()}-${(
            '0' + (createdAt.getMonth() + 1)
          ).slice(-2)}`;
          if (!contributionInsights[actor].byMonth[yearMonth]) {
            contributionInsights[actor].byMonth[yearMonth] = {
              commits: 0,
              linesAdded: 0,
              linesDeleted: 0,
            };
          }
          contributionInsights[actor].byMonth[yearMonth].commits++;
          contributionInsights[actor].byMonth[yearMonth].linesAdded +=
            event.payload.size;
          contributionInsights[actor].byMonth[yearMonth].linesDeleted +=
            event.payload.size - event.payload.distinct_size;
          break;

        case 'PullRequestEvent':
          contributionInsights[actor].pullRequests++;
          break;

        case 'CreateEvent':
          if (event.payload.ref_type === 'repository') {
            contributionInsights[actor].role = 'repository creator';
          } else if (event.payload.ref_type === 'branch') {
            contributionInsights[actor].role = 'branch creator';
          }
          break;
      }
    });

    // Print the contribution insights
    console.log(contributionInsights);
  } catch (error) {
    console.error('Error fetching GitHub events:', error);
  }
}

// Call the function to fetch GitHub events and calculate insights
fetchGitHubEvents();
