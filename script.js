// Where the backend lives. Leave '' : api.php answers on the same address as the pages (Laragon, or your Cloudflare link).
const API_BASE = '';

// Sends JSON to api.php and returns { ok, status, data }. It only throws when the server cannot be reached.
// Flow: this page (JSON) -> api.php -> MySQL database uswag_db.
async function postJSON(file, payload) {
    const response = await fetch(API_BASE + file, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    let data = null;
    try { data = await response.json(); } catch (err) { data = null; }
    // isJson = false means the reply was not JSON (an HTML page, an empty body...), so no PHP file answered.
    return { ok: response.ok, status: response.status, isJson: data !== null && typeof data === 'object', data: data || {} };
}

// One place for every request to the api.php. Errors are shown to the person; nothing is ever faked.
async function callApi(kind, file, payload) {
    return postJSON(file, payload);
}

function showWarning(text) {
    const warningModal = document.getElementById('warningModal');
    const warningMessage = document.getElementById('warningMessage');
    if (warningMessage) warningMessage.innerText = text;
    if (warningModal) warningModal.style.display = 'flex';
}

// Last contact message sent from this browser (so its status survives a page refresh).
const LAST_MESSAGE_KEY = 'uswag_last_message';
function loadLastMessage() {
    try { return JSON.parse(localStorage.getItem(LAST_MESSAGE_KEY) || 'null'); } catch (err) { return null; }
}
function saveLastMessage(msg) {
    try { localStorage.setItem(LAST_MESSAGE_KEY, JSON.stringify(msg)); } catch (err) { /* storage blocked: ignore */ }
}

const MESSAGE_STATUS_META = {
    Review:   { cls: 'status-review',   icon: 'fa-clock',        lead: 'Your message is for' },
    Received: { cls: 'status-received', icon: 'fa-circle-check', lead: 'Your message was' },
    Rejected: { cls: 'status-rejected', icon: 'fa-circle-xmark', lead: 'Your message was' }
};

function closeEnvelopeModal() {
    const envelopeModal = document.getElementById('envelopeModal');
    if (envelopeModal) envelopeModal.style.display = 'none';
}

function showWelcomeAlert() {
    const isAcknowledged = localStorage.getItem('uswag_welcome_acknowledged');
    const modal = document.getElementById('welcomeAlertModal');
    
    if (!isAcknowledged && modal) {
        modal.style.display = 'flex';
    }
}

function dismissModal() {
    const modal = document.getElementById('welcomeAlertModal');
    if (modal) {
        modal.style.display = 'none';
        localStorage.setItem('uswag_welcome_acknowledged', 'true');
    }
}

function closeRoleModal() {
    const roleModal = document.getElementById('roleModal');
    if (roleModal) {
        roleModal.style.display = 'none';
    }
}

function closeTncModal() {
    const tncModal = document.getElementById('tncModal');
    if (tncModal) {
        tncModal.style.display = 'none';
    }
}

function closeSubjectModal() {
    const subjectModal = document.getElementById('subjectModal');
    if (subjectModal) {
        subjectModal.style.display = 'none';
    }
}

function closeWarningModal() {
    const warningModal = document.getElementById('warningModal');
    if (warningModal) {
        warningModal.style.display = 'none';
    }
}

function closeSuccessModal() {
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.style.display = 'none';
    }
}

function isWeakPassword(password) {
    const lowerPwd = password.toLowerCase();
    const commonWeak = ['password', '12345678', '123456789', 'qwertyui', 'qwertyuiop', 'admin123', 'admin1234', '11111111', '12341234'];
    if (commonWeak.includes(lowerPwd)) return true;
    if (/(0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210)/.test(lowerPwd)) return true;
    if (/^(.)\1+$/.test(password)) return true;
    if (/(qwer|asdf|zxcv|abcd|1q2w)/.test(lowerPwd)) return true;
    return false;
}

function triggerConfettiBurst() {
    if (typeof confetti === 'function') {
        const successIcon = document.querySelector('.success-icon-wrapper');
        let originParams = { x: 0.5, y: 0.5 }; 

        if (successIcon) {
            const rect = successIcon.getBoundingClientRect();
            originParams = {
                x: (rect.left + (rect.width / 2)) / window.innerWidth,
                y: (rect.top + (rect.height / 2)) / window.innerHeight
            };
        }

        confetti({
            particleCount: 350,
            spread: 360,
            startVelocity: 35,
            gravity: 0.6,
            ticks: 250,
            origin: originParams,
            zIndex: 99999
        });
    }
}

