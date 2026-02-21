// Global Variables
let currentLanguage = 'en';
let isRecording = false;
let recognition = null;

// Translation Data
const translations = {
    en: {
        title: 'Sign Language Learning Platform',
        typeOrSpeak: 'Type or Speak',
        placeholder: 'Type your sentence here...',
        speak: 'Speak',
        convert: 'Convert to Sign',
        clear: 'Clear',
        avatarTitle: 'Sign Language Avatar',
        avatarPlaceholder: 'Avatar will appear here',
        emergencyTitle: 'Emergency Quick Access',
        help: 'Help',
        medical: 'Medical',
        police: 'Police',
        fire: 'Fire',
        learningTitle: 'Learning Modules',
        practiceTitle: 'Practice Mode'
    },
    ta: {
        title: 'சைகை மொழி கற்றல் தளம்',
        typeOrSpeak: 'தட்டச்சு செய்யவும் அல்லது பேசவும்',
        placeholder: 'உங்கள் வாக்கியத்தை இங்கே தட்டச்சு செய்யவும்...',
        speak: 'பேசு',
        convert: 'சைகைக்கு மாற்று',
        clear: 'அழி',
        avatarTitle: 'சைகை மொழி அவதார்',
        avatarPlaceholder: 'அவதார் இங்கே தோன்றும்',
        emergencyTitle: 'அவசர விரைவு அணுகல்',
        help: 'உதவி',
        medical: 'மருத்துவம்',
        police: 'காவல்துறை',
        fire: 'தீ',
        learningTitle: 'கற்றல் தொகுதிகள்',
        practiceTitle: 'பயிற்சி முறை'
    },
    hi: {
        title: 'सांकेतिक भाषा सीखने का मंच',
        typeOrSpeak: 'टाइप करें या बोलें',
        placeholder: 'अपना वाक्य यहाँ टाइप करें...',
        speak: 'बोलें',
        convert: 'संकेत में बदलें',
        clear: 'साफ़ करें',
        avatarTitle: 'सांकेतिक भाषा अवतार',
        avatarPlaceholder: 'अवतार यहाँ दिखाई देगा',
        emergencyTitle: 'आपातकालीन त्वरित पहुंच',
        help: 'मदद',
        medical: 'चिकित्सा',
        police: 'पुलिस',
        fire: 'आग',
        learningTitle: 'सीखने के मॉड्यूल',
        practiceTitle: 'अभ्यास मोड'
    }
};

// Learning Module Data
const moduleData = {
    alphabet: {
        title: 'Alphabet (A-Z)',
        content: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    },
    numbers: {
        title: 'Numbers (0-9)',
        content: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    },
    daily: {
        title: 'Daily Phrases',
        content: [
            'hello', 'thank you', 'please', 'sorry', 'yes', 'no',
            'how are you', 'good bye', 'i love u', 'you are welcome'
        ]
    },
    emergency: {
        title: 'Emergency Phrases',
        content: [
            'help', 'accident', 'stop'
        ]
    }
};

// Emergency Messages
const emergencyMessages = {
    help: 'I NEED HELP! Please assist me immediately.',
    medical: 'MEDICAL EMERGENCY! I need medical assistance now.',
    police: 'POLICE EMERGENCY! I need police assistance.',
    fire: 'FIRE EMERGENCY! There is a fire, need help immediately.'
};

// DOM Elements
const moduleModal = document.getElementById('moduleModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalClose = document.querySelector('.modal-close');

// Initialize Speech Recognition
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            textInput.value = transcript;
            stopRecording();
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            stopRecording();
            alert('Speech recognition error. Please try again.');
        };

        recognition.onend = () => {
            stopRecording();
        };
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initSpeechRecognition();
    setupEventListeners();
});

function setupEventListeners() {
    // Language selector
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => changeLanguage(btn.dataset.lang));
    });

    // Emergency buttons
    document.querySelectorAll('.emergency-btn').forEach(btn => {
        btn.addEventListener('click', () => handleEmergency(btn.dataset.emergency));
    });

    // Learning modules
    document.querySelectorAll('.module-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('module-btn') || e.target.closest('.module-btn')) {
                openModule(card.dataset.module);
            }
        });
    });

    // Practice buttons
    document.querySelectorAll('.practice-btn').forEach(btn => {
        btn.addEventListener('click', () => startPractice(btn.dataset.practice));
    });

    // Assignment and Assessment buttons
    const assignmentBtn = document.querySelector('[data-practice="assignment"]');
    const assessmentBtn = document.querySelector('[data-practice="assessment"]');
    if (assignmentBtn) assignmentBtn.addEventListener('click', () => showAssignment());
    if (assessmentBtn) assessmentBtn.addEventListener('click', () => showAssessment());

    // Modal close
    modalClose.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === moduleModal) closeModal();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && moduleModal.style.display === 'block') {
            closeModal();
        }
    });
}

// Core Functions

