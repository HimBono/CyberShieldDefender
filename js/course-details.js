// js/course-detail.js - Course Detail Page Functionality

// Course data (In production, this would come from Firebase)
const coursesData = {
    'phishing': {
        title: 'Phishing Awareness and Prevention',
        description: 'Learn to identify various types of phishing attempts and protect your organization from this common attack vector.',
        duration: '8 hours',
        level: 'Beginner',
        rating: '4.8',
        reviews: 35,
        videoUrl: 'https://www.example.com/videos/phishing-course.mp4', // Replace with actual video URL
        fullDescription: `
            <p>Phishing attacks are one of the most common and effective methods used by cybercriminals to steal sensitive information. This comprehensive course will teach you how to identify, prevent, and respond to phishing attempts.</p>
            
            <h3>What You'll Learn:</h3>
            <ul>
                <li>Understanding different types of phishing attacks (email, SMS, voice)</li>
                <li>Identifying red flags in suspicious communications</li>
                <li>Best practices for email security</li>
                <li>How to report and respond to phishing attempts</li>
                <li>Creating a phishing-aware culture in your organization</li>
            </ul>
            
            <h3>Course Requirements:</h3>
            <ul>
                <li>Basic computer skills</li>
                <li>Access to email</li>
                <li>No prior cybersecurity knowledge required</li>
            </ul>
        `
    },
    'password': {
        title: 'Password Security',
        description: 'Implement robust password policies and practices to safeguard your business accounts and sensitive information.',
        duration: '6 hours',
        level: 'Beginner',
        rating: '4.7',
        reviews: 28,
        videoUrl: 'https://www.example.com/videos/password-course.mp4',
        fullDescription: `
            <p>Strong password security is the foundation of protecting your digital assets. This course covers everything you need to know about creating, managing, and maintaining secure passwords.</p>
            
            <h3>What You'll Learn:</h3>
            <ul>
                <li>Creating strong, memorable passwords</li>
                <li>Understanding password managers</li>
                <li>Implementing two-factor authentication</li>
                <li>Password policies for organizations</li>
                <li>Common password attacks and how to prevent them</li>
            </ul>
        `
    },
    'essentials': {
        title: 'Cybersecurity Essentials for Small Businesses',
        description: 'An introductory course covering the fundamental cybersecurity concepts every small business should know.',
        duration: '5 hours',
        level: 'Beginner',
        rating: '4.9',
        reviews: 42,
        videoUrl: 'https://www.example.com/videos/essentials-course.mp4',
        fullDescription: `
            <p>Get started with cybersecurity fundamentals designed specifically for small and medium enterprises. This course provides a solid foundation for protecting your business.</p>
            
            <h3>What You'll Learn:</h3>
            <ul>
                <li>Basic cybersecurity concepts and terminology</li>
                <li>Common threats facing small businesses</li>
                <li>Essential security tools and technologies</li>
                <li>Creating a security-first culture</li>
                <li>Compliance and regulatory basics</li>
            </ul>
        `
    }
};

// DOM Elements
const courseTitle = document.getElementById('course-title');
const courseDescription = document.getElementById('course-description');
const courseDuration = document.getElementById('course-duration');
const courseLevel = document.getElementById('course-level');
const courseRating = document.getElementById('course-rating');
const courseFullDescription = document.getElementById('course-full-description');
const authNotice = document.getElementById('auth-notice');
const videoContent = document.getElementById('video-content');
const courseVideo = document.getElementById('course-video');
const courseProgress = document.getElementById('course-progress');
const progressPercentage = document.getElementById('progress-percentage');
const markCompleteBtn = document.getElementById('mark-complete');
const takeAssessmentBtn = document.getElementById('take-assessment');

// Get course ID from URL
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('id');

// Current user
let currentUser = null;
let courseProgressData = null;

