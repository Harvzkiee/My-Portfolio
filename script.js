// --- Responsive Navigation Toggle ---
const menuIcon = document.querySelector('#menu-icon');
const navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
};

// --- Active Scroll Link Indicator Logic ---
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    sections.forEach(sec => {
        const top = window.scrollY;
        const offset = sec.offsetTop - 150;
        const height = sec.offsetHeight;
        const id = sec.getAttribute('id');

        if(top >= offset && top < offset + height) {
            navLinks.forEach(links => {
                links.classList.remove('active');
                document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
            });
        }
    });

    // Close menu when links are clicked (Mobile view adjustment)
    menuIcon.classList.remove('bx-x');
    navbar.classList.remove('active');
};

// --- Form Interception Handler ---
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Placeholder deployment for custom mail handling
        alert('Thank you for reaching out! This message system is currently handling sample input. Please connect directly via my listed email address.');
        contactForm.reset();
    });
}

// --- Certificate modal preview (inline) ---
document.addEventListener('DOMContentLoaded', () => {
    const certLinks = document.querySelectorAll('.cert-link');
    const projectLinks = document.querySelectorAll('.project-link');
    const certModal = document.getElementById('cert-modal');
    const certModalTitle = document.getElementById('cert-modal-title');
    const certModalDesc = document.getElementById('cert-modal-desc');
    const certModalEmbed = document.getElementById('cert-modal-embed');
    const certModalClose = document.getElementById('cert-modal-close');

    function openCertModal(title, desc, embedHtml) {
        if (!certModal) return;
        certModalTitle.textContent = title;
        certModalDesc.textContent = desc;
        certModalEmbed.innerHTML = embedHtml || '<p style="color:var(--text-muted);">No preview available. You can replace this with an image or an embedded PDF.</p>';
        certModal.setAttribute('aria-hidden', 'false');
    }

    function closeCertModal() {
        if (!certModal) return;
        certModal.setAttribute('aria-hidden', 'true');
        certModalEmbed.innerHTML = '';
    }

    certLinks.forEach(link => {
        // read title/desc from children
        const card = link.querySelector('.cert-card');
        const title = card.querySelector('h3')?.textContent || 'Certificate';
        const desc = card.querySelector('p')?.textContent || '';

        link.addEventListener('click', (e) => {
            e.preventDefault(); // prevent navigating away
            // First, if the anchor's href points to a real file (not '#'), try to use it directly.
            const linkHref = link.getAttribute('href');
            const exts = ['pdf','png','jpg','jpeg','webp'];

            async function tryUseUrl(url) {
                const lower = url.split('?')[0].toLowerCase();
                const ext = lower.split('.').pop();
                if (ext === 'pdf') {
                    const iframe = `<iframe src="${encodeURI(url)}" style="height:70vh;border:0;width:100%"></iframe>`;
                    openCertModal(title, desc, iframe);
                    return true;
                }
                if (['png','jpg','jpeg','webp'].includes(ext)) {
                    // try loading image
                    try {
                        const img = new Image();
                        img.src = url;
                        await new Promise((resolve, reject) => {
                            img.onload = () => resolve(true);
                            img.onerror = () => reject(false);
                        });
                        const imgHtml = `<img src="${encodeURI(url)}" alt="${title} certificate">`;
                        openCertModal(title, desc, imgHtml);
                        return true;
                    } catch (err) {
                        return false;
                    }
                }
                return false;
            }

            (async function tryEmbed() {
                if (linkHref && linkHref !== '#') {
                    // try the provided href first (handle spaces by encoding)
                    const encoded = encodeURI(linkHref);
                    try {
                        const ok = await tryUseUrl(encoded);
                        if (ok) return;
                    } catch (err) {
                        // fall through to slug search
                    }
                }

                // Fallback: try to find files in certs/assets by slug built from title
                const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                for (const ext of exts) {
                    const url = `certs/assets/${slug}.${ext}`;
                    try {
                        const ok = await tryUseUrl(url);
                        if (ok) return;
                    } catch (err) {
                        // continue
                    }
                }

                // nothing found — fallback to description only
                openCertModal(title, desc);
            })();
        });
    });

    if (certModal) {
        certModalClose.addEventListener('click', closeCertModal);
        certModal.addEventListener('click', (e) => {
            if (e.target === certModal) closeCertModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && certModal.getAttribute('aria-hidden') === 'false') closeCertModal();
        });
    }

    // Project video modal handler (reuse certificate modal)
    projectLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            const title = link.closest('.project-info')?.querySelector('h3')?.textContent || 'Project Video';
            const desc = link.closest('.project-info')?.querySelector('p')?.textContent || '';
            // create video element
            const videoHtml = `<video controls style="width:100%;height:auto;max-height:70vh">
                <source src="${encodeURI(href)}" type="video/mp4/mov">
                Your browser does not support the video tag.
            </video>`;
            openCertModal(title, desc, videoHtml);
        });
    });
});

// --- Fix anchor offset for fixed header ---
function updateSectionScrollMargin() {
    const header = document.querySelector('.header');
    const headerHeight = header ? header.offsetHeight : 0;
    const sections = document.querySelectorAll('section');
    sections.forEach(sec => {
        sec.style.scrollMarginTop = (headerHeight + 16) + 'px'; // 16px extra gap
    });
}

// Run on load and resize
window.addEventListener('load', updateSectionScrollMargin);
window.addEventListener('resize', updateSectionScrollMargin);
// Also run when menu toggles (header height may change on mobile)
const observer = new MutationObserver(updateSectionScrollMargin);
const headerEl = document.querySelector('.header');
if (headerEl) observer.observe(headerEl, { attributes: true, childList: false, subtree: false });

// initial call
updateSectionScrollMargin();

// Intercept header nav clicks to ensure accurate scroll position below fixed header
const headerNavLinks = document.querySelectorAll('header nav a[href^="#"]');
headerNavLinks.forEach(a => {
    a.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const header = document.querySelector('.header');
            const headerHeight = header ? header.offsetHeight : 0;
            const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12; // small gap
            window.scrollTo({ top, behavior: 'smooth' });
            // update URL without jumping
            history.pushState(null, '', href);
        }
    });
});

// If page loaded with a hash, scroll to it correctly after load
window.addEventListener('load', () => {
    if (location.hash) {
        const target = document.querySelector(location.hash);
        if (target) {
            const header = document.querySelector('.header');
            const headerHeight = header ? header.offsetHeight : 0;
            const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
            window.scrollTo({ top, behavior: 'instant' });
        }
    }
});