document.addEventListener("DOMContentLoaded", function() {
    showWelcomeAlert();

    const lazyImages = document.querySelectorAll('img.lazy-img, .img-loading-wrapper img');
    lazyImages.forEach(img => {
        const handleImageLoaded = () => {
            img.classList.add('loaded');
            const spinner = img.parentElement?.querySelector('.img-spinner');
            if (spinner) spinner.style.display = 'none';
        };

        if (img.complete && img.naturalHeight !== 0) {
            handleImageLoaded();
        } else {
            img.addEventListener('load', handleImageLoaded);
            img.addEventListener('error', handleImageLoaded);
            setTimeout(handleImageLoaded, 4000);
        }
    });

    const tutorialVideo = document.getElementById('tutorialVideo');
    const videoLoader = document.getElementById('videoLoader');
    if (tutorialVideo) {
        const handleVideoLoaded = () => {
            tutorialVideo.classList.add('loaded');
            if (videoLoader) videoLoader.style.display = 'none';
        };

        if (tutorialVideo.readyState >= 1) {
            handleVideoLoaded();
        } else {
            tutorialVideo.addEventListener('loadedmetadata', handleVideoLoaded);
            tutorialVideo.addEventListener('canplay', handleVideoLoaded);
            tutorialVideo.addEventListener('error', handleVideoLoaded);
            setTimeout(handleVideoLoaded, 4000);
        }
    }

    // Sound button on the tutorial video. Browsers only autoplay muted video, so it starts muted and this turns sound on/off.
    const muteToggle = document.getElementById('muteToggle');
    if (tutorialVideo && muteToggle) {
        const muteIcon = muteToggle.querySelector('i');
        muteToggle.addEventListener('click', function() {
            tutorialVideo.muted = !tutorialVideo.muted;
            if (!tutorialVideo.muted && tutorialVideo.volume === 0) tutorialVideo.volume = 1;
            if (tutorialVideo.paused) tutorialVideo.play().catch(function() { /* autoplay blocked: ignore */ });
            if (muteIcon) {
                muteIcon.classList.toggle('fa-volume-xmark', tutorialVideo.muted);
                muteIcon.classList.toggle('fa-volume-high', !tutorialVideo.muted);
            }
            muteToggle.setAttribute('aria-pressed', String(!tutorialVideo.muted));
            muteToggle.setAttribute('aria-label', tutorialVideo.muted ? 'Turn sound on' : 'Turn sound off');
        });
    }

    const formInputsAndTextareas = document.querySelectorAll('input, textarea');
    formInputsAndTextareas.forEach(el => {
        el.addEventListener('focus', function() {
            if (!this.classList.contains('input-error')) {
                this.style.borderColor = '#322D78';
                this.style.outline = 'none';
                this.style.boxShadow = '0 0 5px rgba(50, 45, 120, 0.3)';
            }
        });
        el.addEventListener('blur', function() {
            if (!this.classList.contains('input-error')) {
                this.style.borderColor = '#ccc';
                this.style.boxShadow = 'none';
            }
        });
        el.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                this.classList.remove('input-error');
                this.style.borderColor = '#322D78';
            }
        });
    });

    // Role selection modal logic
    const roleDisplay = document.getElementById('roleDisplay');
    const roleModal = document.getElementById('roleModal');
    const roleInput = document.getElementById('role');
    const roleOptions = document.querySelectorAll('.role-option');

    if (roleDisplay && roleModal) {
        roleDisplay.addEventListener('click', function(e) {
            e.preventDefault();
            roleModal.style.display = 'flex';
        });
    }

    roleOptions.forEach(option => {
        option.addEventListener('click', function() {
            const selectedRole = this.getAttribute('data-role');
            if (roleInput) roleInput.value = selectedRole;
            if (roleDisplay) {
                roleDisplay.value = selectedRole;
                roleDisplay.classList.remove('input-error'); 
                roleDisplay.style.borderColor = '#322D78';
            }
            closeRoleModal();
        });
    });

    // Subject selection modal logic
    const subjectDisplay = document.getElementById('subjectDisplay');
    const subjectModal = document.getElementById('subjectModal');
    const subjectInput = document.getElementById('subject');
    const subjectOptions = document.querySelectorAll('.subject-option');

    if (subjectDisplay && subjectModal) {
        subjectDisplay.addEventListener('click', function(e) {
            e.preventDefault();
            subjectModal.style.display = 'flex';
        });
    }

    subjectOptions.forEach(option => {
        option.addEventListener('click', function() {
            const selectedSubject = this.getAttribute('data-subject');
            if (subjectInput) subjectInput.value = selectedSubject;
            if (subjectDisplay) {
                subjectDisplay.value = selectedSubject;
                subjectDisplay.classList.remove('input-error'); 
                subjectDisplay.style.borderColor = '#322D78';
            }
            closeSubjectModal();
        });
    });

    // Password visibility toggle
    const togglePassword = document.getElementById('togglePassword');
    const passwordField = document.getElementById('password-field');

    if (togglePassword && passwordField) {
        togglePassword.addEventListener('click', function() {
            const isPassword = passwordField.getAttribute('type') === 'password';
            passwordField.setAttribute('type', isPassword ? 'text' : 'password');
            this.classList.toggle('fa-eye', !isPassword);
            this.classList.toggle('fa-eye-slash', isPassword);
        });
    }

    // 11-digit phone fields: digits only, max 11 (contact + register)
    const phoneField = document.getElementById('contact_number');
    if (phoneField) {
        phoneField.setAttribute('inputmode', 'numeric');
        phoneField.setAttribute('maxlength', '11');
        phoneField.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 11);
        });
    }

    // Contact Form & Message Card Pop-Up Integration
    const contactForm = document.getElementById('contactForm');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const contactFullName = document.getElementById('fullName');
    const contactEmail = document.getElementById('email');
    const contactPhone = document.getElementById('contact_number');
    const contactMessage = document.getElementById('message');

    const sentMessageCard = document.getElementById('sentMessageCard');
    const editMessageBtn = document.getElementById('editMessageBtn');
    const deleteMessageBtn = document.getElementById('deleteMessageBtn');
    const envelopeBtn = document.getElementById('envelopeBtn');
    const envelopeModal = document.getElementById('envelopeModal');
    const envelopeStage = document.getElementById('envelopeStage');
    const envelopeToggle = document.getElementById('envelopeToggle');
    const letterReader = document.getElementById('letterReader');
    const letterFold = document.getElementById('letterFold');
    const envHint = document.getElementById('envHint');
    const envEditBtn = document.getElementById('envEditBtn');
    const envDeleteBtn = document.getElementById('envDeleteBtn');
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const deleteCancelBtn = document.getElementById('deleteCancelBtn');
    const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
    const sendButtonDefaultHTML = sendMessageBtn ? sendMessageBtn.innerHTML : '';

    let lastMessage = loadLastMessage();
    let isSending = false;

    // Badge = icon + word. The card hides the word on phones (CSS), so the label is also kept in title / aria-label.
    function paintStatus(badgeEl, status) {
        if (!badgeEl) return;
        const key = MESSAGE_STATUS_META[status] ? status : 'Review';
        const meta = MESSAGE_STATUS_META[key];
        const fullText = meta.lead + ' ' + key.toLowerCase();
        badgeEl.className = 'status-badge ' + meta.cls;
        badgeEl.innerHTML = '<i class="fa-solid ' + meta.icon + '"></i> <span class="status-text">' + key + '</span>';
        badgeEl.setAttribute('role', 'img');
        badgeEl.setAttribute('aria-label', fullText);
        badgeEl.title = fullText;
    }

    function applyStatus(status) {
        const key = MESSAGE_STATUS_META[status] ? status : 'Review';
        paintStatus(document.getElementById('messageStatusBadge'), key);
        paintStatus(document.getElementById('envStatusBadge'), key);
        document.querySelectorAll('.status-lead').forEach(function (el) { el.textContent = MESSAGE_STATUS_META[key].lead; });
    }

    function showStatusCard() {
        if (!sentMessageCard) return;
        sentMessageCard.style.display = 'grid';
        if (window.innerWidth < 992) sentMessageCard.classList.add('mobile-active');
    }

    // Envelope pop-up: the closed envelope shows first. Tapping it opens the flap and swaps it for the letter.
    // Tapping the folded corner of the letter puts the letter back and brings the envelope back.
    function setLetterOpen(open) {
        if (!envelopeStage) return;
        envelopeStage.classList.toggle('is-open', open);
        envelopeStage.inert = open;                    // the hidden side cannot be tabbed to or tapped
        if (letterReader) letterReader.inert = !open;
        if (envHint) envHint.textContent = open ? 'Tap the corner to close' : 'Tap the envelope to open';
    }

    function openEnvelopeModal() {
        if (!envelopeModal || !lastMessage) return;
        document.getElementById('envSubject').textContent = 'Subject: ' + (lastMessage.subject || '');
        document.getElementById('envMessageText').textContent = lastMessage.text || '';
        applyStatus(lastMessage.status);
        lastMessage.seen = true;
        saveLastMessage(lastMessage);
        updateEnvelopeDot();
        setLetterOpen(false);
        envelopeModal.style.display = 'flex';
        refreshStatus();
    }

    // Edit & Resend: back to the form with the message ready to change
    function editAndResend() {
        closeEnvelopeModal();
        if (!contactMessage) return;
        if (lastMessage) {
            if (contactMessage.value.trim() === '') contactMessage.value = lastMessage.text || '';
            const subjectInputEl = document.getElementById('subject');
            const subjectDisplayEl = document.getElementById('subjectDisplay');
            if (subjectInputEl && subjectInputEl.value === '') {
                subjectInputEl.value = lastMessage.subject || '';
                if (subjectDisplayEl) subjectDisplayEl.value = lastMessage.subject || '';
            }
        }
        contactMessage.focus();
        contactMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (sendMessageBtn) {
            sendMessageBtn.style.backgroundColor = '';
            sendMessageBtn.style.color = '';
            sendMessageBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Resend Message';
        }
    }

    // Delete: always asks first, then removes the message card and forgets the message
    function openDeleteConfirm() {
        if (!deleteConfirmModal || !lastMessage) return;
        deleteConfirmModal.style.display = 'flex';
        if (deleteCancelBtn) deleteCancelBtn.focus();
    }

    function closeDeleteConfirm() {
        if (deleteConfirmModal) deleteConfirmModal.style.display = 'none';
    }

    async function deleteMessage() {
        const doomed = lastMessage;
        // Ask the server to erase the saved row right away (checks id + secret token). The pop animation runs while it works.
        const serverDelete = (doomed && !doomed.simulated && doomed.id && doomed.token)
            ? postJSON('api.php?r=contact', { action: 'delete', message_id: doomed.id, token: doomed.token }).catch(function () { /* offline: it is already gone from this browser */ })
            : Promise.resolve();
        closeDeleteConfirm();
        closeEnvelopeModal();

        lastMessage = null;
        try { localStorage.removeItem(LAST_MESSAGE_KEY); } catch (err) { /* storage blocked: ignore */ }
        if (sentMessageCard) {
            // The card pops and bursts into confetti (effects.js), then goes away. Every deletion on the site does this.
            if (typeof window.uswagPop === 'function') { try { await window.uswagPop(sentMessageCard); } catch (err) { /* effect only */ } }
            sentMessageCard.style.display = 'none';
            sentMessageCard.classList.remove('mobile-active');
        }
        updateEnvelopeDot();
        if (sendMessageBtn) {
            sendMessageBtn.style.backgroundColor = '';
            sendMessageBtn.style.color = '';
            sendMessageBtn.innerHTML = sendButtonDefaultHTML;
        }
        await serverDelete;


    }

    // Ask the server whether the SLP Admin has marked the message Received or Rejected
    async function refreshStatus() {
        if (!lastMessage || lastMessage.simulated || !lastMessage.id || !lastMessage.token) return;
        try {
            const res = await postJSON('api.php?r=contact', {
                action: 'status', message_id: lastMessage.id, token: lastMessage.token
            });
            const newStatus = res.data && res.data.message_status;
            if (lastMessage && res.ok && MESSAGE_STATUS_META[newStatus] && newStatus !== lastMessage.status) {
                lastMessage.status = newStatus;
                lastMessage.seen = !!(envelopeModal && envelopeModal.style.display === 'flex');
                saveLastMessage(lastMessage);
                applyStatus(newStatus);
                updateEnvelopeDot();
            }
        } catch (err) { /* offline: keep the status we already have */ }
    }

    // Red dot on the envelope when the SLP Admin has answered (Received / Rejected) and you have not opened it yet
    function updateEnvelopeDot() {
        if (!envelopeBtn) return;
        const unseen = !!(lastMessage && lastMessage.status !== 'Review' && lastMessage.seen === false);
        envelopeBtn.classList.toggle('has-update', unseen);
    }

    setLetterOpen(false);

    // The envelope icon and the "View message" words are one button: either one opens the pop-up
    if (envelopeBtn) envelopeBtn.addEventListener('click', openEnvelopeModal);
    if (envelopeToggle) envelopeToggle.addEventListener('click', () => setLetterOpen(true));
    if (letterFold) letterFold.addEventListener('click', () => setLetterOpen(false));
    if (envEditBtn) envEditBtn.addEventListener('click', editAndResend);
    if (editMessageBtn) editMessageBtn.addEventListener('click', editAndResend);
    if (envDeleteBtn) envDeleteBtn.addEventListener('click', openDeleteConfirm);
    if (deleteMessageBtn) deleteMessageBtn.addEventListener('click', openDeleteConfirm);
    if (deleteCancelBtn) deleteCancelBtn.addEventListener('click', closeDeleteConfirm);
    if (deleteConfirmBtn) deleteConfirmBtn.addEventListener('click', deleteMessage);
    if (envelopeModal) {
        envelopeModal.addEventListener('click', function(e) { if (e.target === envelopeModal) closeEnvelopeModal(); });
    }
    if (deleteConfirmModal) {
        deleteConfirmModal.addEventListener('click', function(e) { if (e.target === deleteConfirmModal) closeDeleteConfirm(); });
    }
    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Escape') return;
        if (deleteConfirmModal && deleteConfirmModal.style.display === 'flex') closeDeleteConfirm();
        else closeEnvelopeModal();
    });

    // Bring back the status card after a refresh, then keep it fresh while the status is still "Review"
    if (sentMessageCard && lastMessage && (lastMessage.id || lastMessage.simulated)) {
        applyStatus(lastMessage.status);
        updateEnvelopeDot();
        showStatusCard();
        refreshStatus();
        setInterval(function() {
            if (document.visibilityState === 'visible' && lastMessage && lastMessage.status === 'Review') refreshStatus();
        }, 30000);
    }

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            if (isSending) return;

            const successModal = document.getElementById('successModal');

            const nameVal = contactFullName ? contactFullName.value.trim() : '';
            const emailVal = contactEmail ? contactEmail.value.trim() : '';
            const phoneVal = contactPhone ? contactPhone.value.trim() : '';
            const subjectVal = subjectInput ? subjectInput.value.trim() : '';
            const msgVal = contactMessage ? contactMessage.value.trim() : '';

            if (!nameVal || !phoneVal || !subjectVal || !msgVal) {
                showWarning("Please fill in all required fields and select Subject or Concern.");
                return;
            }
            if (!/^\d{11}$/.test(phoneVal)) {
                showWarning("Contact number must be exactly 11 digits.");
                return;
            }
            if (emailVal !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
                showWarning("Please enter a valid email address or leave it blank.");
                return;
            }

            // JSON -> api.php?r=contact -> MySQL; the server also sends the SMS and the emails
            const buttonBefore = sendMessageBtn ? sendMessageBtn.innerHTML : '';
            isSending = true;
            if (sendMessageBtn) {
                sendMessageBtn.disabled = true;
                sendMessageBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
            }

            try {
                const res = await callApi('contact', 'api.php?r=contact', {
                    action: 'send',
                    fullName: nameVal,
                    email: emailVal,
                    contact_number: phoneVal,
                    subject: subjectVal,
                    message: msgVal
                });

                if (!res.ok || res.data.status !== 'success') {
                    if (sendMessageBtn) sendMessageBtn.innerHTML = buttonBefore;
                    showWarning(res.data.message || 'Your message could not be sent. Please try again.');
                    return;
                }

                lastMessage = {
                    id: res.data.message_id,
                    token: res.data.token,
                    subject: subjectVal,
                    text: msgVal,
                    status: res.data.message_status || 'Review',
                    sentAt: Date.now(),
                    simulated: !!res.data.simulated,
                    seen: true
                };
                saveLastMessage(lastMessage);
                applyStatus(lastMessage.status);
                updateEnvelopeDot();
                showStatusCard();


                if (sendMessageBtn) {
                    sendMessageBtn.style.backgroundColor = "var(--secondary-color)";
                    sendMessageBtn.style.color = "#FFFFFF";
                    sendMessageBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Message Sent';
                }

                if (successModal) {
                    successModal.style.display = 'flex';
                    setTimeout(triggerConfettiBurst, 100);
                }
            } catch (err) {
                if (sendMessageBtn) sendMessageBtn.innerHTML = buttonBefore;
                showWarning("Cannot reach the server. Check your internet connection and try again.");
            } finally {
                isSending = false;
                if (sendMessageBtn) sendMessageBtn.disabled = false;
            }
        });
    }

    initGallery();
});

