// ===== DISCLAIMER MODAL =====
document.addEventListener('DOMContentLoaded', function() {
    // Get modal and button elements
    const modal = document.getElementById('disclaimer-modal');
    const acceptBtn = document.getElementById('accept-btn');
    
    // Show modal on page load
    modal.classList.remove('hidden');
    
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
    
    // Close modal when accept button is clicked
    acceptBtn.addEventListener('click', function() {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    });
    
    // Prevent closing modal by clicking outside
    modal.addEventListener('click', function(e) {
        // Only allow closing via the accept button
        if (e.target === modal) {
            // Do nothing - require explicit acceptance
        }
    });
});

// ===== MOBILE NAVIGATION TOGGLE =====
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const navMenu = mainNav.querySelector('.nav-menu');
    
    // Toggle mobile menu
    mobileMenuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close mobile menu when a nav link is clicked
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const isClickInsideNav = mainNav.contains(e.target) || mobileMenuToggle.contains(e.target);
        if (!isClickInsideNav && navMenu.classList.contains('active')) {
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
});

// ===== SMOOTH SCROLLING =====
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling to all links with hash
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Skip empty hash or just "#"
            if (targetId === '#' || targetId === '') {
                e.preventDefault();
                return;
            }
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                // Get header height for offset
                const header = document.querySelector('.site-header');
                const headerHeight = header ? header.offsetHeight : 0;
                
                // Calculate scroll position
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                
                // Smooth scroll to target
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// ===== ARCHIVE CATEGORY FILTER (VISUAL ONLY) =====
document.addEventListener('DOMContentLoaded', function() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryButtons.forEach(function(btn) {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // In a real implementation, this would filter the archive items
            // For this static version, we just change the active state
        });
    });
});

// ===== BREAKING NEWS TICKER ANIMATION =====
document.addEventListener('DOMContentLoaded', function() {
    const tickerContent = document.querySelector('.ticker-content');
    
    if (tickerContent) {
        // Clone the ticker content for seamless loop
        const tickerText = tickerContent.cloneNode(true);
        tickerContent.parentElement.appendChild(tickerText);
    }
});

// ===== SCROLL TO TOP FUNCTIONALITY (OPTIONAL) =====
document.addEventListener('DOMContentLoaded', function() {
    // Cache header element for better performance
    const header = document.querySelector('.site-header');
    let lastScrollTop = 0;
    let ticking = false;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        lastScrollTop = scrollTop;
        
        // Use requestAnimationFrame for better performance
        if (!ticking) {
            window.requestAnimationFrame(function() {
                // Use CSS class toggle instead of direct style manipulation
                if (lastScrollTop > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    });
});

// ===== IMAGE LOADING OPTIMIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Add loading attribute to images for better performance
    const images = document.querySelectorAll('img');
    images.forEach(function(img) {
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
    });
});

// ===== PRINT FRIENDLY STYLES =====
window.addEventListener('beforeprint', function() {
    // Close mobile menu before printing
    const navMenu = document.querySelector('.nav-menu');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    
    if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
    }
});

// ===== KEYBOARD ACCESSIBILITY =====
document.addEventListener('DOMContentLoaded', function() {
    // Close modal with Escape key (but require explicit acceptance)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('disclaimer-modal');
            const navMenu = document.querySelector('.nav-menu');
            const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
            
            // Close mobile menu with Escape
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            }
            
            // Note: We don't close the disclaimer modal with Escape
            // to ensure users explicitly accept the disclaimer
        }
    });
    
    // Trap focus in modal when open
    const modal = document.getElementById('disclaimer-modal');
    const acceptBtn = document.getElementById('accept-btn');
    
    modal.addEventListener('keydown', function(e) {
        if (!modal.classList.contains('hidden') && e.key === 'Tab') {
            // Keep focus on the accept button
            e.preventDefault();
            acceptBtn.focus();
        }
    });
});

// ===== CONSOLE MESSAGE =====
console.log('%c📰 The Daily Planet', 'font-size: 24px; font-weight: bold; color: #1e3a8a;');
console.log('%cA Great Metropolitan Newspaper', 'font-size: 14px; font-style: italic; color: #6b7280;');
console.log('%cThis is a parody website for entertainment purposes only.', 'font-size: 12px; color: #ef4444;');
