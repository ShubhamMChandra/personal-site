/**
 * Scroll Reveal System
 * Features: Intersection Observer, stagger support, parallax
 */

class ScrollReveal {
    constructor(options = {}) {
        this.options = {
            threshold: options.threshold || 0.1,
            rootMargin: options.rootMargin || '0px 0px -50px 0px',
            ...options
        };

        // Check for reduced motion preference
        this.prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;

        if (this.prefersReducedMotion) {
            this.showAllElements();
            return;
        }

        this.init();
    }

    init() {
        this.setupObserver();
        this.observeElements();
        this.setupParallax();
    }

    setupObserver() {
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            {
                threshold: this.options.threshold,
                rootMargin: this.options.rootMargin
            }
        );
    }

    observeElements() {
        // Regular scroll reveal elements
        const revealElements = document.querySelectorAll('[data-scroll-reveal]');
        revealElements.forEach(el => this.observer.observe(el));

        // Stagger containers
        const staggerElements = document.querySelectorAll('[data-scroll-stagger]');
        staggerElements.forEach(el => this.observer.observe(el));
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.scrollDelay || 0;

                setTimeout(() => {
                    entry.target.classList.add('is-visible');
                }, delay * 1000);

                // Unobserve after revealing (one-time animation)
                this.observer.unobserve(entry.target);
            }
        });
    }

    setupParallax() {
        this.parallaxElements = document.querySelectorAll('[data-parallax]');

        if (this.parallaxElements.length === 0) return;

        // Use passive scroll listener for performance
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateParallax();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    updateParallax() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        this.parallaxElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const speed = parseFloat(el.dataset.parallax) || 0.1;

            // Only apply parallax when element is in view
            if (rect.top < windowHeight && rect.bottom > 0) {
                const yPos = (rect.top - windowHeight / 2) * speed;
                el.style.transform = `translateY(${yPos}px)`;
            }
        });
    }

    showAllElements() {
        // For reduced motion: show all elements immediately
        const elements = document.querySelectorAll(
            '[data-scroll-reveal], [data-scroll-stagger]'
        );
        elements.forEach(el => el.classList.add('is-visible'));
    }

    // Refresh observer (useful after DOM changes)
    refresh() {
        this.observeElements();
    }
}

// Export for use in main.js
window.ScrollReveal = ScrollReveal;
