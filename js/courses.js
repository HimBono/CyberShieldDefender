// js/courses.js - Updated to make all courses free

// Update course prices to FREE
document.addEventListener('DOMContentLoaded', () => {
    // Update all course prices to FREE
    const coursePrices = document.querySelectorAll('.course-price');
    coursePrices.forEach(price => {
        price.textContent = 'FREE';
    });
    
    // Update bundle prices to FREE
    const bundlePrices = document.querySelectorAll('.bundle-price');
    bundlePrices.forEach(price => {
        price.textContent = 'FREE';
    });
    
    // Hide original prices
    const originalPrices = document.querySelectorAll('.original-price');
    originalPrices.forEach(price => {
        price.style.display = 'none';
    });
    
    // Update bundle badges
    const bundleBadges = document.querySelectorAll('.bundle-badge');
    bundleBadges.forEach(badge => {
        badge.textContent = 'FREE';
        badge.style.backgroundColor = 'var(--success)';
    });
});

// Course search functionality
const courseSearch = document.getElementById('course-search');
if (courseSearch) {
    courseSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const courseCards = document.querySelectorAll('.course-card');
        
        courseCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Category filtering
const categoryTabs = document.querySelectorAll('.category-tab');
categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Update active tab
        categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Filter courses
        const category = tab.getAttribute('data-category');
        const courseCards = document.querySelectorAll('#category-courses .course-card');
        
        courseCards.forEach(card => {
            const cardCategories = card.getAttribute('data-categories');
            
            if (category === 'all' || (cardCategories && cardCategories.includes(category))) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Testimonial slider
let currentSlide = 0;
const slides = document.querySelectorAll('.testimonial-slide');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.querySelector('.slider-prev');
const nextBtn = document.querySelector('.slider-next');

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlide = index;
}

if (slides.length > 0) {
    // Initialize first slide
    showSlide(0);
    
    // Previous button
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        });
    }
    
    // Next button
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        });
    }
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
        });
    });
    
    // Auto-play slider
    setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }, 5000);
}