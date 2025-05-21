// Contact Form Handler
import { auth, db } from './js/auth.js';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

// DOM Elements
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

// FAQ Accordions
const faqItems = document.querySelectorAll('.faq-item');

// Initialize contact form
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const company = document.getElementById('company').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    const privacy = document.getElementById('privacy').checked;
    
    // Validation
    if (!privacy) {
      formMessage.className = 'form-message error';
      formMessage.textContent = 'You must agree to the Privacy Policy';
      return;
    }
    
    try {
      // Disable submit button
      const submitButton = contactForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
      
      // Clear any previous messages
      formMessage.className = 'form-message';
      formMessage.textContent = '';
      
      // Get user ID if authenticated
      let userId = null;
      if (auth.currentUser) {
        userId = auth.currentUser.uid;
      }
      
      // Add message to Firestore
      await addDoc(collection(db, "messages"), {
        name,
        email,
        phone,
        company,
        subject,
        message,
        userId,
        status: 'new',
        createdAt: Timestamp.now()
      });
      
      // Show success message
      formMessage.className = 'form-message success';
      formMessage.textContent = 'Your message has been sent successfully. We will get back to you soon.';
      
      // Reset form
      contactForm.reset();
      
      // Re-enable submit button
      submitButton.disabled = false;
      submitButton.textContent = 'Send Message';
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show error message
      formMessage.className = 'form-message error';
      formMessage.textContent = 'An error occurred while sending your message. Please try again.';
      
      // Re-enable submit button
      submitButton.disabled = false;
      submitButton.textContent = 'Send Message';
    }
  });
}

// Initialize FAQ accordions
if (faqItems.length > 0) {
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
      // Close other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
        }
      });
      
      // Toggle current item
      item.classList.toggle('active');
    });
  });
}