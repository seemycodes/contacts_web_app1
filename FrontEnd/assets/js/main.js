let contacts = []; // Store contacts globally
let apiBaseUrl = "http://localhost:8000"; // Default API (if config.json missing)


// clean API base URL
function getApiBaseUrl(baseUrl) {
    baseUrl = baseUrl || "http://localhost:8000"; // Use localhost if not set
    return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl; // Remove trailing slash
}

// load `config.json` dynamically
async function loadConfig() {
    try {
        const response = await fetch("assets/configs/config.json"); // Load json
        if (!response.ok) {
            throw new Error("Config file not found, using default localhost API");
        }

        const config = await response.json();
        apiBaseUrl = getApiBaseUrl(config.apiBaseUrl); // clean URL
        console.log("API Base URL Loaded:", apiBaseUrl);
    } catch (error) {
        console.warn("Error loading configuration:", error.message);
        console.warn("Using default API:", apiBaseUrl);
    } finally {
        loadContacts(); // makesure `apiBaseUrl` is set before making API calls
    }
}

async function loadContacts(retries = 3) {
    try {
        console.log(`Attempting to retry. Retries left: ${retries}`);
        const response = await fetch(`${apiBaseUrl}/contacts/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch contacts. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data); // Debugging: Log API response

        // Ensure API returns an array
        if (!data || !Array.isArray(data)) {
            throw new Error("Invalid API response: Expected an array.");
        }

        // API data keys to frontend expectations : todo - write a normalizer function
        contacts = data.map(contact => ({
            id: contact.id,
            firstName: contact.first_name,  //  first_name to firstName
            lastName: contact.last_name,    // last_name to lastName`
            email: contact.email,
            phone: contact.phone,
            image: contact.image || "https://www.pngall.com/wp-content/uploads/15/User.png"
        }));

        document.getElementById("contact-count").textContent = `${contacts.length} contacts`;
        renderContacts(contacts); // Render contacts
    } catch (error) {
        console.error("Error loading contacts:", error.message);
        if (retries > 0) {
            setTimeout(() => loadContacts(retries - 1), 2000); // Retry after 2s
        } else {
            document.getElementById("contact-count").textContent = "Failed to load contacts";
            contacts = []; // Ensure contacts is always an array
            renderContacts(contacts);
        }
    }
}

