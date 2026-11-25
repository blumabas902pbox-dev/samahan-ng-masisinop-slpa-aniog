/* footer.js - the dropdown links inside the footer (Contact, Privacy, Terms, GCash, Feedback).
   Without JavaScript the links still work as normal pages, so nothing breaks if this file is missing. */
(function () {
    'use strict';

    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var footer = document.querySelector('footer.site-footer');
        if (!footer) { return; }

        var triggers = Array.prototype.slice.call(footer.querySelectorAll('.footer-trigger'));
        var panels = Array.prototype.slice.call(footer.querySelectorAll('.footer-panel'));
        var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        footer.classList.add('is-enhanced');

        /* the "what is it about?" pop-up (built further down, only when the feedback form exists) */
        var typeModal = null;
        function typeModalIsOpen() {
            return !!typeModal && typeModal.style.display === 'flex';
        }
        function closeTypeModal() {
            if (typeModal) { typeModal.style.display = 'none'; }
        }

        function panelOf(trigger) {
            return document.getElementById(trigger.getAttribute('data-panel'));
        }

        function closeAll(exceptPanel) {
            triggers.forEach(function (t) {
                var p = panelOf(t);
                if (p === exceptPanel) { return; }
                t.setAttribute('aria-expanded', 'false');
                if (p) { p.classList.remove('is-open'); }
            });
        }

        function open(trigger) {
            var p = panelOf(trigger);
            if (!p) { return; }
            closeAll(p);
            trigger.setAttribute('aria-expanded', 'true');
            p.classList.add('is-open');
            window.setTimeout(function () {
                if (p.scrollIntoView) {
                    p.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
                }
            }, 60);
        }

        function toggle(trigger) {
            if (trigger.getAttribute('aria-expanded') === 'true') {
                closeAll(null);
            } else {
                open(trigger);
            }
        }

        triggers.forEach(function (t) {
            t.setAttribute('role', 'button');
            t.setAttribute('aria-expanded', 'false');
            t.addEventListener('click', function (e) {
                e.preventDefault();
                toggle(t);
            });
            t.addEventListener('keydown', function (e) {
                if (e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault();
                    toggle(t);
                }
            });
        });

        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape') { return; }
            if (typeModalIsOpen()) { closeTypeModal(); return; }   /* Esc closes the pop-up first */
            closeAll(null);
        });

        /* a tap outside the footer folds the open panel away (taps inside the type pop-up do not count) */
        document.addEventListener('click', function (e) {
            if (typeModal && typeModal.contains(e.target)) { return; }
            if (!footer.contains(e.target)) { closeAll(null); }
        });

        /* deep link: page.html#footer-feedback opens that panel */
        function openFromHash() {
            var h = (window.location.hash || '').replace('#', '');
            if (!h) { return; }
            triggers.forEach(function (t) {
                if (t.getAttribute('data-hash') === h) { open(t); }
            });
        }
        openFromHash();
        window.addEventListener('hashchange', openFromHash);

        /* GCash QR: if the picture is not there yet, show a friendly note instead of a broken image */
        var qrBox = footer.querySelector('.footer-qr-box');
        var qrImg = qrBox ? qrBox.querySelector('img') : null;
        if (qrBox && qrImg) {
            var missing = function () { qrBox.classList.add('is-missing'); };
            qrImg.addEventListener('error', missing);
            if (qrImg.complete && qrImg.naturalWidth === 0) { missing(); }
        }

        /* feedback form */
        var form = document.getElementById('footerFeedbackForm');
        if (!form) { return; }

        var msg = document.getElementById('fbMessage');
        var count = document.getElementById('fbCount');
        var err = document.getElementById('fbError');
        var page = document.getElementById('fbPage');
        var btn = document.getElementById('fbSubmit');

        /* remember which page the feedback came from (the thank-you page links back to it) */
        var file = (window.location.pathname.split('/').pop() || 'index.html');
        if (!/^[A-Za-z0-9_\-]+\.html$/.test(file)) { file = 'index.html'; }
        if (page) { page.value = file; }

        function updateCount() {
            if (msg && count) { count.textContent = msg.value.length + ' / 1000'; }
        }
        if (msg) { msg.addEventListener('input', updateCount); }
        updateCount();

        /* "What is it about?": same pick-from-a-pop-up choice as "Subject or Concern" on the Contact page.
           The real <select> stays in the form (hidden) so the value is still sent as "type". */
        var typeSelect = document.getElementById('fbType');
        if (typeSelect) {
            var typeLabel = form.querySelector('label[for="fbType"]');
            var typeDisplay = document.createElement('input');
            typeDisplay.type = 'text';
            typeDisplay.id = 'fbTypeDisplay';
            typeDisplay.className = 'clickable-input';
            typeDisplay.readOnly = true;
            typeDisplay.autocomplete = 'off';
            typeDisplay.setAttribute('aria-haspopup', 'dialog');
            typeDisplay.placeholder = 'Click this to select what it is about...';
            typeDisplay.style.cursor = 'pointer';

            function labelOf(value) {
                for (var i = 0; i < typeSelect.options.length; i++) {
                    if (typeSelect.options[i].value === value) { return typeSelect.options[i].text; }
                }
                return value;
            }
            typeDisplay.value = labelOf(typeSelect.value);

            typeSelect.style.display = 'none';
            typeSelect.setAttribute('aria-hidden', 'true');
            typeSelect.tabIndex = -1;
            typeSelect.parentNode.insertBefore(typeDisplay, typeSelect);
            if (typeLabel) { typeLabel.setAttribute('for', 'fbTypeDisplay'); }

            typeModal = document.createElement('div');
            typeModal.id = 'fbTypeModal';
            typeModal.className = 'custom-modal-overlay';
            typeModal.setAttribute('role', 'dialog');
            typeModal.setAttribute('aria-modal', 'true');
            typeModal.setAttribute('aria-labelledby', 'fbTypeTitle');

            var box = document.createElement('div');
            box.className = 'custom-modal-box';

            var title = document.createElement('h3');
            title.id = 'fbTypeTitle';
            title.style.color = 'var(--primary-color)';
            title.style.marginBottom = '10px';
            title.textContent = 'Select a Type of Feedback';

            var intro = document.createElement('p');
            intro.style.cssText = 'margin-bottom: 20px; font-size: 0.9rem; text-align: center;';
            intro.textContent = 'Please choose what your feedback is about:';

            var list = document.createElement('div');
            list.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';

            var optionButtons = [];
            for (var i = 0; i < typeSelect.options.length; i++) {
                (function (opt) {
                    var b = document.createElement('button');
                    b.type = 'button';
                    b.className = 'btn-submit';
                    b.setAttribute('data-type', opt.value);
                    b.textContent = opt.text;
                    b.addEventListener('click', function () {
                        typeSelect.value = opt.value;
                        typeDisplay.value = opt.text;
                        typeDisplay.classList.remove('input-error');
                        closeTypeModal();
                        typeDisplay.focus();
                    });
                    optionButtons.push(b);
                    list.appendChild(b);
                })(typeSelect.options[i]);
            }

            var cancel = document.createElement('button');
            cancel.type = 'button';
            cancel.className = 'btn-submit';
            cancel.style.cssText = 'background-color: var(--accent-color); margin-top: 15px;';
            cancel.textContent = 'Cancel';
            cancel.addEventListener('click', closeTypeModal);

            box.appendChild(title);
            box.appendChild(intro);
            box.appendChild(list);
            box.appendChild(cancel);
            typeModal.appendChild(box);
            document.body.appendChild(typeModal);

            typeModal.addEventListener('click', function (e) {
                if (e.target === typeModal) { closeTypeModal(); }
            });

            function openTypeModal() {
                /* the choice that is picked now shows in the forest green of the site */
                optionButtons.forEach(function (b) {
                    b.style.backgroundColor = (b.getAttribute('data-type') === typeSelect.value) ? 'var(--primary-color)' : '';
                });
                typeModal.style.display = 'flex';
                var current = optionButtons.filter(function (b) { return b.getAttribute('data-type') === typeSelect.value; })[0];
                (current || optionButtons[0]).focus();
            }

            typeDisplay.addEventListener('click', function (e) {
                e.preventDefault();
                openTypeModal();
            });
            typeDisplay.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault();
                    openTypeModal();
                }
            });
        }

        var btnHtml = btn ? btn.innerHTML : '';
        /* coming back with the browser's Back button must not leave the button stuck on "Sending..." */
        window.addEventListener('pageshow', function () {
            if (btn) { btn.disabled = false; btn.innerHTML = btnHtml; }
        });

        form.addEventListener('submit', function (e) {
            var text = msg ? msg.value.trim() : '';
            if (text.length < 10) {
                e.preventDefault();
                if (err) { err.textContent = 'Please write at least 10 characters so we can understand your feedback.'; }
                if (msg) { msg.focus(); }
                return;
            }
            if (err) { err.textContent = ''; }
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
            }
        });
    });
})();
