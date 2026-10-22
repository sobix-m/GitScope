const express = require("express");
const dotenv = require("dotenv");
const cors= require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Check that the backend is running
app.get("/api/health", function (req, res) {
    res.json({
        message: "GitScope backend is running!"
    });
});

// Fetch real GitHub contribution history
app.get("/api/contributions/:username", async function (req, res) {
    const username = req.params.username.trim();
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
        return res.status(500).json({
            error: "GitHub token is missing. Check your .env file."
        });
    }

    // Calculate the date range for the past year
    const to = new Date();
    const from = new Date();
    from.setUTCFullYear(from.getUTCFullYear() - 1);

    const query = `
        query ($username: String!, $from: DateTime!, $to: DateTime!) {
            user(login: $username) {
                contributionsCollection(from: $from, to: $to) {
                    contributionCalendar {
                        totalContributions
                        weeks {
                            contributionDays {
                                date
                                contributionCount
                                contributionLevel
                            }
                        }
                    }
                }
            }
        }
    `;

    try {
        const response = await fetch(
            "https://api.github.com/graphql",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    query,
                    variables: {
                        username,
                        from: from.toISOString(),
                        to: to.toISOString()
                    }
                })
            }
        );

        const result = await response.json();

        if (!response.ok || result.errors) {
            console.error("GitHub GraphQL error:", result.errors || result.message);

            return res.status(response.status === 401 ? 502 : 400).json({
                error: "GitHub could not return contribution data. Check the token and username."
            });
        }

        if (!result.data || !result.data.user) {
            return res.status(404).json({
                error: "GitHub user not found."
            });
        }

        const calendar =
            result.data.user.contributionsCollection.contributionCalendar;

        res.json({
            username,
            totalContributions: calendar.totalContributions,
            weeks: calendar.weeks
        });

    } catch (error) {
        console.error("Contribution request failed:", error.message);

        res.status(500).json({
            error: "Unable to fetch contributions. Please try again."
        });
    }
});

app.listen(PORT, "0.0.0.0", function () {
    console.log(`GitScope server running on port  ${PORT}`);
});

