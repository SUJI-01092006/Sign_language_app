function showEmergencyAlert() {
    const modal = document.getElementById('emergencyModal');
    const content = document.getElementById('emergencyContent');
    let contacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');
    
    let contactsHTML = '';
    if (contacts.length > 0) {
        contactsHTML = '<div style="margin-bottom: 2rem;"><h4>Saved Contacts</h4>';
        contacts.forEach((contact, index) => {
            contactsHTML += `
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                    <div><strong>${contact.name}</strong><br><small>${contact.phone}</small></div>
                    <div>
                        <button onclick="sendAlert(${index})" style="padding: 0.5rem 1rem; background: #E74C3C; color: white; border: none; border-radius: 8px; cursor: pointer; margin-right: 0.5rem;">📱 Send</button>
                        <button onclick="deleteContact(${index})" style="padding: 0.5rem 1rem; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer;">❌</button>
                    </div>
                </div>
            `;
        });
        contactsHTML += '</div>';
    }
    
    content.innerHTML = `
        <div style="text-align: center; padding: 1rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🚨</div>
            <h2 style="color: #E74C3C; margin-bottom: 1rem;">Emergency Alert</h2>
            <p style="margin-bottom: 2rem;">I NEED HELP! Please assist me immediately.</p>
            <div id="statusMsg" style="margin-bottom: 1rem; padding: 1rem; border-radius: 8px; display: none;"></div>
            ${contactsHTML}
            <div>
                <h4 style="margin-bottom: 1rem;">Add New Contact</h4>
                <input type="text" id="contactName" placeholder="Contact Name" style="width: 100%; padding: 1rem; border: 2px solid #ddd; border-radius: 8px; margin-bottom: 1rem;">
                <input type="tel" id="contactPhone" placeholder="Phone Number" style="width: 100%; padding: 1rem; border: 2px solid #ddd; border-radius: 8px; margin-bottom: 1rem;">
                <button onclick="addContact()" style="width: 100%; padding: 1rem; background: #4A90E2; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1.1rem; font-weight: 600;">➕ Add Contact</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

function closeEmergencyModal() {
    document.getElementById('emergencyModal').style.display = 'none';
}

function addContact() {
    const name = document.getElementById('contactName').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    const statusDiv = document.getElementById('statusMsg');
    
    if (!name || !phone) {
        statusDiv.style.display = 'block';
        statusDiv.style.background = '#fff3cd';
        statusDiv.style.color = '#856404';
        statusDiv.innerHTML = '⚠️ Please enter both name and phone number';
        return;
    }
    
    let contacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');
    contacts.push({ name, phone });
    localStorage.setItem('emergencyContacts', JSON.stringify(contacts));
    
    statusDiv.style.display = 'block';
    statusDiv.style.background = '#d4edda';
    statusDiv.style.color = '#155724';
    statusDiv.innerHTML = '✅ Contact added successfully!';
    
    setTimeout(() => showEmergencyAlert(), 1000);
}

function deleteContact(index) {
    let contacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');
    contacts.splice(index, 1);
    localStorage.setItem('emergencyContacts', JSON.stringify(contacts));
    showEmergencyAlert();
}

function sendAlert(index) {
    let contacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');
    const contact = contacts[index];
    const statusDiv = document.getElementById('statusMsg');
    statusDiv.style.display = 'block';
    statusDiv.style.background = '#d4edda';
    statusDiv.style.color = '#155724';
    statusDiv.innerHTML = `✅ Emergency alert will be sent to ${contact.name} (${contact.phone})`;
}
