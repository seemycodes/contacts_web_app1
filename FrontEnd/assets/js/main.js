let contacts = []; // keep contacts globally

async function loadContacts() {
    try {
        const response = await fetch("assets/json/sample.json");
        if (!response.ok) throw new Error("Failed to fetch contacts.");
        
        const data = await response.json();
        contacts = data || []; // make sure contacts is an array

        document.getElementById("contact-count").textContent = `${contacts.length} contacts`;
        renderContacts(contacts); // 
    } catch (error) {
        console.error("Error loading contacts:", error);
        document.getElementById("contact-count").textContent = "Failed to load contacts";
        contacts = []; // if error, flush all
        renderContacts(contacts);
    }
}


function renderContacts(contactsData) {
    contacts = contactsData; // Update global contacts array

    const groupedContacts = groupContactsByAlphabet(contacts);
    const container = document.querySelector(".contacts-list");
    container.innerHTML = "";

    Object.keys(groupedContacts).sort().forEach(letter => {
        const group = groupedContacts[letter];

        // Add the alphabet section header
        const sectionHeader = document.createElement("div");
        sectionHeader.classList.add("contact-section-header");
        sectionHeader.innerHTML = `<h3 class="contact-alphabet-header">${letter}</h3>`;
        container.appendChild(sectionHeader);

        // Generate contacts
        group.forEach((contact, index) => {
            const firstName = contact.firstName || "Unknown";
            const lastName = contact.lastName || "";
            const fullName = `${firstName} ${lastName}`.trim();
            const email = contact.email || "No email provided";
            const phone = contact.phone || "No phone provided";
            const image = contact.image || "https://www.pngall.com/wp-content/uploads/15/User.png";

            let cardClass = ["contacts-card"];
            if (group.length === 1) cardClass.push("contacts-card-no-child");
            else if (index === 0) cardClass.push("contacts-card-top");
            else if (index === group.length - 1) cardClass.push("contacts-card-bottom");

            const card = document.createElement("div");
            card.classList.add(...cardClass);
            card.setAttribute("data-id", contact.id);
            card.setAttribute("data-group", letter);
            card.innerHTML = `
                <div class="contact-main">
                    <div class="contact-info">
                        <img class="contact-img" src="${image}" alt="User">
                        <span class="contact-name">${fullName}</span>
                    </div>
                    <div class="contact-actions">
                        <button class="contact-btn call-btn" onclick="event.stopPropagation(); window.location.href='tel:${phone}';">
                            <i class="bi bi-telephone"></i>
                        </button>
                        <button class="contact-btn email-btn" onclick="event.stopPropagation(); window.location.href='mailto:${email}';">
                            <i class="bi bi-envelope"></i>
                        </button>
                    </div>
                </div>
                <div class="contact-details">
                    <div class="contact-info-expanded">
                        <div class="contact-details-expanded-header">
                            <div class="contact-img-container">
                                <img class="contact-img-large" src="${image}" alt="User">
                            </div>
                            <div class="contact-text-container">
                                <div class="expanded-contact-details-text">
                                    <h6 class="expanded-contact-name">${fullName}</h6>
                                    <h6>Email</h6>
                                    <p>${email}</p>
                                    <h6>Phone</h6>
                                    <p>${phone}</p>
                                </div>
                            </div>
                        </div>
                        <div class="expanded-actions">
                            <!-- 🔥 Ensure phone & email buttons are above edit & delete -->
                                <button class="contact-btn email-btn" onclick="event.stopPropagation(); window.location.href='tel:${phone}';">
                                    <i class="bi bi-telephone"></i>
                                </button>
                                <button class="contact-btn email-btn" onclick="event.stopPropagation(); window.location.href='mailto:${email}';">
                                    <i class="bi bi-envelope"></i>
                                </button>
                            <button class="custom-edit-button" data-id="${contact.id}">
                                <i class="bi bi-pencil-fill"></i>
                            </button>
                            <button class="custom-delete-button" data-id="${contact.id}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>`;

            container.appendChild(card);

            // ✅ Attach event listener for toggling the card
            card.addEventListener("click", function (event) {
                toggleCard(event, card);
            });

            // ✅ Attach event listener for the edit button
            const editButton = card.querySelector(".custom-edit-button");
            editButton.addEventListener("click", function (event) {
                event.stopPropagation(); // Prevent toggling when clicking edit
                openEditForm(contact.id);
            });

            // ✅ Attach event listener for the delete button
            const deleteButton = card.querySelector(".custom-delete-button");
            deleteButton.addEventListener("click", function (event) {
                event.stopPropagation(); // Prevent card expansion when clicking delete
                deleteContact(contact.id);
            });
        });
    });

    console.log("Contacts successfully rendered!");
}



document.addEventListener("DOMContentLoaded", () => {
    loadContacts();
});
