let contacts = []; // Store contacts globally

async function loadContacts() {
    try {
        const response = await fetch("assets/json/sample.json");
        if (!response.ok) throw new Error("Failed to fetch contacts.");
        
        const data = await response.json();
        contacts = data || []; // contacts is an array

        document.getElementById("contact-count").textContent = `${contacts.length} contacts`;
        renderContacts(contacts); // Render contacts
    } catch (error) {
        console.error("Error loading contacts:", error);
        document.getElementById("contact-count").textContent = "Failed to load contacts";
        contacts = []; // contacts is empty array
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
    contacts = contactsData; // global  array

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
                            <!--force phone email btn above edit delete -->
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

            //  event listener  toggling card
            card.addEventListener("click", function (event) {
                toggleCard(event, card);
            });

            // event listener edit button
            const editButton = card.querySelector(".custom-edit-button");
            editButton.addEventListener("click", function (event) {
                event.stopPropagation(); // fix clicking edit
                openEditForm(contact.id);
            });

            // event listener for the delete button
            const deleteButton = card.querySelector(".custom-delete-button");
            deleteButton.addEventListener("click", function (event) {
                event.stopPropagation(); // expansion when clicking delete
                deleteContact(contact.id);
            });
        });
    });

    console.log("Contacts successfully rendered!");
}