function initGallery() {
    const wrappers = document.querySelectorAll('.gallery-wrapper');
    if (wrappers.length === 0) return;

    wrappers.forEach(wrapper => {
        wrapper.dataset.galleryPos = "0";

        const slider = wrapper.querySelector('.gallery-slider');
        const arrows = wrapper.querySelectorAll('.gal-arrow');
        const prevBtn = arrows[0];
        const nextBtn = arrows[1];

        if (!slider) return;

        if (prevBtn) prevBtn.addEventListener('click', () => moveGallery(wrapper, -1));
        if (nextBtn) nextBtn.addEventListener('click', () => moveGallery(wrapper, 1));
    });

    window.addEventListener('resize', () => {
        wrappers.forEach(wrapper => {
            wrapper.dataset.galleryPos = "0";
            renderGallerySlide(wrapper);
        });
    });
}

function moveGallery(wrapper, direction) {
    const slider = wrapper.querySelector('.gallery-slider');
    if (!slider || slider.children.length === 0) return;

    const isMobile = window.innerWidth <= 768;
    const visibleCount = isMobile ? 1 : 4; 
    
    const maxIndex = Math.max(0, slider.children.length - visibleCount);

    let currentPos = parseInt(wrapper.dataset.galleryPos || "0", 10);
    currentPos += direction;

    if (currentPos < 0) currentPos = 0;
    if (currentPos > maxIndex) currentPos = maxIndex;

    wrapper.dataset.galleryPos = currentPos;
    renderGallerySlide(wrapper);
}

