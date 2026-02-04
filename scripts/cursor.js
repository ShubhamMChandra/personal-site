/**
 * Custom Cursor System
 * Features: Smooth lerp following, context-aware states
 */

class CustomCursor {
    constructor() {
        // Check if touch device
        if (this.isTouchDevice()) return;

        this.cursor = null;
        this.ring = null;
        this.text = null;

        this.mouse = { x: 0, y: 0 };
        this.cursorPos = { x: 0, y: 0 };
        this.ringPos = { x: 0, y: 0 };

        this.lerp = {
            cursor: 0.2,
            ring: 0.08
        };

        this.state = 'default';
        this.isVisible = false;

        this.init();
    }

    isTouchDevice() {
        return (
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            window.matchMedia('(hover: none)').matches
        );
    }

    init() {
        this.createElements();
        this.bindEvents();
        this.animate();
    }

    createElements() {
        // Cursor dot
        this.cursor = document.createElement('div');
        this.cursor.className = 'cursor';
        document.body.appendChild(this.cursor);

        // Cursor ring
        this.ring = document.createElement('div');
        this.ring.className = 'cursor-ring';
        document.body.appendChild(this.ring);

        // Cursor text (for "View" label on projects)
        this.text = document.createElement('div');
        this.text.className = 'cursor-text';
        this.text.textContent = 'View';
        document.body.appendChild(this.text);
    }

    bindEvents() {
        // Track mouse position
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;

            if (!this.isVisible) {
                this.isVisible = true;
                this.cursorPos = { ...this.mouse };
                this.ringPos = { ...this.mouse };
            }
        });

        // Hide on mouse leave
        document.addEventListener('mouseleave', () => {
            this.cursor.classList.add('is-hidden');
            this.ring.classList.add('is-hidden');
        });

        // Show on mouse enter
        document.addEventListener('mouseenter', () => {
            this.cursor.classList.remove('is-hidden');
            this.ring.classList.remove('is-hidden');
        });

        // Interactive elements
        this.bindInteractiveElements();
    }

    bindInteractiveElements() {
        // Links and buttons - hover state
        const hoverElements = document.querySelectorAll('a, button, [data-cursor="hover"]');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => this.setState('hover'));
            el.addEventListener('mouseleave', () => this.setState('default'));
        });

        // Projects - project state with "View" text
        const projectElements = document.querySelectorAll('.project, .project-card, [data-cursor="project"]');
        projectElements.forEach(el => {
            el.addEventListener('mouseenter', () => this.setState('project'));
            el.addEventListener('mouseleave', () => this.setState('default'));
        });

        // Text elements - text cursor state
        const textElements = document.querySelectorAll('p, .about-lead, [data-cursor="text"]');
        textElements.forEach(el => {
            el.addEventListener('mouseenter', () => this.setState('text'));
            el.addEventListener('mouseleave', () => this.setState('default'));
        });
    }

    setState(state) {
        this.state = state;

        // Remove all states
        this.cursor.classList.remove('is-hovering', 'is-project', 'is-text');
        this.ring.classList.remove('is-hovering', 'is-project', 'is-text');
        this.text.classList.remove('is-visible');

        // Apply new state
        switch(state) {
            case 'hover':
                this.cursor.classList.add('is-hovering');
                this.ring.classList.add('is-hovering');
                break;
            case 'project':
                this.cursor.classList.add('is-project');
                this.ring.classList.add('is-project');
                this.text.classList.add('is-visible');
                break;
            case 'text':
                this.cursor.classList.add('is-text');
                this.ring.classList.add('is-text');
                break;
        }
    }

    animate() {
        // Lerp cursor position
        this.cursorPos.x += (this.mouse.x - this.cursorPos.x) * this.lerp.cursor;
        this.cursorPos.y += (this.mouse.y - this.cursorPos.y) * this.lerp.cursor;

        // Lerp ring position (slower for trailing effect)
        this.ringPos.x += (this.mouse.x - this.ringPos.x) * this.lerp.ring;
        this.ringPos.y += (this.mouse.y - this.ringPos.y) * this.lerp.ring;

        // Apply positions
        this.cursor.style.left = `${this.cursorPos.x}px`;
        this.cursor.style.top = `${this.cursorPos.y}px`;

        this.ring.style.left = `${this.ringPos.x}px`;
        this.ring.style.top = `${this.ringPos.y}px`;

        // Text follows cursor with offset
        this.text.style.left = `${this.cursorPos.x + 30}px`;
        this.text.style.top = `${this.cursorPos.y + 30}px`;

        requestAnimationFrame(() => this.animate());
    }

    // Re-bind interactive elements (useful after DOM changes)
    refresh() {
        this.bindInteractiveElements();
    }
}

// Export for use in main.js
window.CustomCursor = CustomCursor;
