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

function groupContactsByAlphabet(contacts) {
    const grouped = {};
    contacts.forEach(contact => {
        const letter = contact.firstName[0].toUpperCase();
        if (!grouped[letter]) grouped[letter] = [];
        grouped[letter].push(contact);
    });
    return grouped;
}


function renderContacts(contactsData) {
    contacts = contactsData; // Update global contacts array

    const groupedContacts = groupContactsByAlphabet(contacts);
    const container = document.querySelector(".contacts-list");
    container.innerHTML = "";

    Object.keys(groupedContacts).sort().forEach(letter => {
        const group = groupedContacts[letter];

        // alphabet section header
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
                            <!-- makesure phone email btns are abov editn delete -->
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

            //event listener toggling
            card.addEventListener("click", function (event) {
                toggleCard(event, card);
            });

            // listener - edit btn
            const editButton = card.querySelector(".custom-edit-button");
            editButton.addEventListener("click", function (event) {
                event.stopPropagation(); // Prevent toggling when clicking edit
                openEditForm(contact.id);
            });

            //  event listener -dlt btn
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



function toggleCard(event, card) {
    if (event.target.closest("button")) return; // Prevent button clicks from toggling

    console.log("Toggling card:", card); // debugging

    const allCards = document.querySelectorAll(".contacts-card");

    allCards.forEach(c => {
        if (c !== card) {
            c.classList.remove("expanded");
            let info = c.querySelector(".contact-info");
            let actions = c.querySelector(".contact-actions");
            if (info) info.style.display = "flex";
            if (actions) actions.style.display = "flex";
        }
    });

    const isExpanding = !card.classList.contains("expanded");
    card.classList.toggle("expanded");

    let info = card.querySelector(".contact-info");
    let actions = card.querySelector(".contact-actions");

    if (isExpanding) {
        if (info) info.style.display = "none";
        if (actions) actions.style.display = "none";
    } else {
        if (info) info.style.display = "flex";
        if (actions) actions.style.display = "flex";
    }
}