function renderGallerySlide(wrapper) {
    const slider = wrapper.querySelector('.gallery-slider');
    if (!slider || slider.children.length === 0) return;

    const currentPos = parseInt(wrapper.dataset.galleryPos || "0", 10);
    const imgWidth = slider.children[0].getBoundingClientRect().width;
    const gap = 12;

    const translateX = (imgWidth + gap) * currentPos;
    slider.style.transform = `translateX(-${translateX}px)`;
}

// Interactive Developer Profile Modal Handler
document.addEventListener("DOMContentLoaded", function() {
    const openProfileBtn = document.getElementById('openProfileModalBtn');
    const profileModal = document.getElementById('profileModal');
    const profileViewport = document.getElementById('profileViewport');
    const profileCanvasScaler = document.getElementById('profileCanvasScaler');
    const profileModalHeader = document.getElementById('profileModalHeader');
    const profileModalWindow = document.querySelector('.profile-modal-window');

    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const resetZoomBtn = document.getElementById('resetZoomBtn');
    const zoomLevelDisplay = document.getElementById('zoomLevelDisplay');

    let currentZoom = 1;
    let panX = 0;
    let panY = 0;

    if (openProfileBtn && profileModal) {
        openProfileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            profileModal.style.display = 'flex';
            resetTransform();
        });
    }

    window.closeProfileModal = function() {
        if (profileModal) {
            profileModal.style.display = 'none';
            resetTransform();
        }
    };

    function updateTransform() {
        if (profileCanvasScaler) {
            profileCanvasScaler.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom})`;
        }
        if (zoomLevelDisplay) {
            zoomLevelDisplay.innerText = `${Math.round(currentZoom * 100)}%`;
        }
    }

    function resetTransform() {
        currentZoom = 1;
        panX = 0;
        panY = 0;
        if (profileModalWindow) {
            profileModalWindow.style.transform = 'translate(0px, 0px)';
        }
        updateTransform();
    }

    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            currentZoom = Math.min(currentZoom + 0.25, 3.0);
            updateTransform();
        });
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            currentZoom = Math.max(currentZoom - 0.25, 1.0);
            if (currentZoom === 1) { panX = 0; panY = 0; }
            updateTransform();
        });
    }

    if (resetZoomBtn) {
        resetZoomBtn.addEventListener('click', () => {
            resetTransform();
        });
    }
});

// Interactive Contact Google Maps Modal & Split Layout Script
document.addEventListener("DOMContentLoaded", function() {
    const openMapBtn = document.getElementById('openMapModalBtn');
    const mapModalWindow = document.getElementById('mapModalWindow');
    const contactPageContainer = document.getElementById('contactPageContainer');
    const mapViewport = document.getElementById('mapViewport');
    const mapCanvasScaler = document.getElementById('mapCanvasScaler');

    const mapZoomInBtn = document.getElementById('mapZoomInBtn');
    const mapZoomOutBtn = document.getElementById('mapZoomOutBtn');
    const mapResetBtn = document.getElementById('mapResetBtn');
    const mapZoomDisplay = document.getElementById('mapZoomDisplay');

    let mapZoom = 1;
    let mapPanX = 0;
    let mapPanY = 0;

    if (openMapBtn && mapModalWindow && contactPageContainer) {
        openMapBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.innerWidth >= 992) {
                contactPageContainer.classList.add('split-active');
                mapModalWindow.style.display = 'flex';
            } else {
                mapModalWindow.classList.add('mobile-popup-active');
            }
            resetMapTransform();
        });
    }

    window.closeMapModal = function() {
        if (mapModalWindow && contactPageContainer) {
            contactPageContainer.classList.remove('split-active');
            mapModalWindow.classList.remove('mobile-popup-active');
            mapModalWindow.style.display = 'none';
            resetMapTransform();
        }
    };

    function updateMapTransform() {
        if (mapCanvasScaler) {
            mapCanvasScaler.style.transform = `translate(${mapPanX}px, ${mapPanY}px) scale(${mapZoom})`;
        }
        if (mapZoomDisplay) {
            mapZoomDisplay.innerText = `${Math.round(mapZoom * 100)}%`;
        }
    }

    function resetMapTransform() {
        mapZoom = 1;
        mapPanX = 0;
        mapPanY = 0;
        updateMapTransform();
    }

    if (mapZoomInBtn) {
        mapZoomInBtn.addEventListener('click', () => {
            mapZoom = Math.min(mapZoom + 0.25, 3.0);
            updateMapTransform();
        });
    }

    if (mapZoomOutBtn) {
        mapZoomOutBtn.addEventListener('click', () => {
            mapZoom = Math.max(mapZoom - 0.25, 1.0);
            if (mapZoom === 1) { mapPanX = 0; mapPanY = 0; }
            updateMapTransform();
        });
    }

    if (mapResetBtn) {
        mapResetBtn.addEventListener('click', () => {
            resetMapTransform();
        });
    }
});

// Registration: Terms & NPC notice, then JSON -> api.php?r=register -> MySQL. A new member is signed in right away.
document.addEventListener("DOMContentLoaded", function() {
    const regForm = document.getElementById('regForm');
    if (!regForm) return;

    const tncModal = document.getElementById('tncModal');
    const openTncLink = document.getElementById('openTncModal');
    const proceedTncBtn = document.getElementById('proceedTncBtn');
    const termsCheckbox = document.getElementById('termsCheckbox');
    const submitBtn = document.getElementById('submitBtn');
    let isSubmitting = false;
    let redirecting = false;
    const THANK_YOU_PAGE = 'thankyou.html';

    if (openTncLink && tncModal) {
        openTncLink.addEventListener('click', function(e) {
            e.preventDefault();
            tncModal.style.display = 'flex';
        });
    }

    if (proceedTncBtn) {
        proceedTncBtn.addEventListener('click', function() {
            if (termsCheckbox) termsCheckbox.checked = true;
            closeTncModal();
        });
    }

    regForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (isSubmitting) return;

        const username = document.getElementById('username').value.trim();
        const address = document.getElementById('address').value.trim();
        const contact = document.getElementById('contact_number').value.trim();
        const role = document.getElementById('role').value.trim();
        const password = document.getElementById('password-field').value;

        if (!username || !address || !contact || !role || !password) {
            showWarning("Please fill in all required fields and select a System Role.");
            return;
        }
        if (!/^\d{11}$/.test(contact)) {
            showWarning("Contact number must be exactly 11 digits.");
            return;
        }
        if (password.length < 8) {
            showWarning("Password must be at least 8 characters long.");
            return;
        }
        if (isWeakPassword(password)) {
            showWarning("That password is too easy to guess. Please choose a stronger one.");
            return;
        }
        if (termsCheckbox && !termsCheckbox.checked) {
            showWarning("Please agree to the Terms and Conditions to continue.");
            return;
        }

        const buttonBefore = submitBtn ? submitBtn.innerHTML : '';
        isSubmitting = true;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating account...';
        }

        try {
            const res = await callApi('register', 'api.php?r=register', {
                username: username,
                address: address,
                contact_number: contact,
                role: role,
                password: password,
                terms: !!(termsCheckbox && termsCheckbox.checked),
                turnstile: (typeof window.uswagHumanToken === 'function') ? window.uswagHumanToken() : ''
            });

            if (!res.ok || res.data.status !== 'success') {
                if (typeof window.uswagResetHuman === 'function') window.uswagResetHuman();
                showWarning(res.data.error || res.data.message || 'Registration failed. Please try again.');
                return;
            }

            regForm.reset();


            // No pop-up: thankyou.html does the celebrating. The button stays on "Creating account..." until the page changes.
            redirecting = true;
            window.location.href = THANK_YOU_PAGE;
        } catch (err) {
            showWarning("Cannot reach the server. Check your internet connection and try again.");
        } finally {
            if (!redirecting) {
                isSubmitting = false;
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = buttonBefore;
                }
            }
        }
    });

    // Coming back with the browser's Back button should not leave the button stuck on "Creating account..."
    window.addEventListener('pageshow', function(e) {
        if (!e.persisted) return;
        redirecting = false;
        isSubmitting = false;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Submit Registration';
        }
    });
});

// ===================================================================================
// AD SPACE (contact.html, between the map and the message status)
//   The "Ad space" box keeps the room reserved so the page never jumps. It disappears only when a real ad fills it.
//   GOOGLE ADSENSE: after Google approves the site, fill in the two values below. Nothing else needs to change:
//     ADSENSE_CLIENT = your publisher id  (AdSense > Account > Account information, looks like 'ca-pub-1234567890123456')
//     ADSENSE_SLOT   = the ad unit id     (AdSense > Ads > By ad unit, a 10-digit number)
//   Also publish /ads.txt at the site root (template included). Leave both values empty while testing: no request is made.
//   Note: a visitor's ad blocker (Brave Shields, uBlock...) hides the ad itself on that visitor's own screen only.
// ===================================================================================
const ADSENSE_CLIENT = '';
const ADSENSE_SLOT = '';

document.addEventListener("DOMContentLoaded", function() {
    const adSlot = document.getElementById('sponsorSlot');
    const adSlotContent = document.getElementById('sponsorSlotContent');
    if (!adSlot || !adSlotContent) return;

    function checkForAd() {
        const unit = adSlotContent.querySelector('ins.adsbygoogle');
        const filled = !!unit && unit.getAttribute('data-ad-status') === 'filled';
        const hasContent = adSlotContent.children.length > 0 && adSlotContent.getBoundingClientRect().height > 20;
        adSlot.classList.toggle('has-ad', unit ? filled : hasContent);
    }

    function mountAdSense() {
        if (!ADSENSE_CLIENT || !ADSENSE_SLOT) return;
        const loader = document.createElement('script');
        loader.async = true;
        loader.crossOrigin = 'anonymous';
        loader.setAttribute('data-cfasync', 'false');   // Cloudflare Rocket Loader must not delay the ad script
        loader.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(ADSENSE_CLIENT);
        document.head.appendChild(loader);

        const unit = document.createElement('ins');
        unit.className = 'adsbygoogle';
        unit.style.display = 'block';
        unit.style.width = '100%';
        unit.setAttribute('data-ad-client', ADSENSE_CLIENT);
        unit.setAttribute('data-ad-slot', ADSENSE_SLOT);
        unit.setAttribute('data-ad-format', 'auto');
        unit.setAttribute('data-full-width-responsive', 'true');
        adSlotContent.appendChild(unit);
        try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (err) { /* blocked or not approved yet: the placeholder stays */ }
    }

    new MutationObserver(checkForAd).observe(adSlotContent, { childList: true, subtree: true, attributes: true });
    window.addEventListener('load', function() { setTimeout(checkForAd, 1500); });
    mountAdSense();
});


// ===================================================================================
// IMAGE LIGHTBOX (full view of a gallery photo)
//   open: click / tap a photo      browse: swipe left-right (touch) or arrow keys (keyboard)
//   close: single or double click / tap, the X button, or Esc
// A swipe never counts as a click, so swiping does not close the photo.
// ===================================================================================
(function () {
    let items = [];
    let index = 0;
    let isOpen = false;
    let closedAt = 0;
    let suppressClose = false;

    const SWIPE_MIN_PX = 50;

    function modalEl() { return document.getElementById('imageLightboxModal'); }
    function imageEl() { return document.getElementById('lightboxImage'); }

    function counterEl() {
        let counter = document.getElementById('lightboxCounter');
        const modal = modalEl();
        if (!counter && modal) {
            counter = document.createElement('div');
            counter.id = 'lightboxCounter';
            counter.className = 'lightbox-counter';
            modal.appendChild(counter);
        }
        return counter;
    }

    function show(direction) {
        const img = imageEl();
        if (!img || !items.length) return;
        const item = items[index];
        img.draggable = false;
        img.src = item.src;
        img.alt = item.alt || 'Enlarged SLPA Photo';

        img.classList.remove('lb-from-right', 'lb-from-left');
        if (direction) {
            void img.offsetWidth;
            img.classList.add(direction > 0 ? 'lb-from-right' : 'lb-from-left');
        }

        const counter = counterEl();
        if (counter) {
            counter.textContent = (index + 1) + ' / ' + items.length;
            counter.style.display = items.length > 1 ? 'block' : 'none';
        }

        // warm up the neighbours so the next swipe is instant
        [1, -1].forEach(function (step) {
            if (items.length > 1) new Image().src = items[(index + step + items.length) % items.length].src;
        });
    }

    function go(direction) {
        if (!isOpen || items.length < 2) return;
        index = (index + direction + items.length) % items.length;
        show(direction);
    }

    window.openImageModal = function (src) {
        if (Date.now() - closedAt < 450) return;   // the 2nd click of a double-click must not re-open it
        const modal = modalEl();
        if (!modal || !imageEl()) return;

        const clicked = Array.from(document.querySelectorAll('.gallery-slider img')).find(function (img) {
            return img.src === src || img.getAttribute('src') === src;
        });
        const slider = clicked ? clicked.closest('.gallery-slider') : null;
        const siblings = slider ? Array.from(slider.querySelectorAll('img')) : [];

        if (siblings.length) {
            items = siblings.map(function (img) { return { src: img.src, alt: img.alt }; });
            index = siblings.indexOf(clicked);
        } else {
            items = [{ src: src, alt: '' }];
            index = 0;
        }

        show(0);
        modal.style.display = 'flex';
        isOpen = true;
        document.body.style.overflow = 'hidden';
    };

    window.closeLightbox = function () {
        if (suppressClose) { suppressClose = false; return; }   // this "click" was the end of a swipe
        const modal = modalEl();
        if (modal) modal.style.display = 'none';
        isOpen = false;
        closedAt = Date.now();
        document.body.style.overflow = '';
    };

    document.addEventListener('keydown', function (e) {
        if (!isOpen) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
        else if (e.key === 'Escape') { e.preventDefault(); window.closeLightbox(); }
    });

    document.addEventListener('DOMContentLoaded', function () {
        const modal = modalEl();
        if (!modal) return;

        let startX = 0, startY = 0, tracking = false, pointers = 0;

        modal.addEventListener('pointerdown', function (e) {
            suppressClose = false;   // a new touch always starts fresh
            pointers++;
            if (pointers > 1) { tracking = false; return; }   // two fingers = pinch, not a swipe
            startX = e.clientX;
            startY = e.clientY;
            tracking = true;
        });

        modal.addEventListener('pointerup', function (e) {
            pointers = Math.max(0, pointers - 1);
            if (!tracking) return;
            tracking = false;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy) * 1.2) {
                suppressClose = true;
                setTimeout(function () { suppressClose = false; }, 350);
                go(dx < 0 ? 1 : -1);   // swipe left = next photo, swipe right = previous photo
            }
        });

        modal.addEventListener('pointercancel', function () { pointers = 0; tracking = false; });
    });
})();

// ===================================================================================
// NEWS & ARTICLES (index.html): "Read another article" drop-down
// ===================================================================================
document.addEventListener("DOMContentLoaded", function() {
    const newsToggle = document.getElementById('newsToggle');
    const newsMore = document.getElementById('newsMore');
    if (!newsToggle || !newsMore) return;

    const label = newsToggle.querySelector('span');

    newsToggle.addEventListener('click', function() {
        const willOpen = newsMore.hidden;
        newsMore.hidden = !willOpen;
        newsToggle.setAttribute('aria-expanded', String(willOpen));
        newsToggle.classList.toggle('is-open', willOpen);
        if (label) label.textContent = willOpen ? 'Show fewer articles' : 'Read another article';
        if (willOpen) newsMore.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
});