// Toggle Speech Recognition
function toggleRecording() {
    if (!recognition) {
        alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
        return;
    }

    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

function startRecording() {
    isRecording = true;
    micBtn.classList.add('recording');
    micBtn.querySelector('.btn-text').textContent = 'Recording...';
    recognition.start();
}

function stopRecording() {
    isRecording = false;
    micBtn.classList.remove('recording');
    micBtn.querySelector('.btn-text').textContent = 'Speak';
    if (recognition) {
        recognition.stop();
    }
}

// Indian Sign Language (ISL) Dataset
const ISL_Dataset = {
    // Alphabet
    'a': { gif: 'assets/isl/alphabet/a.gif', desc: 'Fist with thumb up', fallback: '✊👍' },
    'b': { gif: 'assets/isl/alphabet/b.gif', desc: 'Flat hand, fingers together', fallback: '✋' },
    'c': { gif: 'assets/isl/alphabet/c.gif', desc: 'Curved hand like C', fallback: '🤚' },
    'd': { gif: 'assets/isl/alphabet/d.gif', desc: 'Index finger up', fallback: '☝️' },
    'e': { gif: 'assets/isl/alphabet/e.gif', desc: 'Curved fingers', fallback: '✊' },
    
    // Numbers
    '0': { gif: 'assets/isl/numbers/0.gif', desc: 'Fist forming O', fallback: '⭕' },
    '1': { gif: 'assets/isl/numbers/1.gif', desc: 'Index finger up', fallback: '☝️' },
    '2': { gif: 'assets/isl/numbers/2.gif', desc: 'V sign', fallback: '✌️' },
    '3': { gif: 'assets/isl/numbers/3.gif', desc: 'Three fingers up', fallback: '🤟' },
    '4': { gif: 'assets/isl/numbers/4.gif', desc: 'Four fingers up', fallback: '🖐️' },
    '5': { gif: 'assets/isl/numbers/5.gif', desc: 'All fingers spread', fallback: '🖐️' },
    
    // Common Words (ISL)
    'hello': { gif: 'assets/isl/words/hello.gif', desc: 'Hand wave near forehead (Namaste)', fallback: '🙏' },
    'hi': { gif: 'assets/isl/words/hello.gif', desc: 'Hand wave near forehead', fallback: '👋' },
    'namaste': { gif: 'assets/isl/words/namaste.gif', desc: 'Palms together at chest', fallback: '🙏' },
    'thank you': { gif: 'assets/isl/words/thank_you.gif', desc: 'Hand from chin forward', fallback: '🙏' },
    'thanks': { gif: 'assets/isl/words/thank_you.gif', desc: 'Hand from chin forward', fallback: '🙏' },
    'please': { gif: 'assets/isl/words/please.gif', desc: 'Flat hand circling chest', fallback: '🙏' },
    'sorry': { gif: 'assets/isl/words/sorry.gif', desc: 'Fist circling chest', fallback: '🙇' },
    'yes': { gif: 'assets/isl/words/yes.gif', desc: 'Fist nodding up/down', fallback: '👍' },
    'no': { gif: 'assets/isl/words/no.gif', desc: 'Index finger waving', fallback: '👎' },
    'ok': { gif: 'assets/isl/words/ok.gif', desc: 'Thumb up', fallback: '👌' },
    'help': { gif: 'assets/isl/words/help.gif', desc: 'Fist on palm lifting', fallback: '🆘' },
    'emergency': { gif: 'assets/isl/words/emergency.gif', desc: 'E-hand shaking', fallback: '🚨' },
    'hospital': { gif: 'assets/isl/words/hospital.gif', desc: 'H-hand on arm', fallback: '🏥' },
    'doctor': { gif: 'assets/isl/words/doctor.gif', desc: 'D-hand on wrist', fallback: '👨‍⚕️' },
    'police': { gif: 'assets/isl/words/police.gif', desc: 'C-hand at shoulder', fallback: '👮' },
    'fire': { gif: 'assets/isl/words/fire.gif', desc: 'Wiggling fingers up', fallback: '🔥' },
    'eat': { gif: 'assets/isl/words/eat.gif', desc: 'Fingers to mouth', fallback: '🍽️' },
    'drink': { gif: 'assets/isl/words/drink.gif', desc: 'C-hand to mouth', fallback: '🥤' },
    'sleep': { gif: 'assets/isl/words/sleep.gif', desc: 'Palm on cheek', fallback: '😴' },
    'mother': { gif: 'assets/isl/words/mother.gif', desc: 'Thumb touching chin', fallback: '👩' },
    'father': { gif: 'assets/isl/words/father.gif', desc: 'Thumb touching forehead', fallback: '👨' },
    'love': { gif: 'assets/isl/words/love.gif', desc: 'Crossed arms on chest', fallback: '❤️' },
    'good': { gif: 'assets/isl/words/good.gif', desc: 'Thumb up', fallback: '👍' },
    'bad': { gif: 'assets/isl/words/bad.gif', desc: 'Thumb down', fallback: '👎' },
    'stop': { gif: 'assets/isl/words/stop.gif', desc: 'Flat hand forward', fallback: '✋' },
    'wait': { gif: 'assets/isl/words/wait.gif', desc: 'Hands wiggling', fallback: '✋' },
    'go': { gif: 'assets/isl/words/go.gif', desc: 'Index pointing forward', fallback: '👉' },
    'come': { gif: 'assets/isl/words/come.gif', desc: 'Index beckoning', fallback: '👈' },
    'what': { gif: 'assets/isl/words/what.gif', desc: 'Palms up shaking', fallback: '🤷' },
    'where': { gif: 'assets/isl/words/where.gif', desc: 'Index pointing moving', fallback: '👉' },
    'when': { gif: 'assets/isl/words/when.gif', desc: 'Index circling', fallback: '🕐' },
    'who': { gif: 'assets/isl/words/who.gif', desc: 'Index near mouth', fallback: '👤' },
    'why': { gif: 'assets/isl/words/why.gif', desc: 'Index forehead to forward', fallback: '❓' },
    'how': { gif: 'assets/isl/words/how.gif', desc: 'Hands rotating', fallback: '🤔' }
};

// Check if GIF file exists, otherwise use fallback
function getISLSign(word) {
    const sign = ISL_Dataset[word.toLowerCase()];
    if (!sign) return { gif: null, desc: 'Sign not found', fallback: '🤟' };
    return sign;
}

// Convert Text to Sign Language with ISL
function convertToSign(text) {
    const inputText = typeof text === 'string' ? text : textInput.value.trim();
    
    if (!inputText) {
        alert('Please enter some text or use voice input.');
        return;
    }

    signText.textContent = `Converting to ISL: "${inputText}"`;
    
    const words = inputText.toLowerCase().split(/\s+/);
    let currentIndex = 0;

    // Show first word immediately
    showISLAvatar(words[0]);

    // Animate through each word
    const interval = setInterval(() => {
        if (currentIndex < words.length) {
            const word = words[currentIndex];
            showISLAvatar(word);
            signText.textContent = `ISL Sign: "${word.toUpperCase()}"`;
            currentIndex++;
        } else {
            clearInterval(interval);
            signText.textContent = `✅ Completed: "${inputText}"`;
        }
    }, 2000);

    console.log('Converting to ISL:', inputText);
}

// Show ISL Avatar with Video/GIF
function showISLAvatar(word) {
    const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    const sign = getISLSign(cleanWord);
    
    // Try to load actual GIF, fallback to placeholder
    const gifPath = sign.gif;
    const fallbackEmoji = sign.fallback;
    const description = sign.desc;
    
    avatarDisplay.innerHTML = `
        <div class="avatar-animated" style="animation: scaleIn 0.5s ease-out;">
            <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem;">
                
                <!-- ISL Video/GIF Display -->
                <div style="position: relative; width: 100%; max-width: 350px; height: 300px; background: rgba(255,255,255,0.1); border-radius: 15px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; overflow: hidden;">
                    <img src="${gifPath}" 
                         alt="ISL sign for ${word}"
                         style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 10px;"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                    />
                    <!-- Fallback Display -->
                    <div style="display: none; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;">
                        <div style="font-size: 6rem; animation: gestureFloat 2s ease-in-out infinite;">
                            ${fallbackEmoji}
                        </div>
                        <div style="font-size: 1rem; color: rgba(255,255,255,0.7); margin-top: 1rem; text-align: center;">
                            📹 Video not available<br>Showing placeholder
                        </div>
                    </div>
                </div>
                
                <!-- Word Display -->
                <div style="background: rgba(255,255,255,0.2); padding: 1rem 2rem; border-radius: 10px; margin-bottom: 0.5rem;">
                    <p style="font-size: 2rem; font-weight: bold; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); margin: 0;">
                        ${word.toUpperCase()}
                    </p>
                </div>
                
                <!-- Description -->
                <div style="text-align: center; color: rgba(255,255,255,0.9);">
                    <p style="font-size: 1rem; margin: 0;">
                        ${description}
                    </p>
                </div>
                
                <!-- ISL Badge -->
                <div style="margin-top: 1rem; background: rgba(255,255,255,0.15); padding: 0.5rem 1rem; border-radius: 20px;">
                    <p style="font-size: 0.9rem; color: white; margin: 0;">
                        🇮🇳 Indian Sign Language (ISL)
                    </p>
                </div>
            </div>
        </div>
    `;
}

// Clear Input
function clearInput() {
    textInput.value = '';
    signText.textContent = '';
    avatarDisplay.innerHTML = `
        <div class="avatar-placeholder">
            <span class="avatar-icon">🧑</span>
            <p>Avatar will appear here</p>
        </div>
    `;
}

// Change Language
function changeLanguage(lang) {
    currentLanguage = lang;
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        }
    });

    // Update speech recognition language
    if (recognition) {
        const langCodes = { en: 'en-US', ta: 'ta-IN', hi: 'hi-IN' };
        recognition.lang = langCodes[lang];
    }

    console.log('Language changed to:', lang);
}

