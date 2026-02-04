/**
 * Main Entry Point
 * Initializes all interactive components
 */

class Portfolio {
    constructor() {
        this.cursor = null;
        this.scrollReveal = null;
        this.imagePreview = null;

        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.initPageLoader();
        this.initCursor();
        this.initScrollReveal();
        this.initHeroReveals();
        this.initImagePreview();
    }

    // Page load transition
    initPageLoader() {
        const loader = document.querySelector('.page-loader');
        if (!loader) return;

        // Small delay to ensure CSS is loaded
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                loader.classList.add('is-loaded');

                // Remove loader from DOM after animation
                setTimeout(() => {
                    loader.remove();
                }, 1200);
            });
        });
    }

    // Custom cursor
    initCursor() {
        if (window.CustomCursor) {
            this.cursor = new CustomCursor();
        }
    }

    // Scroll reveal animations
    initScrollReveal() {
        if (window.ScrollReveal) {
            this.scrollReveal = new ScrollReveal({
                threshold: 0.15,
                rootMargin: '0px 0px -80px 0px'
            });
        }
    }

    // Hero text reveal animations on load
    initHeroReveals() {
        const revealElements = document.querySelectorAll('[data-reveal]');
        if (revealElements.length === 0) return;

        // Check for reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            revealElements.forEach(el => el.classList.add('is-revealed'));
            return;
        }

        // Stagger reveals
        revealElements.forEach((el, index) => {
            const delay = parseFloat(el.dataset.reveal) || (index * 0.12);

            setTimeout(() => {
                el.classList.add('is-revealed');
            }, delay * 1000 + 400); // 400ms initial delay for page load
        });
    }

    // Project image preview that follows cursor
    initImagePreview() {
        const projects = document.querySelectorAll('[data-preview]');
        if (projects.length === 0) return;

        // Create preview container
        this.imagePreview = document.createElement('div');
        this.imagePreview.className = 'project-preview';
        document.body.appendChild(this.imagePreview);

        // Create image element
        const img = document.createElement('img');
        this.imagePreview.appendChild(img);

        let currentProject = null;
        let mouseX = 0;
        let mouseY = 0;
        let previewX = 0;
        let previewY = 0;

        // Track mouse position
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Animate preview position
        const animatePreview = () => {
            if (currentProject) {
                // Lerp for smooth following
                previewX += (mouseX - previewX) * 0.1;
                previewY += (mouseY - previewY) * 0.1;

                // Offset from cursor
                const offsetX = 30;
                const offsetY = -30;

                // Keep preview in viewport
                const maxX = window.innerWidth - 380;
                const maxY = window.innerHeight - 250;
                const x = Math.min(Math.max(previewX + offsetX, 10), maxX);
                const y = Math.min(Math.max(previewY + offsetY, 10), maxY);

                this.imagePreview.style.left = `${x}px`;
                this.imagePreview.style.top = `${y}px`;
            }

            requestAnimationFrame(animatePreview);
        };

        animatePreview();

        // Bind hover events
        projects.forEach(project => {
            project.addEventListener('mouseenter', () => {
                const previewSrc = project.dataset.preview;
                if (previewSrc) {
                    img.src = previewSrc;
                    currentProject = project;

                    // Reset position immediately
                    previewX = mouseX;
                    previewY = mouseY;

                    // Small delay before showing
                    setTimeout(() => {
                        this.imagePreview.classList.add('is-visible');
                    }, 50);
                }
            });

            project.addEventListener('mouseleave', () => {
                currentProject = null;
                this.imagePreview.classList.remove('is-visible');
            });
        });
    }

    // Refresh all components (useful after dynamic content changes)
    refresh() {
        if (this.cursor) this.cursor.refresh();
        if (this.scrollReveal) this.scrollReveal.refresh();
    }
}

// Initialize
const portfolio = new Portfolio();
