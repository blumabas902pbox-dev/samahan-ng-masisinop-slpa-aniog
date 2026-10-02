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

function closeWarningModal() {
    const warningModal = document.getElementById('warningModal');
    if (warningModal) {
        warningModal.style.display = 'none';
    }
}

function isWeakPassword(password) {
    const lowerPwd = password.toLowerCase();
    const commonWeak = ['password', '12345678', '123456789', 'qwertyui', 'qwertyuiop', 'admin123', '11111111', '12341234'];
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
            origin: originParams
        });
    }
}

document.addEventListener("DOMContentLoaded", function() {
    showWelcomeAlert();
    
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
            }
            closeRoleModal();
        });
    });

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

    const regForm = document.getElementById('regForm');
    const submitBtn = document.getElementById('submitBtn');
    const usernameInput = document.getElementById('username');
    const addressInput = document.getElementById('address'); 
    const contactInput = document.getElementById('contact_number');

    if (regForm) {
        const allInputs = regForm.querySelectorAll('input');
        allInputs.forEach(input => {
            input.addEventListener('input', function() {
                this.classList.remove('input-error');
                if (submitBtn) {
                    submitBtn.style.backgroundColor = "var(--secondary-color)";
                }
            });
        });

        regForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const warningModal = document.getElementById('warningModal');
            const warningMessage = document.getElementById('warningMessage');

            function triggerWarning(msg, invalidInputs = []) {
                invalidInputs.forEach(input => {
                    if (input) input.classList.add('input-error');
                });

                if (warningModal && warningMessage) {
                    warningMessage.innerText = msg;
                    warningModal.style.display = 'flex';
                } else {
                    alert(msg);
                }

                if (submitBtn) {
                    submitBtn.style.backgroundColor = "var(--accent-color)";
                    submitBtn.style.color = "#FFFFFF";
                }
            }

            allInputs.forEach(input => input.classList.remove('input-error'));

            const usernameVal = usernameInput ? usernameInput.value.trim() : '';
            const addressVal = addressInput ? addressInput.value.trim() : '';
            const contactVal = contactInput ? contactInput.value.trim() : '';
            const roleVal = roleInput ? roleInput.value.trim() : '';
            const passwordVal = passwordField ? passwordField.value : '';

            let invalidElements = [];

            if (!usernameVal) invalidElements.push(usernameInput);
            if (!addressVal) invalidElements.push(addressInput);
            if (!contactVal) invalidElements.push(contactInput);
            if (!roleVal) invalidElements.push(roleDisplay);
            if (!passwordVal) invalidElements.push(passwordField);

            if (!usernameVal || !addressVal || !contactVal || !roleVal || !passwordVal) {
                triggerWarning("Please fill in all required fields and select a System Role.", invalidElements);
                return;
            }

            const contactRegex = /^\d{11}$/;
            if (!contactRegex.test(contactVal)) {
                triggerWarning("Contact number must strictly be exactly 11 digits (e.g., 09071128654).", [contactInput]);
                return;
            }

            if (passwordVal.length < 8) {
                triggerWarning("Account password must strictly be at least 8 characters long.", [passwordField]);
                return;
            }

            if (isWeakPassword(passwordVal)) {
                triggerWarning("Your password is too weak. Please avoid common combinations (like '1234'), repeated characters, or simple words.", [passwordField]);
                return;
            }

            const formData = new FormData(regForm);

            fetch('process_register.php', {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: formData
            })
            .then(response => {
                window.location.href = 'thankyou.html';
            })
            .catch(error => {
                window.location.href = 'thankyou.html';
            });
        });
    }

    const tutorialVideo = document.getElementById('tutorialVideo');
    const muteToggle = document.getElementById('muteToggle');

    if (tutorialVideo && muteToggle) {
        muteToggle.addEventListener('click', function() {
            if (tutorialVideo.muted) {
                tutorialVideo.muted = false;
                muteToggle.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            } else {
                tutorialVideo.muted = true;
                muteToggle.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
            }
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'success') {
        setTimeout(triggerConfettiBurst, 150); 
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
    
    // Prevent negative bounds if total images are fewer than visible slots
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
    const gap = 12; // Must match CSS gap

    const translateX = (imgWidth + gap) * currentPos;
    slider.style.transform = `translateX(-${translateX}px)`;
}

function openImageModal(imgUrl) {
    const modal = document.getElementById('imageLightboxModal');
    const modalImg = document.getElementById('lightboxImage');
    if (modal && modalImg) {
        modalImg.src = imgUrl;
        modal.style.display = 'flex';
    }
}

function closeLightbox() {
    const modal = document.getElementById('imageLightboxModal');
    if (modal) modal.style.display = 'none';
}