// Handle Emergency - Send SOS to saved number
function handleEmergency(type) {
    const message = emergencyMessages[type];
    
    modalTitle.textContent = '🚨 Emergency Alert';
    
    // Load saved contacts
    let contacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');
    
    let contactsHTML = '';
    if (contacts.length > 0) {
        contactsHTML = '<div style="margin-bottom: 2rem;"><h4>Saved Contacts</h4>';
        contacts.forEach((contact, index) => {
            contactsHTML += `
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${contact.name}</strong><br>
                        <small>${contact.phone}</small>
                    </div>
                    <div>
                        <button onclick="sendToContact(${index})" style="padding: 0.5rem 1rem; background: #E74C3C; color: white; border: none; border-radius: 8px; cursor: pointer; margin-right: 0.5rem;">📱 Send</button>
                        <button onclick="deleteContact(${index})" style="padding: 0.5rem 1rem; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer;">❌</button>
                    </div>
                </div>
            `;
        });
        contactsHTML += '</div>';
    }
    
    modalBody.innerHTML = `
        <div style="padding: 2rem;">
            <div style="text-align: center; margin-bottom: 2rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🚨</div>
                <h3 style="color: #E74C3C; margin-bottom: 1rem;">${message}</h3>
            </div>
            
            <div id="statusMessage" style="margin-bottom: 1rem; padding: 1rem; border-radius: 8px; display: none;"></div>
            
            ${contactsHTML}
            
            <div id="addContactSection">
                <h4 style="margin-bottom: 1rem;">Add New Contact</h4>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <input type="text" id="contactName" placeholder="Contact Name" style="padding: 1rem; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;">
                    <input type="tel" id="contactPhone" placeholder="Phone Number" style="padding: 1rem; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;">
                    <button onclick="addNewContact()" style="padding: 1rem 2rem; background: #4A90E2; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1.1rem; font-weight: 600;">
                        ➕ Add Contact
                    </button>
                </div>
            </div>
        </div>
    `;
    
    moduleModal.style.display = 'block';
}

function addNewContact() {
    const name = document.getElementById('contactName').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    const statusDiv = document.getElementById('statusMessage');
    
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
    
    setTimeout(() => handleEmergency('help'), 1000);
}

function deleteContact(index) {
    let contacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');
    contacts.splice(index, 1);
    localStorage.setItem('emergencyContacts', JSON.stringify(contacts));
    handleEmergency('help');
}

function sendToContact(index) {
    let contacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');
    const contact = contacts[index];
    
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.style.display = 'block';
    statusDiv.style.background = '#d4edda';
    statusDiv.style.color = '#155724';
    statusDiv.innerHTML = `✅ Emergency alert will be sent to ${contact.name} (${contact.phone})`;
}

// Show Emergency Contact Modal
function showEmergencyModal(type, message) {
    modalTitle.textContent = `🚨 ${type.toUpperCase()} EMERGENCY`;
    
    let contactsHTML = '';
    if (emergencyContacts.length > 0) {
        contactsHTML = '<div style="margin-bottom: 1.5rem;"><h3 style="color: #E74C3C; margin-bottom: 1rem;">Send Alert To:</h3>';
        emergencyContacts.forEach((contact, index) => {
            contactsHTML += `
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${contact.name}</strong><br>
                        <small>${contact.phone} | ${contact.email}</small>
                    </div>
                    <button onclick="sendEmergencyAlert('${type}', ${index})" 
                            style="padding: 0.8rem 1.5rem; background: #E74C3C; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        Send Alert 📱
                    </button>
                </div>
            `;
        });
        contactsHTML += '</div>';
    }
    
    modalBody.innerHTML = `
        <div style="text-align: center; padding: 1rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🚨</div>
            <h3 style="color: #E74C3C; margin-bottom: 1rem;">${message}</h3>
            
            ${contactsHTML}
            
            <div style="background: #fff3cd; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #ffc107;">
                <h4 style="margin-bottom: 0.5rem;">Emergency Message:</h4>
                <p style="font-size: 1.1rem; font-weight: 600;">${message}</p>
            </div>
            
            <div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; margin-top: 1.5rem;">
                <button onclick="addEmergencyContact()" 
                        style="padding: 1rem 2rem; background: #4A90E2; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">
                    ➕ Add Emergency Contact
                </button>
                <button onclick="convertToSign('${message.replace(/'/g, "\\'")}')"; closeModal();" 
                        style="padding: 1rem 2rem; background: #50C878; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">
                    Show Sign Language
                </button>
                <button onclick="callEmergencyServices('${type}')" 
                        style="padding: 1rem 2rem; background: #E74C3C; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">
                    📞 Call Emergency Services
                </button>
            </div>
        </div>
    `;
    
    moduleModal.style.display = 'block';
}

