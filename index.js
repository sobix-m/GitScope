const toggle = document.getElementById("theme-toggle");

toggle.addEventListener("click", function () {
    document.body.classList.toggle("light-mode");
    const isLight = document.body.classList.contains("light-mode");
    toggle.textContent = isLight ? "☾ Dark mode" : "☀ Light mode";
});


const searchForm = document.getElementById("search-form");
const usernameInput = document.getElementById("username-input");
const statusMessage = document.getElementById("status-message");

const avatar = document.getElementById("avatar");
const nameElement = document.getElementById("name");
const usernameElement = document.getElementById("username");
const bioElement = document.getElementById("bio");

const followersElement = document.getElementById("followers");
const followingElement = document.getElementById("following");
const reposElement = document.getElementById("public-repos");

const locationElement = document.getElementById("location");
const companyElement = document.getElementById("company");
const profileLink = document.getElementById("profile-link");

searchForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = usernameInput.value.trim();

    if (!username) {
        statusMessage.textContent = "Please enter a GitHub username.";
        return;
    }

    statusMessage.textContent = "Searching for developer...";
    searchForm.querySelector("button").disabled = true;

    try {
        const response = await fetch(
            `https://api.github.com/users/${encodeURIComponent(username)}`
        );

        if (response.status === 404) {
            throw new Error("GitHub user not found. Check the username.");
        }

        if (response.status === 403 || response.status === 429) {
            throw new Error(
                "GitHub's API rate limit may have been reached. Please try again later."
            );
        }

        if (!response.ok) {
            throw new Error("Unable to fetch the profile. Please try again.");
        }

        const user = await response.json();

        // Update profile information
        avatar.src = user.avatar_url;
        avatar.alt = `Avatar of ${user.login}`;

        nameElement.textContent = user.name || user.login;
        usernameElement.textContent = `@${user.login}`;

        bioElement.textContent =
            user.bio || "This developer hasn't added a bio yet.";

        followersElement.textContent = user.followers;
        followingElement.textContent = user.following;
        reposElement.textContent = user.public_repos;

        locationElement.textContent = `⌖ ${user.location || "Location not provided"}`;
        companyElement.textContent = `⌘ ${user.company || "Company not provided"}`;

        profileLink.href = user.html_url;

        statusMessage.textContent = `Showing profile for @${user.login}`;
        loadRepositories(user.login);
        loadContributions(user.login);

    } catch (error) {
        statusMessage.textContent = error.message;
    } finally {
        searchForm.querySelector("button").disabled = false;
    }
});


async function loadRepositories(username) {
    const repositoryList = document.getElementById("repository-list");
    const repoCount = document.getElementById("repo-count");

    repositoryList.replaceChildren();

    const loadingMessage = document.createElement("p");
    loadingMessage.textContent = "Loading repositories...";
    repositoryList.appendChild(loadingMessage);

    try {
        const response = await fetch(
            `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=6`
        );

        if (!response.ok) {
            throw new Error("Could not load repositories.");
        }

        const repositories = await response.json();

        repositoryList.replaceChildren();

        repoCount.textContent =
            `${repositories.length} ${repositories.length === 1 ? "project" : "projects"}`;

        if (repositories.length === 0) {
            const message = document.createElement("p");
            message.textContent = "No public repositories found.";
            repositoryList.appendChild(message);
            return;
        }

        repositories.forEach(function (repo) {
            const card = document.createElement("article");
            card.className = "repository-card";

            const title = document.createElement("a");
            title.className = "repository-title";
            title.textContent = repo.name;
            title.href = repo.html_url;
            title.target = "_blank";
            title.rel = "noopener noreferrer";

            const description = document.createElement("p");
            description.className = "repository-description";
            description.textContent =
                repo.description || "No description provided.";

            const details = document.createElement("div");
            details.className = "repository-details";

            const language = document.createElement("span");
            language.textContent = repo.language || "Language not specified";

            const stars = document.createElement("span");
            stars.textContent = `★ ${repo.stargazers_count}`;

            details.append(language, stars);
            card.append(title, description, details);
            repositoryList.appendChild(card);
        });
    } catch (error) {
        repositoryList.replaceChildren();

        const message = document.createElement("p");
        message.textContent = error.message;
        repositoryList.appendChild(message);
    }
}