function toggleCard(event, card) {
    if (event.target.closest("button")) return; // button clicks toggling

    console.log("Toggling card:", card); // Debugging

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


function openForm() {
    document.getElementById("add-contact-form").style.display = "flex";
}

function closeForm() {
    document.getElementById("add-contact-form").style.display = "none";
}

function saveContact() {
    closeForm();
}

document.addEventListener("DOMContentLoaded", () => {
    loadContacts();
    document.querySelector(".custombutton1").addEventListener("click", openForm);
});
function previewImage(event) {
    const reader = new FileReader();
    reader.onload = function () {
        const preview = document.getElementById("image-preview");
        preview.src = reader.result;
        preview.style.display = "block";
    };
    reader.readAsDataURL(event.target.files[0]);
}

function saveContact() {
    const emailInput = document.getElementById("contact-email");
    const phoneInput = document.getElementById("contact-phone");

    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^\d{10,15}$/; //10-15 digit

    let isValid = true;

    // Email Validation
    if (!emailRegex.test(email)) {
        emailInput.classList.add("is-invalid");
        isValid = false;
    } else {
        emailInput.classList.remove("is-invalid");
    }

    // Phone  Validation
    if (!phoneRegex.test(phone)) {
        phoneInput.classList.add("is-invalid");
        isValid = false;
    } else {
        phoneInput.classList.remove("is-invalid");
    }

    if (!isValid) {
        alert("Please enter a valid email and phone number.");
        return;
    }

    // Proceed with saving if validation passes
    alert("Contact saved successfully!");
    closeForm();
}


document.addEventListener("DOMContentLoaded", function () {
    const phoneInput = document.querySelector("#contact-phone");


    //  saveContact function validate phone
    function saveContact() {
        if (!validatePhone()) {
            alert("Please enter a valid phone number.");
            return;
        }
        alert("Contact saved successfully!");
        closeForm();
    }

    window.saveContact = saveContact;
});

document.querySelector(".custombutton2").addEventListener("click", function (event) {
    event.stopPropagation(); // event bubbling fix
    let dropdown = document.getElementById("action-dropdown");
    if (dropdown.style.display === "none" || dropdown.style.display === "") {
        dropdown.style.display = "flex";
    } else {
        dropdown.style.display = "none";
    }
});

document.addEventListener("click", function (event) {
    let dropdown = document.getElementById("action-dropdown");
    if (dropdown.style.display === "flex" && !event.target.closest(".custombutton2")) {
        dropdown.style.display = "none";
    }
});

function deleteAllContacts() {
    if (!confirm("Are you sure you want to delete all contacts?")) {
        return; // Stop if cancels
    }

    // Clear array
    contacts = [];

    // Re-render the empty list
    renderContacts(contacts);

    alert("All contacts have been deleted!");
}

function logout() {
    alert("Logged out!");
    // Todo Logout
}


function openEditForm(contactId) {
    let contact = contacts.find(c => c.id == contactId);
    if (!contact) {
        alert("Error: Contact not found!");
        return;
    }

    document.getElementById("edit-contact-id").value = contact.id;
    document.getElementById("edit-contact-first-name").value = contact.firstName || "";
    document.getElementById("edit-contact-last-name").value = contact.lastName || "";
    document.getElementById("edit-contact-email").value = contact.email || "";
    document.getElementById("edit-contact-phone").value = contact.phone || "";

    let imagePreview = document.getElementById("edit-image-preview");
    imagePreview.src = contact.image || "https://via.placeholder.com/150";
    imagePreview.style.display = contact.image ? "block" : "none";

    document.getElementById("edit-contact-form").style.display = "flex";
}

function closeEditForm() {
    document.getElementById("edit-contact-form").style.display = "none";
}

function updateContact() {
    const id = document.getElementById("edit-contact-id").value;
    const firstName = document.getElementById("edit-contact-first-name").value.trim();
    const lastName = document.getElementById("edit-contact-last-name").value.trim();
    const email = document.getElementById("edit-contact-email").value.trim();
    const phone = document.getElementById("edit-contact-phone").value.trim();
    const image = document.getElementById("edit-image-preview").src;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^\d{10,15}$/;

    if (!emailRegex.test(email) || !phoneRegex.test(phone)) {
        alert("Please enter a valid email and phone number.");
        return;
    }

    let contactIndex = contacts.findIndex(c => c.id == id);
    if (contactIndex !== -1) {
        contacts[contactIndex] = { id, firstName, lastName, email, phone, image };
        renderContacts(contacts); // Refresh UI
    }

    closeEditForm();
}

//  event listener  edit buttons
document.addEventListener("click", function (event) {
    let editButton = event.target.closest(".custom-edit-button");
    if (editButton) {
        let contactCard = editButton.closest(".contacts-card");
        if (contactCard) {
            let contactId = contactCard.getAttribute("data-id");
            openEditForm(parseInt(contactId)); // Ensure it's an integer
        }
    }
});

function deleteContact(contactId) {
    if (!confirm("Are you sure you want to delete this contact?")) {
        return; // Stop if cancels
    }

    // Find the index of the contact to delete
    const index = contacts.findIndex(contact => contact.id == contactId);
    if (index !== -1) {
        contacts.splice(index, 1); // Remove from array
        renderContacts(contacts); // Re-render 
        alert("Contact deleted successfully!");
    } else {
        alert("Error: Contact not found!");
    }
}

function createContact() {
    const firstName = document.getElementById("contact-first-name").value.trim();
    const lastName = document.getElementById("contact-last-name").value.trim();
    const email = document.getElementById("contact-email").value.trim();
    const phone = document.getElementById("contact-phone").value.trim();
    const imageInput = document.getElementById("image-preview");

    // image or default placeholder
    const image = imageInput.src.includes("base64") ? imageInput.src : "https://www.pngall.com/wp-content/uploads/15/User.png";

    // Validate input
    if (!firstName || !email || !phone) {
        alert("First Name, Email, and Phone are required!");
        return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^\d{10,15}$/; // 10-15 digit phone numbers

    if (!emailRegex.test(email) || !phoneRegex.test(phone)) {
        alert("Please enter a valid email and phone number.");
        return;
    }

    // Generate a new ID
    const newId = contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1;

    // Create new contact object
    const newContact = {
        id: newId,
        firstName,
        lastName,
        email,
        phone,
        image
    };

    // Add new contact to global array
    contacts.push(newContact);

    // Re-render the contact list
    renderContacts(contacts);

    // Close form and reset fields
    closeForm();
    document.getElementById("contact-first-name").value = "";
    document.getElementById("contact-last-name").value = "";
    document.getElementById("contact-email").value = "";
    document.getElementById("contact-phone").value = "";
    document.getElementById("image-preview").src = "";
    document.getElementById("image-preview").style.display = "none";

    alert("Contact added successfully!");
}