// Add Emergency Contact
function addEmergencyContact() {
    modalTitle.textContent = 'Add Emergency Contact';
    modalBody.innerHTML = `
        <div style="padding: 1rem;">
            <form id="contactForm" style="display: flex; flex-direction: column; gap: 1rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Name:</label>
                    <input type="text" id="contactName" required 
                           style="width: 100%; padding: 0.8rem; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Phone:</label>
                    <input type="tel" id="contactPhone" required 
                           style="width: 100%; padding: 0.8rem; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Email:</label>
                    <input type="email" id="contactEmail" required 
                           style="width: 100%; padding: 0.8rem; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Relationship:</label>
                    <select id="contactRelation" 
                            style="width: 100%; padding: 0.8rem; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;">
                        <option>Family</option>
                        <option>Friend</option>
                        <option>Caregiver</option>
                        <option>Doctor</option>
                        <option>Other</option>
                    </select>
                </div>
                <button type="submit" 
                        style="padding: 1rem; background: #50C878; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1.1rem; font-weight: 600;">
                    Save Contact
                </button>
            </form>
        </div>
    `;
    
    document.getElementById('contactForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const contact = {
            name: document.getElementById('contactName').value,
            phone: document.getElementById('contactPhone').value,
            email: document.getElementById('contactEmail').value,
            relation: document.getElementById('contactRelation').value
        };
        emergencyContacts.push(contact);
        localStorage.setItem('emergencyContacts', JSON.stringify(emergencyContacts));
        alert('✅ Emergency contact saved successfully!');
        closeModal();
    });
}

// Send Emergency Alert
function sendEmergencyAlert(type, contactIndex) {
    const contact = emergencyContacts[contactIndex];
    const message = emergencyMessages[type];
    
    // Simulate sending SMS/Email
    const alertData = {
        to: contact.phone,
        email: contact.email,
        message: `🚨 EMERGENCY ALERT from Sign Language App\n\n${message}\n\nContact: ${contact.name}\nTime: ${new Date().toLocaleString()}\n\nPlease respond immediately!`
    };
    
    // Show sending animation
    const btn = event.target;
    btn.textContent = 'Sending...';
    btn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        btn.textContent = '✅ Sent!';
        btn.style.background = '#50C878';
        
        // In production: integrate with Twilio SMS API or Email service
        console.log('Emergency alert sent:', alertData);
        
        alert(`✅ Emergency alert sent to ${contact.name}!\n\nSMS: ${contact.phone}\nEmail: ${contact.email}\n\nMessage: ${message}`);
        
        // Also show sign language
        convertToSign(message);
    }, 1500);
}

// Call Emergency Services
function callEmergencyServices(type) {
    const numbers = {
        help: '911',
        medical: '911',
        police: '911',
        fire: '911'
    };
    
    if (confirm(`Call ${numbers[type]} for ${type} emergency?`)) {
        // In production: integrate with phone dialer
        window.location.href = `tel:${numbers[type]}`;
        alert(`Calling ${numbers[type]}...`);
    }
}

// Open Learning Module
function openModule(moduleType) {
    const module = moduleData[moduleType];
    if (!module) return;

    modalTitle.textContent = module.title;
    
    if (moduleType === 'daily' || moduleType === 'emergency') {
        // Load phrase images
        fetch(`/get_phrases/${moduleType}`)
            .then(res => res.json())
            .then(data => {
                let contentHTML = '<div id="moduleContent" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem;">';
                
                data.phrases.forEach(phrase => {
                    contentHTML += `
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                    padding: 1.5rem; 
                                    border-radius: 12px; 
                                    text-align: center; 
                                    cursor: pointer;
                                    transition: transform 0.3s ease;
                                    color: white;
                                    font-size: 1rem;
                                    font-weight: 600;"
                             onclick="showPhraseImage('${moduleType}', '${phrase.file}', '${phrase.name}')"
                             onmouseover="this.style.transform='scale(1.05)'"
                             onmouseout="this.style.transform='scale(1)'">
                            ${phrase.name}
                        </div>
                    `;
                });
                
                contentHTML += '</div>';
                contentHTML += '<div id="imageDisplay" style="display: none; margin-top: 2rem;"></div>';
                contentHTML += '<p style="margin-top: 2rem; text-align: center; color: #666;">Click any phrase to see its sign language image</p>';
                
                modalBody.innerHTML = contentHTML;
            });
    } else {
        let contentHTML = '<div id="moduleContent" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 1rem; margin-top: 1rem;">';
        
        module.content.forEach(item => {
            const itemLower = item.toLowerCase();
            contentHTML += `
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                            padding: 1.5rem; 
                            border-radius: 12px; 
                            text-align: center; 
                            cursor: pointer;
                            transition: transform 0.3s ease;
                            color: white;
                            font-size: 1.2rem;
                            font-weight: 600;"
                     onclick="showVideoInModal('${itemLower}')"
                     onmouseover="this.style.transform='scale(1.05)'"
                     onmouseout="this.style.transform='scale(1)'">
                    ${item}
                </div>
            `;
        });
        
        contentHTML += '</div>';
        contentHTML += '<div id="videoDisplay" style="display: none; margin-top: 2rem;"></div>';
        contentHTML += '<p style="margin-top: 2rem; text-align: center; color: #666;">Click any item to see its sign language animation</p>';
        
        modalBody.innerHTML = contentHTML;
    }
    
    moduleModal.style.display = 'block';
}

