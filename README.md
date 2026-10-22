GitHub Profile Explorer

Build a web application that allows users to explore a GitHub user's profile, contribution activity, and public repositories by entering their GitHub username.

 Requirements

*1. GitHub User Search*
- Provide a search bar where users can enter a GitHub username.
- Fetch and display the user's profile, including their name, follower count, and following count.

*2. Contribution Heatmap*
- Display the user's GitHub contribution calendar as a grid of squares representing daily activity over the past year.
- Use different shades to indicate contribution activity levels.
- Show the date and contribution count when a user hovers over a square.

*3. Repository Listing*
- Fetch and display the user's public repositories.
- Show each repository's name,
- Make repository names or cards clickable, opening the corresponding GitHub repository in a new tab.

*4. Error Handling*
- Display a loading indicator while fetching data.
- Show a clear error message when a username does not exist or a request fails.
- Handle empty responses and API rate limits gracefully.

APIs you can use:

Use the *GitHub REST API* and the *GitHub GraphQL API*

The application should present the information in a clear, user-friendly interface and allow users to explore different GitHub profiles through the search feature.