async function loadContributions(username) {
    const heatmap = document.getElementById("heatmap");

    heatmap.replaceChildren();

    const message = document.createElement("p");
    message.textContent = "Loading contribution history...";
    heatmap.appendChild(message);

    try {
        const response = await fetch(
            `https://gitscope-backend-lzb4.onrender.com/api/contributions/${encodeURIComponent(username)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to load contributions.");
        }

        heatmap.replaceChildren();

        const summary = document.createElement("p");
        summary.className = "contribution-summary";
        summary.textContent =
            `${data.totalContributions.toLocaleString()} contributions in the last year`;

        heatmap.appendChild(summary);


        // Create the heatmap layout
        const wrapper = document.createElement("div");
        wrapper.className = "heatmap-layout";

        // Weekday labels on the left
        const weekdayLabels = document.createElement("div");
        weekdayLabels.className = "weekday-labels";

        ["", "Mon", "", "Wed", "", "Fri", ""].forEach(function (day) {
            const label = document.createElement("span");
            label.textContent = day;
            weekdayLabels.appendChild(label);
        });

        // Month labels above the weekly columns
        const calendarArea = document.createElement("div");
        calendarArea.className = "calendar-area";

        const monthLabels = document.createElement("div");
        monthLabels.className = "month-labels";

        // The contribution squares
        const calendar = document.createElement("div");
        calendar.className = "contribution-calendar";

        let previousMonth = "";

        data.weeks.forEach(function (week) {
            const firstDay = week.contributionDays[0];
            const month = new Date(firstDay.date + "T12:00:00Z")
                .toLocaleString("en-US", {
                    month: "short",
                    timeZone: "UTC"
                });

            const monthLabel = document.createElement("span");
            monthLabel.className = "month-label";

            if (month !== previousMonth) {
                monthLabel.textContent = month;
                previousMonth = month;
            }

            monthLabels.appendChild(monthLabel);

            const weekColumn = document.createElement("div");
            weekColumn.className = "contribution-week";

            // Reserve seven rows so every week lines up by weekday
            const daysByWeekday = Array(7).fill(null);

            week.contributionDays.forEach(function (day) {
                const weekday = new Date(day.date + "T12:00:00Z")
                    .getUTCDay();

                daysByWeekday[weekday] = day;
            });

            daysByWeekday.forEach(function (day) {
                const square = document.createElement("div");
                square.className = "contribution-day";

                if (day) {
                    square.dataset.level = day.contributionLevel;

                    square.tabIndex = 0;

                    square.setAttribute(
                        "aria-label",
                        `${day.date}: ${day.contributionCount} contributions`
                    );

                    square.dataset.date = day.date;
                    square.dataset.count = day.contributionCount;
                } else {
                    square.classList.add("empty-day");
                    square.setAttribute("aria-hidden", "true");
                }

                weekColumn.appendChild(square);
            });

            calendar.appendChild(weekColumn);
        });

        calendarArea.append(monthLabels, calendar);
        wrapper.append(weekdayLabels, calendarArea);
        heatmap.appendChild(wrapper);

        const legend = document.createElement("div");
        legend.className = "contribution-legend";

        const lessLabel = document.createElement("span");
        lessLabel.textContent = "Less";

        const moreLabel = document.createElement("span");
        moreLabel.textContent = "More";

        const legendLevels = document.createElement("div");
        legendLevels.className = "legend-levels";

        for (let level = 0; level <= 4; level++) {
        const square = document.createElement("div");
        square.className = "legend-square";
        square.dataset.level = level;
        legendLevels.appendChild(square);
        }

        legend.append(lessLabel, legendLevels, moreLabel);
        heatmap.appendChild(legend);


    } catch (error) {
        heatmap.replaceChildren();

        const errorMessage = document.createElement("p");
        errorMessage.textContent = error.message;
        heatmap.appendChild(errorMessage);
    }
}


const heatmapContainer = document.getElementById("heatmap");
const heatmapTooltip = document.getElementById("heatmap-tooltip");

heatmapContainer.addEventListener("mouseover", function (event) {
    const square = event.target.closest(".contribution-day");

    if (!square || square.classList.contains("empty-day")) {
        return;
    }

    heatmapTooltip.textContent =
        `${square.dataset.date} — ${square.dataset.count} contributions`;

    heatmapTooltip.classList.add("visible");
});

heatmapContainer.addEventListener("mouseout", function (event) {
    const square = event.target.closest(".contribution-day");

    if (square) {
        heatmapTooltip.classList.remove("visible");
    }
});

heatmapContainer.addEventListener("focusin", function (event) {
    const square = event.target.closest(".contribution-day");

    if (square && !square.classList.contains("empty-day")) {
        heatmapTooltip.textContent =
            `${square.dataset.date} — ${square.dataset.count} contributions`;

        heatmapTooltip.classList.add("visible");
    }
});

heatmapContainer.addEventListener("focusout", function () {
    heatmapTooltip.classList.remove("visible");
});