// Show phrase image
function showPhraseImage(phraseType, filename, phraseName) {
    const imageDisplay = document.getElementById('imageDisplay');
    const moduleContent = document.getElementById('moduleContent');
    
    moduleContent.style.display = 'none';
    imageDisplay.style.display = 'block';
    
    imageDisplay.innerHTML = `
        <div style="position: relative; text-align: center;">
            <button onclick="backToGrid()" style="position: absolute; top: 10px; right: 10px; background: #E74C3C; color: white; border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; z-index: 10;">&times;</button>
            <div style="background: #f5f7fa; padding: 2rem; border-radius: 12px; display: inline-block;">
                <img src="/phrases/${phraseType}/${filename}" alt="${phraseName}" style="width: 100%; max-width: 500px; height: auto; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); margin-bottom: 1rem;">
                <div style="background: linear-gradient(135deg, #D96432 0%, #70161E 100%); padding: 1rem 2rem; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <p style="font-size: 2rem; font-weight: bold; color: white; margin: 0; text-transform: capitalize;">${phraseName}</p>
                </div>
            </div>
        </div>
    `;
}

// Show video in modal
function showVideoInModal(text) {
    const videoDisplay = document.getElementById('videoDisplay');
    const moduleContent = document.getElementById('moduleContent');
    const sign = getISLSign(text);
    
    moduleContent.style.display = 'none';
    videoDisplay.style.display = 'block';
    
    const videoFileName = text.toUpperCase();
    
    // Save video watch progress
    fetch('/save_progress', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            module: 'video',
            item: videoFileName,
            completed: true,
            score: 100
        })
    }).catch(err => console.error('Failed to save progress:', err));
    
    videoDisplay.innerHTML = `
        <div style="position: relative; text-align: center;">
            <button onclick="backToGrid()" style="position: absolute; top: 10px; right: 10px; background: #E74C3C; color: white; border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; z-index: 10;">&times;</button>
            <div style="background: #f5f7fa; padding: 2rem; border-radius: 12px; display: inline-block;">
                <video autoplay loop muted playsinline style="width: 100%; max-width: 400px; height: auto; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); margin-bottom: 1rem;" onerror="this.parentElement.innerHTML='<p style=color:red;>Video not found: ${videoFileName}.mp4</p>';">
                    <source src="/learning_videos/${videoFileName}.mp4" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                <div style="background: linear-gradient(135deg, #D96432 0%, #70161E 100%); padding: 1rem 2rem; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <p style="font-size: 2.5rem; font-weight: bold; color: white; margin: 0;">${text.toUpperCase()}</p>
                </div>
            </div>
        </div>
    `;
}

// Back to grid
function backToGrid() {
    document.getElementById('moduleContent').style.display = 'grid';
    document.getElementById('videoDisplay').style.display = 'none';
}

// Close Modal
function closeModal() {
    moduleModal.style.display = 'none';
}

// Quiz Data Pool
const quizPool = [
    { question: 'What sign is this?', video: 'H.mp4', options: ['H', 'A', 'T'], correct: 0 },
    { question: 'What sign is this?', video: 'E.mp4', options: ['E', 'L', 'P'], correct: 0 },
    { question: 'What sign is this?', video: 'L.mp4', options: ['L', 'O', 'I'], correct: 0 },
    { question: 'What sign is this?', video: 'P.mp4', options: ['P', 'B', 'D'], correct: 0 },
    { question: 'What sign is this?', video: 'A.mp4', options: ['A', 'S', 'E'], correct: 0 },
    { question: 'What sign is this?', video: 'B.mp4', options: ['B', 'V', 'F'], correct: 0 },
    { question: 'What sign is this?', video: 'C.mp4', options: ['C', 'O', 'G'], correct: 0 },
    { question: 'What sign is this?', video: 'D.mp4', options: ['D', 'F', 'K'], correct: 0 },
    { question: 'What sign is this?', video: '1.mp4', options: ['1', '2', '4'], correct: 0 },
    { question: 'What sign is this?', video: '2.mp4', options: ['2', '3', '5'], correct: 0 },
    { question: 'What sign is this?', video: '3.mp4', options: ['3', '6', '8'], correct: 0 },
    { question: 'What sign is this?', video: '5.mp4', options: ['5', '0', '9'], correct: 0 }
];

let quizQuestions = [];

let currentQuizIndex = 0;
let quizScore = 0;
let speedStartTime = 0;

// Start Practice Mode
function startPractice(practiceType) {
    modalTitle.textContent = `${practiceType.charAt(0).toUpperCase() + practiceType.slice(1)} Practice Mode`;
    
    if (practiceType === 'quiz') {
        startQuiz();
    } else if (practiceType === 'free') {
        showFreePractice();
    } else if (practiceType === 'speed') {
        startSpeedChallenge();
    }
    
    moduleModal.style.display = 'block';
}

// Start Quiz
function startQuiz() {
    currentQuizIndex = 0;
    quizScore = 0;
    quizQuestions = [...quizPool].sort(() => Math.random() - 0.5).slice(0, 5);
    showQuizQuestion();
}