// Initialize course detail page
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication state
    firebase.auth().onAuthStateChanged((user) => {
        currentUser = user;
        if (user) {
            authNotice.style.display = 'none';
            videoContent.style.display = 'block';
            loadUserProgress();
        } else {
            authNotice.style.display = 'block';
            videoContent.style.display = 'none';
        }
    });

    // Load course data
    loadCourseData();

    // Video event listeners
    if (courseVideo) {
        courseVideo.addEventListener('timeupdate', updateProgress);
        courseVideo.addEventListener('ended', onVideoComplete);
    }

    // Button event listeners
    if (markCompleteBtn) {
        markCompleteBtn.addEventListener('click', markCourseComplete);
    }

    if (takeAssessmentBtn) {
        takeAssessmentBtn.addEventListener('click', () => {
            window.location.href = `assessment.html?course=${courseId}`;
        });
    }
});

// Load course data
function loadCourseData() {
    const course = coursesData[courseId];
    
    if (!course) {
        // Course not found
        courseTitle.textContent = 'Course Not Found';
        courseDescription.textContent = 'The requested course could not be found.';
        return;
    }

    // Update page with course data
    courseTitle.textContent = course.title;
    courseDescription.textContent = course.description;
    courseDuration.textContent = course.duration;
    courseLevel.textContent = course.level;
    courseRating.textContent = course.rating;
    courseFullDescription.innerHTML = course.fullDescription;

    // Set video source
    if (courseVideo) {
        courseVideo.src = course.videoUrl;
    }
}

// Load user's progress for this course
async function loadUserProgress() {
    if (!currentUser || !courseId) return;

    try {
        const progressDoc = await firebase.firestore()
            .collection('users')
            .doc(currentUser.uid)
            .collection('courseProgress')
            .doc(courseId)
            .get();

        if (progressDoc.exists) {
            courseProgressData = progressDoc.data();
            updateProgressUI(courseProgressData.progress || 0);
            
            if (courseProgressData.completed) {
                markCompleteBtn.disabled = true;
                markCompleteBtn.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
                takeAssessmentBtn.disabled = false;
            }
        } else {
            // Create initial progress document
            courseProgressData = {
                courseId: courseId,
                progress: 0,
                completed: false,
                startedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await firebase.firestore()
                .collection('users')
                .doc(currentUser.uid)
                .collection('courseProgress')
                .doc(courseId)
                .set(courseProgressData);
        }
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

// Update progress as video plays
function updateProgress() {
    if (!courseVideo.duration) return;
    
    const progress = (courseVideo.currentTime / courseVideo.duration) * 100;
    updateProgressUI(progress);
    
    // Enable mark complete button when video is 90% complete
    if (progress >= 90 && !courseProgressData?.completed) {
        markCompleteBtn.disabled = false;
    }
    
    // Save progress every 10 seconds
    if (Math.floor(courseVideo.currentTime) % 10 === 0) {
        saveProgress(progress);
    }
}

// Update progress UI
function updateProgressUI(progress) {
    courseProgress.style.width = `${progress}%`;
    progressPercentage.textContent = `${Math.round(progress)}%`;
}

// Save progress to Firebase
async function saveProgress(progress) {
    if (!currentUser || !courseId) return;
    
    try {
        await firebase.firestore()
            .collection('users')
            .doc(currentUser.uid)
            .collection('courseProgress')
            .doc(courseId)
            .update({
                progress: progress,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
    } catch (error) {
        console.error('Error saving progress:', error);
    }
}

// Handle video completion
function onVideoComplete() {
    markCompleteBtn.disabled = false;
    saveProgress(100);
}

// Mark course as complete
async function markCourseComplete() {
    if (!currentUser || !courseId) return;
    
    try {
        // Update progress document
        await firebase.firestore()
            .collection('users')
            .doc(currentUser.uid)
            .collection('courseProgress')
            .doc(courseId)
            .update({
                completed: true,
                completedAt: firebase.firestore.FieldValue.serverTimestamp(),
                progress: 100
            });
        
        // Update UI
        markCompleteBtn.disabled = true;
        markCompleteBtn.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
        takeAssessmentBtn.disabled = false;
        updateProgressUI(100);
        
        // Show success message
        alert('Congratulations! You have completed this course. You can now take the assessment.');
    } catch (error) {
        console.error('Error marking course complete:', error);
        alert('Error marking course as complete. Please try again.');
    }
}