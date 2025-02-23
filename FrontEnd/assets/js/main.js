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
    console.log(contactsData);
}

document.addEventListener("DOMContentLoaded", () => {
    loadContacts();
});