function showQuizQuestion() {
    if (currentQuizIndex >= quizQuestions.length) {
        showQuizResults();
        return;
    }
    
    const q = quizQuestions[currentQuizIndex];
    modalBody.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="background: #4A90E2; color: white; padding: 1rem; border-radius: 8px; margin-bottom: 2rem;">
                <h3>Question ${currentQuizIndex + 1} of ${quizQuestions.length}</h3>
                <p>Score: ${quizScore} / ${currentQuizIndex}</p>
            </div>
            
            <div style="background: #f5f7fa; padding: 2rem; border-radius: 12px; margin-bottom: 2rem;">
                <h3 style="font-size: 1.5rem; margin-bottom: 1rem; color: #2C3E50;">${q.question}</h3>
                <video autoplay loop muted playsinline style="width: 100%; max-width: 400px; height: auto; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); margin-bottom: 2rem;">
                    <source src="/learning_videos/${q.video}" type="video/mp4">
                </video>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    ${q.options.map((opt, i) => `
                        <button onclick="checkQuizAnswer(${i})" 
                                style="padding: 1.5rem; background: white; border: 3px solid #4A90E2; border-radius: 12px; cursor: pointer; font-size: 1.3rem; font-weight: 600; transition: all 0.3s;" 
                                onmouseover="this.style.background='#4A90E2'; this.style.color='white'; this.style.transform='scale(1.05)'" 
                                onmouseout="this.style.background='white'; this.style.color='black'; this.style.transform='scale(1)'">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function checkQuizAnswer(selected) {
    const q = quizQuestions[currentQuizIndex];
    const buttons = modalBody.querySelectorAll('button');
    
    if (selected === q.correct) {
        quizScore++;
        buttons[selected].style.background = '#50C878';
        buttons[selected].style.borderColor = '#50C878';
        buttons[selected].style.color = 'white';
        buttons[selected].innerHTML = q.options[selected] + ' ✅';
    } else {
        buttons[selected].style.background = '#E74C3C';
        buttons[selected].style.borderColor = '#E74C3C';
        buttons[selected].style.color = 'white';
        buttons[selected].innerHTML = q.options[selected] + ' ❌';
        buttons[q.correct].style.background = '#50C878';
        buttons[q.correct].style.borderColor = '#50C878';
        buttons[q.correct].style.color = 'white';
    }
    
    setTimeout(() => {
        currentQuizIndex++;
        showQuizQuestion();
    }, 2000);
}

function showQuizResults() {
    const percentage = (quizScore / quizQuestions.length) * 100;
    let message = '';
    let emoji = '';
    
    if (percentage >= 80) {
        message = 'Excellent! You\'re a sign language expert!';
        emoji = '🏆';
    } else if (percentage >= 60) {
        message = 'Good job! Keep practicing!';
        emoji = '👍';
    } else {
        message = 'Keep learning! Practice makes perfect!';
        emoji = '💪';
    }
    
    // Save quiz progress to database
    fetch('/save_progress', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            module: 'quiz',
            item: 'Quiz Mode',
            completed: true,
            score: Math.round(percentage)
        })
    }).catch(err => console.error('Failed to save progress:', err));
    
    modalBody.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 5rem; margin-bottom: 1rem;">${emoji}</div>
            <h2 style="color: #4A90E2; margin-bottom: 1rem;">Quiz Complete!</h2>
            <div style="background: #f5f7fa; padding: 2rem; border-radius: 12px; margin-bottom: 2rem;">
                <h3 style="font-size: 3rem; color: #50C878; margin-bottom: 1rem;">${quizScore} / ${quizQuestions.length}</h3>
                <p style="font-size: 1.5rem; color: #2C3E50;">${percentage}%</p>
                <p style="margin-top: 1rem; font-size: 1.2rem;">${message}</p>
            </div>
            <button onclick="startQuiz()" 
                    style="padding: 1rem 2rem; background: #4A90E2; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1.1rem; font-weight: 600; margin-right: 1rem;">
                New Quiz
            </button>
            <button onclick="closeModal()" 
                    style="padding: 1rem 2rem; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1.1rem; font-weight: 600;">
                Close
            </button>
        </div>
    `;
}

function showFreePractice() {
    modalBody.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <h3 style="color: #50C878; margin-bottom: 1rem;">Free Practice Mode</h3>
            <p style="margin-bottom: 2rem;">Practice any sign language at your own pace.</p>
            <textarea id="practiceText" style="width: 100%; padding: 1rem; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem; min-height: 100px;" placeholder="Type anything to practice..."></textarea>
            <button onclick="convertToSign(document.getElementById('practiceText').value); closeModal();" 
                    style="margin-top: 1rem; padding: 1rem 2rem; background: #50C878; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">
                Show Sign Language
            </button>
        </div>
    `;
}

let speedScore = 0;
let speedRound = 0;

function startSpeedChallenge() {
    speedScore = 0;
    speedRound = 0;
    showSpeedRound();
}

function showSpeedRound() {
    speedStartTime = Date.now();
    speedRound++;
    
    const allPhrases = [
        { text: 'A', video: 'A.mp4' },
        { text: 'B', video: 'B.mp4' },
        { text: 'C', video: 'C.mp4' },
        { text: 'D', video: 'D.mp4' },
        { text: 'E', video: 'E.mp4' },
        { text: 'H', video: 'H.mp4' },
        { text: 'L', video: 'L.mp4' },
        { text: 'P', video: 'P.mp4' },
        { text: '1', video: '1.mp4' },
        { text: '2', video: '2.mp4' },
        { text: '3', video: '3.mp4' },
        { text: '5', video: '5.mp4' }
    ];
    
    const randomPhrase = allPhrases[Math.floor(Math.random() * allPhrases.length)];
    const wrongOptions = allPhrases.filter(p => p.text !== randomPhrase.text).sort(() => Math.random() - 0.5).slice(0, 2);
    const allOptions = [randomPhrase, ...wrongOptions].sort(() => Math.random() - 0.5);
    
    modalBody.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="background: #F39C12; color: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <h3>⚡ Speed Challenge - Round ${speedRound}/5</h3>
                <p>Score: ${speedScore}</p>
            </div>
            <div id="resultMessage" style="min-height: 40px; margin-bottom: 1rem; font-size: 1.2rem; font-weight: bold;"></div>
            <div style="background: #f5f7fa; padding: 2rem; border-radius: 12px; margin-bottom: 1rem;">
                <video autoplay loop muted playsinline style="width: 100%; max-width: 400px; height: auto; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                    <source src="/learning_videos/${randomPhrase.video}" type="video/mp4">
                </video>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                ${allOptions.map(opt => `
                    <button onclick="checkSpeedAnswer('${opt.text}', '${randomPhrase.text}')" 
                            style="padding: 1.5rem 2.5rem; background: #F39C12; color: white; border: none; border-radius: 12px; cursor: pointer; font-size: 1.5rem; font-weight: 600; transition: all 0.3s;"
                            onmouseover="this.style.transform='scale(1.1)'"
                            onmouseout="this.style.transform='scale(1)'">
                        ${opt.text}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function checkSpeedAnswer(selected, correct) {
    const timeTaken = ((Date.now() - speedStartTime) / 1000).toFixed(2);
    const resultDiv = document.getElementById('resultMessage');
    const buttons = modalBody.querySelectorAll('button');
    buttons.forEach(btn => btn.disabled = true);
    
    if (selected === correct) {
        speedScore++;
        resultDiv.innerHTML = `<span style="color: #50C878;">✅ Correct! Time: ${timeTaken}s</span>`;
        setTimeout(() => {
            if (speedRound >= 5) {
                showSpeedResults();
            } else {
                showSpeedRound();
            }
        }, 1500);
    } else {
        resultDiv.innerHTML = `<span style="color: #E74C3C;">❌ Wrong! Correct: ${correct}</span>`;
        setTimeout(() => {
            if (speedRound >= 5) {
                showSpeedResults();
            } else {
                showSpeedRound();
            }
        }, 2000);
    }
}

function showSpeedResults() {
    // Save speed challenge progress to database
    fetch('/save_progress', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            module: 'speed',
            item: 'Speed Challenge',
            completed: true,
            score: speedScore
        })
    }).catch(err => console.error('Failed to save progress:', err));
    
    modalBody.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 5rem; margin-bottom: 1rem;">⚡</div>
            <h2 style="color: #F39C12; margin-bottom: 1rem;">Speed Challenge Complete!</h2>
            <div style="background: #f5f7fa; padding: 2rem; border-radius: 12px; margin-bottom: 2rem;">
                <h3 style="font-size: 3rem; color: #F39C12; margin-bottom: 1rem;">${speedScore} / 5</h3>
                <p style="font-size: 1.2rem;">${speedScore >= 4 ? '🏆 Lightning Fast!' : speedScore >= 3 ? '👍 Good Speed!' : '💪 Keep Practicing!'}</p>
            </div>
            <button onclick="startSpeedChallenge()" 
                    style="padding: 1rem 2rem; background: #F39C12; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1.1rem; font-weight: 600; margin-right: 1rem;">
                New Challenge
            </button>
            <button onclick="closeModal()" 
                    style="padding: 1rem 2rem; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1.1rem; font-weight: 600;">
                Close
            </button>
        </div>
    `;
}

// Utility function for mock Whisper API
async function mockWhisperAPI(audioBlob) {
    // Placeholder for Whisper API integration
    // In production, send audioBlob to Whisper API endpoint
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("This is a mock transcription from Whisper API");
        }, 1000);
    });
}

console.log('Sign Language Learning Platform initialized successfully!');

// Assignment System
const assignments = [
    { id: 1, title: 'Learn 10 Daily Phrases', phrases: ['Hello', 'Thank You', 'Please', 'Sorry', 'Yes', 'No', 'Help', 'Good', 'Wait', 'Stop'], completed: false },
    { id: 2, title: 'Master Alphabet A-J', phrases: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], completed: false },
    { id: 3, title: 'Emergency Signs', phrases: ['Help', 'Emergency', 'Hospital', 'Doctor', 'Police', 'Fire'], completed: false }
];

function showAssignment() {
    modalTitle.textContent = '📝 Assignments';
    let html = '<div style="padding: 2rem;">';
    
    assignments.forEach(assignment => {
        const progress = JSON.parse(localStorage.getItem(`assignment_${assignment.id}`) || '[]');
        const completed = progress.length;
        const total = assignment.phrases.length;
        const percentage = (completed / total * 100).toFixed(0);
        
        html += `
            <div style="background: #f5f7fa; padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem; border-left: 4px solid ${completed === total ? '#50C878' : '#4A90E2'};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="margin: 0;">${assignment.title}</h3>
                    <span style="background: ${completed === total ? '#50C878' : '#4A90E2'}; color: white; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem;">
                        ${completed}/${total} ${completed === total ? '✅' : ''}
                    </span>
                </div>
                <div style="background: #e0e0e0; height: 10px; border-radius: 5px; overflow: hidden; margin-bottom: 1rem;">
                    <div style="background: ${completed === total ? '#50C878' : '#4A90E2'}; height: 100%; width: ${percentage}%; transition: width 0.3s;"></div>
                </div>
                <button onclick="startAssignment(${assignment.id})" 
                        style="padding: 0.8rem 1.5rem; background: #4A90E2; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    ${completed === total ? 'Review' : 'Continue'} →
                </button>
            </div>
        `;
    });
    
    html += '</div>';
    modalBody.innerHTML = html;
    moduleModal.style.display = 'block';
}

function startAssignment(assignmentId) {
    const assignment = assignments.find(a => a.id === assignmentId);
    const progress = JSON.parse(localStorage.getItem(`assignment_${assignmentId}`) || '[]');
    const currentIndex = progress.length < assignment.phrases.length ? progress.length : 0;
    const phrase = assignment.phrases[currentIndex];
    
    modalTitle.textContent = `📝 ${assignment.title}`;
    modalBody.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="background: #4A90E2; color: white; padding: 1rem; border-radius: 8px; margin-bottom: 2rem;">
                <p>Progress: ${currentIndex + 1} / ${assignment.phrases.length}</p>
            </div>
            <div style="background: #f5f7fa; padding: 2rem; border-radius: 12px; margin-bottom: 2rem;">
                <h2 style="margin-bottom: 1rem;">Learn: ${phrase}</h2>
                <video autoplay loop muted playsinline style="width: 100%; max-width: 400px; height: auto; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); margin-bottom: 1rem;">
                    <source src="Animation_video/${phrase.replace(/\s+/g, '_')}.mp4" type="video/mp4">
                </video>
                <p style="color: #666; margin-top: 1rem;">Watch and practice this sign</p>
            </div>
            <button onclick="markAssignmentComplete(${assignmentId}, ${currentIndex})" 
                    style="padding: 1rem 2rem; background: #50C878; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1.1rem; font-weight: 600;">
                ✓ Mark as Learned
            </button>
        </div>
    `;
}

