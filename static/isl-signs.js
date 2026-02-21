// ISL Signs - Letters A-Z and Numbers 0-9
const ISL_Signs = {
    'a': { video: 'Animation_video/A.mp4' },
    'b': { video: 'Animation_video/B.mp4' },
    'c': { video: 'Animation_video/C.mp4' },
    'd': { video: 'Animation_video/D.mp4' },
    'e': { video: 'Animation_video/E.mp4' },
    'f': { video: 'Animation_video/F.mp4' },
    'g': { video: 'Animation_video/G.mp4' },
    'h': { video: 'Animation_video/H.mp4' },
    'i': { video: 'Animation_video/I.mp4' },
    'j': { video: 'Animation_video/J.mp4' },
    'k': { video: 'Animation_video/K.mp4' },
    'l': { video: 'Animation_video/L.mp4' },
    'm': { video: 'Animation_video/M.mp4' },
    'n': { video: 'Animation_video/N.mp4' },
    'o': { video: 'Animation_video/O.mp4' },
    'p': { video: 'Animation_video/P.mp4' },
    'q': { video: 'Animation_video/Q.mp4' },
    'r': { video: 'Animation_video/R.mp4' },
    's': { video: 'Animation_video/S.mp4' },
    't': { video: 'Animation_video/T.mp4' },
    'u': { video: 'Animation_video/U.mp4' },
    'v': { video: 'Animation_video/V.mp4' },
    'w': { video: 'Animation_video/W.mp4' },
    'x': { video: 'Animation_video/X.mp4' },
    'y': { video: 'Animation_video/Y.mp4' },
    'z': { video: 'Animation_video/Z.mp4' },
    '0': { video: 'Animation_video/0.mp4' },
    '1': { video: 'Animation_video/1.mp4' },
    '2': { video: 'Animation_video/2.mp4' },
    '3': { video: 'Animation_video/3.mp4' },
    '4': { video: 'Animation_video/4.mp4' },
    '5': { video: 'Animation_video/5.mp4' },
    '6': { video: 'Animation_video/6.mp4' },
    '7': { video: 'Animation_video/7.mp4' },
    '8': { video: 'Animation_video/8.mp4' },
    '9': { video: 'Animation_video/9.mp4' },
    'hello': { image: 'Daily_phrases/hello.png' },
    'thank you': { image: 'Daily_phrases/thank you.png' },
    'please': { image: 'Daily_phrases/please.png' },
    'sorry': { image: 'Daily_phrases/sorry.png' },
    'yes': { image: 'Daily_phrases/yes.png' },
    'no': { image: 'Daily_phrases/no.png' },
    'how are you': { image: 'Daily_phrases/how are you.png' },
    'good bye': { image: 'Daily_phrases/good bye.png' },
    'goodbye': { image: 'Daily_phrases/good bye.png' },
    'i love u': { image: 'Daily_phrases/i love u.png' },
    'you are welcome': { image: 'Daily_phrases/you are welcome.png' },
    'help': { image: 'Emergency_phrases/help.png' },
    'accident': { image: 'Emergency_phrases/accident.png' },
    'stop': { image: 'Emergency_phrases/stop.jpeg' }
};

function getISLSign(word) {
    const sign = ISL_Signs[word.toLowerCase()];
    console.log('Looking for:', word, '-> Found:', sign ? 'YES' : 'NO');
    return sign || null;
}

function showISLAvatar(word) {
    const sign = getISLSign(word);
    
    document.getElementById('avatarSection').style.display = 'block';
    
    if (sign && (sign.video || sign.image)) {
        if (sign.video) {
            avatarDisplay.innerHTML = `
                <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1rem;">
                    <video autoplay loop muted playsinline style="width: 100%; max-width: 450px; height: 100%; max-height: 400px; object-fit: contain; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                        <source src="${sign.video}" type="video/mp4">
                    </video>
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1rem 2.5rem; border-radius: 15px; margin-top: 1rem; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                        <p style="font-size: 3rem; font-weight: bold; color: white; margin: 0;">${word.toUpperCase()}</p>
                    </div>
                </div>
            `;
        } else if (sign.image) {
            avatarDisplay.innerHTML = `
                <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1rem;">
                    <img src="/static/${sign.image}" alt="${word}" style="width: 100%; max-width: 450px; height: auto; max-height: 400px; object-fit: contain; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                    <div style="background: linear-gradient(135deg, #D96432 0%, #70161E 100%); padding: 1rem 2.5rem; border-radius: 15px; margin-top: 1rem; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                        <p style="font-size: 2rem; font-weight: bold; color: white; margin: 0; text-transform: capitalize;">${word}</p>
                    </div>
                </div>
            `;
        }
        signText.textContent = `Playing: ${word.toUpperCase()}`;
        console.log('Loading:', sign.video || sign.image);
    } else {
        avatarDisplay.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                <div style="text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">🤟</div>
                    <p style="font-size: 1.5rem; color: white; margin: 0;">${word.toUpperCase()}</p>
                    <p style="font-size: 1rem; color: rgba(255,255,255,0.7); margin-top: 0.5rem;">No animation available</p>
                </div>
            </div>
        `;
        signText.textContent = `No animation for: ${word.toUpperCase()}`;
    }
}

function convertToSign(text) {
    const inputText = typeof text === 'string' ? text : textInput.value.trim();
    
    if (!inputText) {
        alert('Please enter text');
        return;
    }

    signText.textContent = `Converting: "${inputText}"`;
    
    const chars = inputText.toLowerCase().split('').filter(char => /[a-z0-9]/.test(char));
    
    if (chars.length === 0) {
        alert('Enter letters (A-Z) or numbers (0-9)');
        return;
    }
    
    let currentIndex = 0;
    showISLAvatar(chars[0]);

    const interval = setInterval(() => {
        if (currentIndex < chars.length) {
            showISLAvatar(chars[currentIndex]);
            signText.textContent = `Showing: "${chars[currentIndex].toUpperCase()}"`;
            currentIndex++;
        } else {
            clearInterval(interval);
            signText.textContent = `✅ Done`;
        }
    }, 2500);
}