function groupContactsByAlphabet(contacts) {
    const grouped = {};

    contacts.forEach(contact => {
        console.log("Processing contact:", contact); // Debugging: Log full contact

        // Ensure `firstName` exists and is a string
        if (!contact || typeof contact.firstName !== "string" || contact.firstName.trim() === "") {
            console.warn("Skipping contact due to missing firstName:", contact);
            return;
        }

        const firstName = contact.firstName.trim();
        console.log("Valid First Name:", firstName); // Debugging: Log actual first names

        const letter = firstName[0].toUpperCase(); // Get first letter

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
                event.stopPropagation(); // toggling
                deleteContact(contact.id); //  deleteContact with ID
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

// Ensure `config.json` is loaded before making API calls
document.addEventListener("DOMContentLoaded", loadConfig);

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

async function deleteAllContacts() {
    if (!confirm("Are you sure you want to delete all contacts? This action cannot be undone!")) {
        return; // Stop if cancel
    }

    try {
        const response = await fetch(`${apiBaseUrl}/contacts/`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to delete all contacts. Status: ${response.status}`);
        }

        alert("All contacts have been deleted successfully!");

        // Clear global array
        contacts = [];

        // Re-render the UI
        renderContacts(contacts);
    } catch (error) {
        console.error("Error deleting all contacts:", error);
        alert("Failed to delete all contacts. Please try again.");
    }
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

async function updateContact() {
    const id = document.getElementById("edit-contact-id").value;
    const firstName = document.getElementById("edit-contact-first-name").value.trim();
    const lastName = document.getElementById("edit-contact-last-name").value.trim();
    const email = document.getElementById("edit-contact-email").value.trim();
    const phone = document.getElementById("edit-contact-phone").value.trim();
    const imageInput = document.getElementById("edit-image-preview");

    if (!id) {
        alert("Invalid contact ID.");
        return;
    }

    // Validate input fields
    if (!firstName || !email || !phone) {
        alert("First Name, Email, and Phone are required!");
        return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^\d{10,15}$/;

    if (!emailRegex.test(email) || !phoneRegex.test(phone)) {
        alert("Please enter a valid email and phone number.");
        return;
    }

    // Data for API request
    const updatedContact = {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        email: email
    };

    if (imageInput.src && !imageInput.src.includes("pngall.com")) {
        updatedContact.image = imageInput.src;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/contacts/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedContact)
        });

        if (!response.ok) {
            throw new Error(`Failed to update contact. Status: ${response.status}`);
        }

        const updatedContactData = await response.json();
        console.log("Contact Updated:", updatedContactData);

        alert("Contact updated successfully!");

        // Refresh contacts list
        loadContacts();

        // Close the edit form
        closeEditForm();
    } catch (error) {
        console.error("Error updating contact:", error);
        alert("Failed to update contact. Please try again.");
    }
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

async function deleteContact(contactId) {
    if (!confirm("Are you sure you want to delete this contact?")) {
        return; // canceled
    }

    try {
        const response = await fetch(`${apiBaseUrl}/contacts/${contactId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to delete contact. Status: ${response.status}`);
        }

        alert("Contact deleted successfully!");

        // Refresh contacts list
        loadContacts();
    } catch (error) {
        console.error("Error deleting contact:", error);
        alert("Failed to delete contact. Please try again.");
    }
}

async function createContact() {
    const firstName = document.getElementById("contact-first-name").value.trim();
    const lastName = document.getElementById("contact-last-name").value.trim();
    const email = document.getElementById("contact-email").value.trim();
    const phone = document.getElementById("contact-phone").value.trim();
    const imageInput = document.getElementById("image-preview");

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

    //  API schema
    const newContact = {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        email: email
    };

    // optional image
    if (imageInput.src && !imageInput.src.includes("pngall.com")) {
        newContact.image = imageInput.src;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/contacts/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newContact)
        });

        if (!response.ok) {
            throw new Error(`Failed to create contact. Status: ${response.status}`);
        }

        const createdContact = await response.json();
        console.log("Contact Created:", createdContact);

        alert("Contact added successfully!");

        // Refresh the contacts list
        loadContacts();

        // Close form 
        closeForm();
        document.getElementById("contact-first-name").value = "";
        document.getElementById("contact-last-name").value = "";
        document.getElementById("contact-email").value = "";
        document.getElementById("contact-phone").value = "";
        document.getElementById("image-preview").src = "";
        document.getElementById("image-preview").style.display = "none";
    } catch (error) {
        console.error("Error adding contact:", error);
        alert("Failed to add contact. Please try again.");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const cancelButton = document.getElementById("cancel-button");
    const addContactButton = document.getElementById("add-contact-button");
    const menuButton = document.getElementById("menu-button");
    const contactList = document.querySelector(".contacts-list");
    const searchList = document.querySelector(".search-list-container");

    let searchTimeout;

    // When clicking the search bar, replace buttons
    searchInput.addEventListener("focus", function () {
        contactList.style.display = "none"; // Hide main contact list
        searchList.style.display = "flex"; // Show search results section
        searchButton.style.display = "inline-block";
        cancelButton.style.display = "inline-block";
        addContactButton.style.display = "none";
        menuButton.style.display = "none";
    });

    // When clicking search button, fetch search results
    searchButton.addEventListener("click", function () {
        const query = searchInput.value.trim();
        if (query) {
            fetchContactByQuery(query);
        }
    });

    // When clicking cancel, revert back UI and reload contacts
    cancelButton.addEventListener("click", function () {
        searchInput.value = ""; // Clear search input
        searchButton.style.display = "none";
        cancelButton.style.display = "none";
        addContactButton.style.display = "inline-block";
        menuButton.style.display = "inline-block";
        searchList.style.display = "none"; // Hide search results
        contactList.style.display = "flex"; // Show main contact list
        loadContacts(); // Reload full contact list
    });

    async function fetchContactByQuery(query) {
        if (!query) {
            loadContacts(); // Restore full contact list if query is empty
            return;
        }

        try {
            console.log(`Fetching contacts by query: ${query}`);

            const response = await fetch(`${apiBaseUrl}/contacts/search/?query=${encodeURIComponent(query)}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch contacts. Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Search Results:", data);

            // Ensure API returns an array
            if (!Array.isArray(data)) {
                throw new Error("Invalid API response: Expected an array.");
            }

            //  normalize all contact before using it
            const mappedContacts = data.map(contact => normalizeContact(contact));

            if (mappedContacts.length === 0) {
                console.warn("No contacts found for query:", query);
                renderContacts([]); // Show empty result
            } else {
                renderContacts(mappedContacts); // Render normalized contacts
            }
        } catch (error) {
            console.error("Error fetching contacts:", error);
            renderContacts([]); // Render empty result on error
        }
    }

    //Render search results in `search-list-container`
    async function renderSearchResults(contactsData) {
        searchList.innerHTML = ""; // Clear previous search results

        const groupedContacts = groupContactsByAlphabet(contactsData);

        Object.keys(groupedContacts).sort().forEach(letter => {
            const group = groupedContacts[letter];

            // Alphabet section header
            const sectionHeader = document.createElement("div");
            sectionHeader.classList.add("contact-section-header");
            sectionHeader.innerHTML = `<h3 class="contact-alphabet-header">${letter}</h3>`;
            searchList.appendChild(sectionHeader);

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

                searchList.appendChild(card);

                // Event listener for expanding the contact card
                card.addEventListener("click", function (event) {
                    toggleCard(event, card);
                });

                // Event listener for edit button
                const editButton = card.querySelector(".custom-edit-button");
                editButton.addEventListener("click", function (event) {
                    event.stopPropagation();
                    openEditForm(contact.id);
                });

                // Event listener for delete button
                const deleteButton = card.querySelector(".custom-delete-button");
                deleteButton.addEventListener("click", function (event) {
                    event.stopPropagation();
                    deleteContact(contact.id);
                });
            });
        });

        console.log("Search results successfully rendered!");
    }
});



async function fetchContactByQuery(query) {
    if (!query) {
        loadContacts(); // Restore full contact list if query is empty
        return;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/contacts/search/?query=${encodeURIComponent(query)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch contacts. Status: ${response.status}`);
        }

        const contactsData = await response.json();
        console.log("Search Results:", contactsData);

        if (!Array.isArray(contactsData) || contactsData.length === 0) {
            renderContacts([]); // Show empty result
        } else {
            renderContacts(contactsData);
        }
    } catch (error) {
        console.error("Error fetching contacts:", error);
    }
}


function normalizeContact(contact) {
    return {
        id: contact.id,
        firstName: contact.first_name, // Convert API `first_name` to `firstName`
        lastName: contact.last_name,   // Convert `last_name` to `lastName`
        email: contact.email,
        phone: contact.phone,
        image: contact.image || "https://www.pngall.com/wp-content/uploads/15/User.png"
    };
}

async function fetchContactByQuery(query) {
    if (!query) {
        loadContacts(); // Restore full contact list if query is empty
        return;
    }

    try {
        console.log(`Fetching contacts by query: ${query}`);

        const response = await fetch(`${apiBaseUrl}/contacts/search/?query=${encodeURIComponent(query)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch contacts. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Search Results:", data);

        // Ensure API returns an array
        if (!Array.isArray(data)) {
            throw new Error("Invalid API response: Expected an array.");
        }

        // field-mapping
        const mappedContacts = data.map(contact => normalizeContact(contact));

        if (mappedContacts.length === 0) {
            renderContacts([]); // Show empty result
        } else {
            renderContacts(mappedContacts); // Render the mapped contacts
        }
    } catch (error) {
        console.error("Error fetching contacts:", error);
        renderContacts([]); // Render empty result on error
    }
}