function markAssignmentComplete(assignmentId, currentIndex) {
    const assignment = assignments.find(a => a.id === assignmentId);
    let progress = JSON.parse(localStorage.getItem(`assignment_${assignmentId}`) || '[]');
    
    if (!progress.includes(currentIndex)) {
        progress.push(currentIndex);
        localStorage.setItem(`assignment_${assignmentId}`, JSON.stringify(progress));
    }
    
    if (progress.length >= assignment.phrases.length) {
        modalBody.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 5rem; margin-bottom: 1rem;">🎉</div>
                <h2 style="color: #50C878; margin-bottom: 1rem;">Assignment Complete!</h2>
                <p style="font-size: 1.2rem; margin-bottom: 2rem;">Great job completing "${assignment.title}"</p>
                <button onclick="showAssignment()" 
                        style="padding: 1rem 2rem; background: #4A90E2; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1.1rem; font-weight: 600;">
                    Back to Assignments
                </button>
            </div>
        `;
    } else {
        startAssignment(assignmentId);
    }
}

// Assessment System
function showAssessment() {
    modalTitle.textContent = '📊 Assessment';
    modalBody.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <h3 style="margin-bottom: 2rem;">Choose Assessment Level</h3>
            <div style="display: grid; gap: 1rem;">
                <button onclick="startAssessment('beginner')" 
                        style="padding: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 12px; cursor: pointer; font-size: 1.3rem; font-weight: 600;">
                    🌱 Beginner (10 Questions)
                </button>
                <button onclick="startAssessment('intermediate')" 
                        style="padding: 2rem; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; border: none; border-radius: 12px; cursor: pointer; font-size: 1.3rem; font-weight: 600;">
                    🔥 Intermediate (15 Questions)
                </button>
                <button onclick="startAssessment('advanced')" 
                        style="padding: 2rem; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border: none; border-radius: 12px; cursor: pointer; font-size: 1.3rem; font-weight: 600;">
                    🏆 Advanced (20 Questions)
                </button>
            </div>
        </div>
    `;
}

let assessmentQuestions = [];
let assessmentIndex = 0;
let assessmentScore = 0;
let assessmentLevel = '';

function startAssessment(level) {
    assessmentLevel = level;
    assessmentIndex = 0;
    assessmentScore = 0;
    
    const counts = { beginner: 10, intermediate: 15, advanced: 20 };
    assessmentQuestions = [...quizPool].sort(() => Math.random() - 0.5).slice(0, counts[level]);
    
    showAssessmentQuestion();
}

function showAssessmentQuestion() {
    if (assessmentIndex >= assessmentQuestions.length) {
        showAssessmentResults();
        return;
    }
    
    const q = assessmentQuestions[assessmentIndex];
    modalTitle.textContent = `📊 ${assessmentLevel.toUpperCase()} Assessment`;
    modalBody.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="background: #4A90E2; color: white; padding: 1rem; border-radius: 8px; margin-bottom: 2rem;">
                <h3>Question ${assessmentIndex + 1} of ${assessmentQuestions.length}</h3>
                <p>Score: ${assessmentScore}</p>
            </div>
            <div style="background: #f5f7fa; padding: 2rem; border-radius: 12px; margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem;">${q.question}</h3>
                <video autoplay loop muted playsinline style="width: 100%; max-width: 400px; height: auto; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); margin-bottom: 2rem;">
                    <source src="/learning_videos/${q.video}" type="video/mp4">
                </video>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    ${q.options.map((opt, i) => `
                        <button onclick="checkAssessmentAnswer(${i})" 
                                style="padding: 1.5rem; background: white; border: 3px solid #4A90E2; border-radius: 12px; cursor: pointer; font-size: 1.3rem; font-weight: 600;">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function checkAssessmentAnswer(selected) {
    const q = assessmentQuestions[assessmentIndex];
    const buttons = modalBody.querySelectorAll('button');
    
    if (selected === q.correct) {
        assessmentScore++;
        buttons[selected].style.background = '#50C878';
        buttons[selected].style.borderColor = '#50C878';
        buttons[selected].style.color = 'white';
    } else {
        buttons[selected].style.background = '#E74C3C';
        buttons[selected].style.borderColor = '#E74C3C';
        buttons[selected].style.color = 'white';
        buttons[q.correct].style.background = '#50C878';
        buttons[q.correct].style.borderColor = '#50C878';
        buttons[q.correct].style.color = 'white';
    }
    
    setTimeout(() => {
        assessmentIndex++;
        showAssessmentQuestion();
    }, 2000);
}

function showAssessmentResults() {
    const percentage = (assessmentScore / assessmentQuestions.length * 100).toFixed(0);
    let grade = '';
    let emoji = '';
    
    if (percentage >= 90) { grade = 'A+'; emoji = '🏆'; }
    else if (percentage >= 80) { grade = 'A'; emoji = '🌟'; }
    else if (percentage >= 70) { grade = 'B'; emoji = '👍'; }
    else if (percentage >= 60) { grade = 'C'; emoji = '📚'; }
    else { grade = 'D'; emoji = '💪'; }
    
    // Save result
    const results = JSON.parse(localStorage.getItem('assessmentResults') || '[]');
    results.push({ level: assessmentLevel, score: assessmentScore, total: assessmentQuestions.length, percentage, grade, date: new Date().toLocaleDateString() });
    localStorage.setItem('assessmentResults', JSON.stringify(results));
    
    modalBody.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 5rem; margin-bottom: 1rem;">${emoji}</div>
            <h2 style="color: #4A90E2; margin-bottom: 1rem;">Assessment Complete!</h2>
            <div style="background: #f5f7fa; padding: 2rem; border-radius: 12px; margin-bottom: 2rem;">
                <h3 style="font-size: 4rem; color: #4A90E2; margin-bottom: 1rem;">${grade}</h3>
                <p style="font-size: 2rem; color: #50C878; margin-bottom: 0.5rem;">${assessmentScore} / ${assessmentQuestions.length}</p>
                <p style="font-size: 1.5rem; color: #2C3E50;">${percentage}%</p>
                <p style="margin-top: 1rem; font-size: 1.1rem;">Level: ${assessmentLevel.toUpperCase()}</p>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button onclick="showAssessment()" 
                        style="padding: 1rem 2rem; background: #4A90E2; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1.1rem; font-weight: 600;">
                    New Assessment
                </button>
                <button onclick="viewAssessmentHistory()" 
                        style="padding: 1rem 2rem; background: #9b59b6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1.1rem; font-weight: 600;">
                    View History
                </button>
                <button onclick="closeModal()" 
                        style="padding: 1rem 2rem; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1.1rem; font-weight: 600;">
                    Close
                </button>
            </div>
        </div>
    `;
}

function viewAssessmentHistory() {
    const results = JSON.parse(localStorage.getItem('assessmentResults') || '[]');
    modalTitle.textContent = '📊 Assessment History';
    
    let html = '<div style="padding: 2rem;">';
    if (results.length === 0) {
        html += '<p style="text-align: center; color: #666;">No assessment history yet.</p>';
    } else {
        results.reverse().forEach((result, index) => {
            html += `
                <div style="background: #f5f7fa; padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem; border-left: 4px solid #4A90E2;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin: 0 0 0.5rem 0;">${result.level.toUpperCase()} Level</h4>
                            <p style="margin: 0; color: #666; font-size: 0.9rem;">${result.date}</p>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 2rem; font-weight: bold; color: #4A90E2;">${result.grade}</div>
                            <div style="font-size: 1rem; color: #666;">${result.score}/${result.total} (${result.percentage}%)</div>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    html += '</div>';
    modalBody.innerHTML = html;
}
