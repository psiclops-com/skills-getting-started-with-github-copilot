document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build activity card content safely without using innerHTML
        const titleEl = document.createElement("h4");
        titleEl.textContent = name;
        activityCard.appendChild(titleEl);

        const descriptionEl = document.createElement("p");
        descriptionEl.textContent = details.description;
        activityCard.appendChild(descriptionEl);

        const scheduleEl = document.createElement("p");
        const scheduleStrong = document.createElement("strong");
        scheduleStrong.textContent = "Schedule:";
        scheduleEl.appendChild(scheduleStrong);
        scheduleEl.appendChild(document.createTextNode(" " + details.schedule));
        activityCard.appendChild(scheduleEl);

        const availabilityEl = document.createElement("p");
        const availabilityStrong = document.createElement("strong");
        availabilityStrong.textContent = "Availability:";
        availabilityEl.appendChild(availabilityStrong);
        availabilityEl.appendChild(
          document.createTextNode(" " + spotsLeft + " spots left")
        );
        activityCard.appendChild(availabilityEl);

        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const participantsLabel = document.createElement("strong");
        participantsLabel.textContent = "Participants:";
        participantsSection.appendChild(participantsLabel);

        if (details.participants.length === 0) {
          const noParticipants = document.createElement("p");
          noParticipants.className = "no-participants";
          noParticipants.textContent = "No participants yet.";
          participantsSection.appendChild(noParticipants);
        } else {
          const participantsListEl = document.createElement("ul");
          participantsListEl.className = "participants-list";

          details.participants.forEach((email) => {
            const participantItem = document.createElement("li");
            participantItem.className = "participant-item";

            const emailSpan = document.createElement("span");
            emailSpan.className = "participant-email";
            emailSpan.textContent = email;
            participantItem.appendChild(emailSpan);

            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-participant";
            deleteButton.title = "Remove participant";
            deleteButton.setAttribute("data-activity", name);
            deleteButton.setAttribute("data-email", email);

            const deleteIconSpan = document.createElement("span");
            deleteIconSpan.className = "delete-icon";
            deleteIconSpan.textContent = "🗑️";
            deleteButton.appendChild(deleteIconSpan);

            participantItem.appendChild(deleteButton);
            participantsListEl.appendChild(participantItem);
          });

          participantsSection.appendChild(participantsListEl);
        }

        activityCard.appendChild(participantsSection);
        activitiesList.appendChild(activityCard);

          // Add delete event listeners for participants
          const deleteButtons = activityCard.querySelectorAll(".delete-participant");
          deleteButtons.forEach(btn => {
            btn.addEventListener("click", async (e) => {
              e.preventDefault();
              const activityName = btn.getAttribute("data-activity");
              const participantEmail = btn.getAttribute("data-email");
              try {
                const response = await fetch(
                  `/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(participantEmail)}`,
                  {
                    method: "POST",
                  }
                );
                let result;
                try {
                  result = await response.json();
                } catch (parseError) {
                  console.error("Failed to parse unregister response as JSON:", parseError);
                  result = {};
                }
                if (response.ok) {
                  messageDiv.textContent = result.message || "Participant removed.";
                  messageDiv.className = "success";
                } else {
                  messageDiv.textContent = result.detail || "Failed to remove participant.";
                  messageDiv.className = "error";
                }
                messageDiv.classList.remove("hidden");
                setTimeout(() => {
                  messageDiv.classList.add("hidden");
                }, 5000);
                // Refresh activities list
                fetchActivities();
              } catch (error) {
                messageDiv.textContent = "Error removing participant.";
                messageDiv.className = "error";
                messageDiv.classList.remove("hidden");
                setTimeout(() => {
                  messageDiv.classList.add("hidden");
                }, 5000);
              }
            });
          });
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
        fetchActivities(); // Refresh activities list
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
