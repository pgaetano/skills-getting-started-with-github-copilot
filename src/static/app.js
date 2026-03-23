document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      showLoading();
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading/spinner before rendering
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Create participants list HTML
            let participantsHTML = "";
            if (details.participants && details.participants.length > 0) {
              participantsHTML = `
                <div class="participants-section">
                  <strong>Participants:</strong>
                  <ul class="participants-list">
                    ${details.participants.map(p => `
                      <li class="participant-item">
                        <span class="participant-email">${p}</span>
                        <button class="delete-participant" title="Remove participant" aria-label="Remove participant ${p}" data-activity="${encodeURIComponent(name)}" data-email="${encodeURIComponent(p)}">
                          <svg class="delete-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none"><path d="M6 6 L14 14 M14 6 L6 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                        </button>
                      </li>
                    `).join("")}
                  </ul>
                </div>
              `;
            } else {
              participantsHTML = `
                <div class="participants-section empty">
                  <strong>Participants:</strong>
                  <span class="no-participants">No one signed up yet.</span>
                </div>
              `;
            }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
        activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }

    // Add event listeners for delete buttons
    document.querySelectorAll(".delete-participant").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const activity = decodeURIComponent(btn.getAttribute("data-activity"));
        const email = decodeURIComponent(btn.getAttribute("data-email"));
        if (!activity || !email) return;
        try {
          showLoading();
          const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`, {
            method: "POST",
          });
          const result = await response.json();
          if (response.ok) {
            messageDiv.textContent = result.message || "Participant removed.";
            messageDiv.className = "success";
            messageDiv.classList.remove("hidden");
            fetchActivities();
          } else {
            messageDiv.textContent = result.detail || "An error occurred";
            messageDiv.className = "error";
            messageDiv.classList.remove("hidden");
          }
          setTimeout(() => {
            messageDiv.classList.add("hidden");
          }, 5000);
        } catch (error) {
          messageDiv.textContent = "Failed to remove participant. Please try again.";
          messageDiv.className = "error";
          messageDiv.classList.remove("hidden");
          console.error("Error removing participant:", error);
        }
      });
    });
  }

  function showLoading() {
    activitiesList.innerHTML = '<div class="loading" aria-live="polite"><div class="spinner" role="status" aria-label="Loading"></div></div>';
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities list after successful signup
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
