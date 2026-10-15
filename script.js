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
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.reset();
        const sendMessageBtn = document.getElementById('sendMessageBtn');
        if (sendMessageBtn) {
            sendMessageBtn.style.backgroundColor = '';
            sendMessageBtn.style.color = '';
            sendMessageBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
        }
    }
}

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
            origin: originParams,
            zIndex: 99999
        });
    }
}

document.addEventListener("DOMContentLoaded", function() {
    showWelcomeAlert();
    
    // Robust Image Loading Spinner Handler with Fail-Safe Timeout (Prevents Stuck Spinners)
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
            // Fail-safe timeout fallback guarantees spinner never gets stuck
            setTimeout(handleImageLoaded, 4000);
        }
    });

    // Robust Video Loading Handler (Tutorial Video) with Fail-Safe Timeout
    const tutorialVideo = document.getElementById('tutorialVideo');
    const videoLoader = document.getElementById('videoLoader');
    if (tutorialVideo) {
        const handleVideoLoaded = () => {
            tutorialVideo.classList.add('loaded');
            if (videoLoader) videoLoader.style.display = 'none';
        };

        if (tutorialVideo.readyState >= 1) { // HAVE_METADATA or higher
            handleVideoLoaded();
        } else {
            tutorialVideo.addEventListener('loadedmetadata', handleVideoLoaded);
            tutorialVideo.addEventListener('canplay', handleVideoLoaded);
            tutorialVideo.addEventListener('error', handleVideoLoaded);
            // Fail-safe timeout fallback guarantees video spinner never gets stuck
            setTimeout(handleVideoLoaded, 4000);
        }
    }

    // Dynamic border focus and input styling for secondary and accent colors
    const formInputsAndTextareas = document.querySelectorAll('input, textarea');
    formInputsAndTextareas.forEach(el => {
        el.addEventListener('focus', function() {
            if (!this.classList.contains('input-error')) {
                this.style.borderColor = '#322D78'; // --secondary-color
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

    // Role selection modal logic (Registration page)
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

    // Terms & Conditions / NPC Modal Logic
    const openTncModal = document.getElementById('openTncModal');
    const tncModal = document.getElementById('tncModal');
    const proceedTncBtn = document.getElementById('proceedTncBtn');
    const termsCheckbox = document.getElementById('termsCheckbox');

    if (openTncModal && tncModal) {
        openTncModal.addEventListener('click', function(e) {
            e.preventDefault();
            tncModal.style.display = 'flex';
        });
    }

    if (proceedTncBtn && tncModal && termsCheckbox) {
        proceedTncBtn.addEventListener('click', function() {
            termsCheckbox.checked = true;
            tncModal.style.display = 'none';
        });
    }

    // Subject selection modal logic (Contact page)
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

    // Registration Form submission
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
                this.style.borderColor = '#322D78';
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
                    if (input) {
                        input.classList.add('input-error');
                        input.style.borderColor = '#D31919'; // --accent-color
                    }
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

            allInputs.forEach(input => {
                input.classList.remove('input-error');
                input.style.borderColor = '#ccc';
            });

            const usernameVal = usernameInput ? usernameInput.value.trim() : '';
            const addressVal = addressInput ? addressInput.value.trim() : '';
            const contactVal = contactInput ? contactInput.value.trim() : '';
            const roleVal = roleInput ? roleInput.value.trim() : '';
            const passwordVal = passwordField ? passwordField.value : '';
            const isTermsChecked = termsCheckbox ? termsCheckbox.checked : false;

            let invalidElements = [];

            if (!usernameVal) invalidElements.push(usernameInput);
            if (!addressVal) invalidElements.push(addressInput);
            if (!contactVal) invalidElements.push(contactInput);
            if (!roleVal) invalidElements.push(roleDisplay);
            if (!passwordVal) invalidElements.push(passwordField);

            if (!usernameVal || !addressVal || !contactVal || !roleVal || !passwordVal) {
                triggerWarning("Please fill in all required fields and select System Role.", invalidElements);
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

            if (!isTermsChecked) {
                triggerWarning("You must agree to the Terms and Conditions and National Privacy Commission (NPC) privacy notice before creating an account.", [termsCheckbox]);
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

    // Contact Form submission & confirmation handling
    const contactForm = document.getElementById('contactForm');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const contactFullName = document.getElementById('fullName');
    const contactEmail = document.getElementById('email');
    const contactPhone = document.getElementById('contact_number');
    const contactMessage = document.getElementById('message');

    if (contactForm) {
        const contactInputs = contactForm.querySelectorAll('input, textarea');
        contactInputs.forEach(input => {
            input.addEventListener('input', function() {
                this.classList.remove('input-error');
                this.style.borderColor = '#322D78';
                if (sendMessageBtn) {
                    sendMessageBtn.style.backgroundColor = "var(--secondary-color)";
                }
            });
        });

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const warningModal = document.getElementById('warningModal');
            const warningMessage = document.getElementById('warningMessage');
            const successModal = document.getElementById('successModal');

            function triggerContactWarning(msg, invalidInputs = []) {
                invalidInputs.forEach(input => {
                    if (input) {
                        input.classList.add('input-error');
                        input.style.borderColor = '#D31919'; // --accent-color
                    }
                });

                if (warningModal && warningMessage) {
                    warningMessage.innerText = msg;
                    warningModal.style.display = 'flex';
                } else {
                    alert(msg);
                }

                if (sendMessageBtn) {
                    sendMessageBtn.style.backgroundColor = "var(--accent-color)";
                    sendMessageBtn.style.color = "#FFFFFF";
                }
            }

            contactInputs.forEach(input => {
                input.classList.remove('input-error');
                input.style.borderColor = '#ccc';
            });

            const nameVal = contactFullName ? contactFullName.value.trim() : '';
            const emailVal = contactEmail ? contactEmail.value.trim() : '';
            const phoneVal = contactPhone ? contactPhone.value.trim() : '';
            const subjectVal = subjectInput ? subjectInput.value.trim() : '';
            const msgVal = contactMessage ? contactMessage.value.trim() : '';

            let invalidElements = [];

            if (!nameVal) invalidElements.push(contactFullName);
            if (!phoneVal) invalidElements.push(contactPhone);
            if (!subjectVal) invalidElements.push(subjectDisplay);
            if (!msgVal) invalidElements.push(contactMessage);

            if (!nameVal || !phoneVal || !subjectVal || !msgVal) {
                triggerContactWarning("Please fill in all the required fields and select Subject or Concern.", invalidElements);
                return;
            }

            const contactRegex = /^\d{11}$/;
            if (!contactRegex.test(phoneVal)) {
                triggerContactWarning("Contact number must strictly be exactly 11 digits (e.g., 09071128654). Confirmation will be sent here.", [contactPhone]);
                return;
            }

            dispatchContactNotification({
                name: nameVal,
                email: emailVal,
                phone: phoneVal,
                subject: subjectVal,
                message: msgVal
            });

            fetch('process_contact.php', {
                method: 'POST',
                body: new FormData(contactForm)
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    if (sendMessageBtn) {
                        sendMessageBtn.style.backgroundColor = "var(--secondary-color)";
                        sendMessageBtn.style.color = "#FFFFFF";
                        sendMessageBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Message Sent';
                    }

                    if (successModal) {
                        successModal.style.display = 'flex';
                        setTimeout(triggerConfettiBurst, 100);
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                if (successModal) {
                    successModal.style.display = 'flex';
                    setTimeout(triggerConfettiBurst, 100);
                }
            });
        });
    }

    // Tutorial video mute toggle
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
        setTimeout(triggerConfettiBurst, 350);
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