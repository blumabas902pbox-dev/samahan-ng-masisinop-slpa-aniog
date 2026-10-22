// Where the PHP files live. Leave '' when the pages and PHP are on the same host.
const API_BASE = '';

// Sends JSON to a PHP file and returns { ok, status, data }. It only throws when the server cannot be reached.
// Flow: this page (JSON) -> Apache/PHP -> MySQL.
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

// Optional simulation support: getSim() returns the SIMULATION block's helper when that block exists.
// If the block is deleted this returns null and every call below behaves like a normal request.
function getSim() {
    return (window.USWAG_SIM && window.USWAG_SIM.enabled) ? window.USWAG_SIM : null;
}

// Like postJSON, but lets the simulation stand in when no PHP server answers (static hosting, offline demo).
async function callApi(kind, file, payload) {
    try {
        const res = await postJSON(file, payload);
        const sim = getSim();
        if (sim && sim.serverMissing(res)) return sim.fakeResponse(kind, payload);
        return res;
    } catch (err) {
        const sim = getSim();
        if (sim) return sim.fakeResponse(kind, payload);
        throw err;
    }
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
        closeDeleteConfirm();
        closeEnvelopeModal();

        lastMessage = null;
        try { localStorage.removeItem(LAST_MESSAGE_KEY); } catch (err) { /* storage blocked: ignore */ }
        if (sentMessageCard) {
            sentMessageCard.style.display = 'none';
            sentMessageCard.classList.remove('mobile-active');
        }
        updateEnvelopeDot();
        if (sendMessageBtn) {
            sendMessageBtn.style.backgroundColor = '';
            sendMessageBtn.style.color = '';
            sendMessageBtn.innerHTML = sendButtonDefaultHTML;
        }

        // Also ask the server to delete the saved row. Needs a "delete" action in process_contact.php (checks id + token).
        if (doomed && !doomed.simulated && doomed.id && doomed.token) {
            try {
                await postJSON('process_contact.php', { action: 'delete', message_id: doomed.id, token: doomed.token });
            } catch (err) { /* offline: the message is already gone from this browser */ }
        }
    }

    // Ask the server whether the SLP Admin has marked the message Received or Rejected
    async function refreshStatus() {
        if (!lastMessage || lastMessage.simulated || !lastMessage.id || !lastMessage.token) return;
        try {
            const res = await postJSON('process_contact.php', {
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

            // JSON -> Apache/PHP (process_contact.php) -> MySQL; the server also sends the SMS and the emails
            const buttonBefore = sendMessageBtn ? sendMessageBtn.innerHTML : '';
            isSending = true;
            if (sendMessageBtn) {
                sendMessageBtn.disabled = true;
                sendMessageBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
            }

            try {
                const res = await callApi('contact', 'process_contact.php', {
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

                // SIMULATION HOOK START (optional: does nothing if the SIMULATION block is removed)
                { const sim = getSim(); if (sim) sim.onContactSent({ name: nameVal, email: emailVal, phone: phoneVal, subject: subjectVal, message: msgVal }, res); }
                // SIMULATION HOOK END

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

// Registration: Terms & NPC notice, then JSON -> Apache/PHP (process_register.php) -> MySQL
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
            const res = await callApi('register', 'process_register.php', {
                action: 'register',
                username: username,
                address: address,
                contact_number: contact,
                role: role,
                password: password
            });

            if (!res.ok || res.data.status !== 'success') {
                showWarning(res.data.error || res.data.message || 'Registration failed. Please try again.');
                return;
            }

            regForm.reset();

            // SIMULATION HOOK START (optional: does nothing if the SIMULATION block is removed)
            { const sim = getSim(); if (sim) sim.onRegistered({ username: username, address: address, phone: contact, role: role }, res); }
            // SIMULATION HOOK END

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

// Ad slot: hide the "Ad space" placeholder as soon as an ad network puts something real inside the slot
document.addEventListener("DOMContentLoaded", function() {
    const adSlot = document.getElementById('adSlot');
    const adSlotContent = document.getElementById('adSlotContent');
    if (!adSlot || !adSlotContent) return;

    function checkForAd() {
        const hasAd = adSlotContent.children.length > 0 && adSlotContent.getBoundingClientRect().height > 20;
        adSlot.classList.toggle('has-ad', hasAd);
    }

    new MutationObserver(checkForAd).observe(adSlotContent, { childList: true, subtree: true, attributes: true });
    window.addEventListener('load', function() { setTimeout(checkForAd, 1500); });
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

// ===================================================================================
// SIMULATION START
// Demo helpers: prints the "SMS / email" notification previews in the browser console, shows the success
// pop-up even when no PHP server is reachable (static hosting / offline).
//
// SAFE TO REMOVE: delete everything from "SIMULATION START" to "SIMULATION END". The rest of this file only
// uses it through getSim(), which returns null when this block is gone, so nothing else is affected.
// To switch it off without deleting it, set  enabled: false  below.
// ===================================================================================
(function () {
    const SIM = { enabled: true };

    // The original dispatch message (console preview of the SMS and the email the sender receives)
    function dispatchContactNotification(contactData) {
        console.log("----------------------------------------");
        console.log("[SMS Notification From: Samahan ng Masisinop]");
        console.log(`To Mobile Number: ${contactData.phone}`);
        console.log(`Message: Thank you for your inquiry! Your message was sent to Samahan ng Masisinop SLPA Officer. We'll get in touch soon.`);
        console.log("Status: Delivered successfully.");
        console.log("Note: Sender can't accept replies. Contact them directly at +63 938 364 2371.");
        console.log("----------------------------------------");

        if (contactData.email && contactData.email.trim() !== '') {
            console.log("----------------------------------------");
            console.log("[Email Notification From: slpa.aniog@gmail.com]");
            console.log(`To Email: ${contactData.email}`);
            console.log(`Subject: Inquiry Confirmation - [${contactData.subject}]`);
            console.log(`Body: Dear ${contactData.name},\n\nThank you for your inquiry! Your message was sent to Samahan ng Masisinop SLPA Officer. We'll get in touch soon.\n\n[Available Actions: Reply | Forward | Acknowledge]`);
            console.log("Status: Email delivered to inbox successfully.");
            console.log("----------------------------------------");
        }
    }

    function dispatchRegisterNotification(info) {
        console.log("----------------------------------------");
        console.log("[SMS Notification From: Samahan ng Masisinop]");
        console.log(`To Mobile Number: ${info.phone}`);
        console.log(`Message: Welcome to Samahan ng Masisinop, ${info.username}! Your ${info.role} account was created.`);
        console.log("Status: Delivered successfully.");
        console.log("----------------------------------------");
    }

    window.USWAG_SIM = {
        enabled: SIM.enabled,

        // True when the request reached a host with no PHP behind it (Cloudflare Workers / GitHub Pages / any static host).
        // Our PHP files ALWAYS answer in JSON, so a reply that is not JSON (HTML page, 403, 404, 405, 5xx from the host)
        // means no PHP ran. Real PHP answers such as validation errors (422), duplicates (409) or database errors (500 JSON)
        // are still shown as errors, never simulated.
        serverMissing: function (res) {
            return res.isJson === false || [404, 405, 501].indexOf(res.status) !== -1;
        },

        // Stand-in for the server's JSON when it is not reachable
        fakeResponse: function (kind, payload) {
            console.warn('[SIMULATION] No server answered, so this ' + kind + ' request was simulated and NOT saved to the database.');
            if (kind === 'contact') {
                return { ok: true, status: 201, data: { status: 'success', message_id: null, token: '', message_status: 'Review', simulated: true } };
            }
            return { ok: true, status: 201, data: { status: 'success', account_id: 0, role: payload.role, simulated: true } };
        },

        onContactSent: function (data, res) {
            console.log('[SIMULATION] Notification preview' + (res && res.data && res.data.simulated ? ' (server not reached)' : ''));
            dispatchContactNotification(data);
        },

        onRegistered: function (info, res) {
            console.log('[SIMULATION] Registration preview' + (res && res.data && res.data.simulated ? ' (server not reached)' : ''));
            dispatchRegisterNotification(info);
        }
    };
})();
// ===================================================================================
// SIMULATION END
// ===================================================================================
