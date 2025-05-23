// js/assessment.js - Updated with certificate generation

// Assessment questions and categories
const assessmentData = {
    categories: [
        {
            id: 'access-control',
            name: 'Access Control',
            questions: [
                {
                    id: 'ac-1',
                    text: 'Do you have a formal process for managing user access to systems and data?',
                    options: [
                        { value: 'yes', label: 'Yes, documented and regularly reviewed', points: 10 },
                        { value: 'partial', label: 'Yes, but not regularly reviewed', points: 5 },
                        { value: 'no', label: 'No formal process', points: 0 }
                    ]
                },
                {
                    id: 'ac-2',
                    text: 'Do you use multi-factor authentication (MFA) for accessing sensitive systems?',
                    options: [
                        { value: 'yes', label: 'Yes, for all sensitive systems', points: 10 },
                        { value: 'partial', label: 'Yes, but only for some systems', points: 5 },
                        { value: 'no', label: 'No MFA implementation', points: 0 }
                    ]
                },
                {
                    id: 'ac-3',
                    text: 'Do you have a process for revoking access when employees leave?',
                    options: [
                        { value: 'yes', label: 'Yes, immediate and documented', points: 10 },
                        { value: 'partial', label: 'Yes, but not always immediate', points: 5 },
                        { value: 'no', label: 'No formal process', points: 0 }
                    ]
                },
                {
                    id: 'ac-4',
                    text: 'Do you regularly review and update user access privileges?',
                    options: [
                        { value: 'yes', label: 'Yes, quarterly or more frequently', points: 10 },
                        { value: 'partial', label: 'Yes, but less frequently', points: 5 },
                        { value: 'no', label: 'No regular review', points: 0 }
                    ]
                },
                {
                    id: 'ac-5',
                    text: 'Do you have a password policy that enforces strong passwords?',
                    options: [
                        { value: 'yes', label: 'Yes, with regular changes required', points: 10 },
                        { value: 'partial', label: 'Yes, but not strictly enforced', points: 5 },
                        { value: 'no', label: 'No password policy', points: 0 }
                    ]
                }
            ]
        },
        {
            id: 'email-security',
            name: 'Email Security',
            questions: [
                {
                    id: 'es-1',
                    text: 'Do you have email filtering for spam and malicious content?',
                    options: [
                        { value: 'yes', label: 'Yes, enterprise-grade solution', points: 10 },
                        { value: 'partial', label: 'Yes, basic filtering', points: 5 },
                        { value: 'no', label: 'No filtering', points: 0 }
                    ]
                },
                {
                    id: 'es-2',
                    text: 'Do you provide regular phishing awareness training?',
                    options: [
                        { value: 'yes', label: 'Yes, quarterly or more frequently', points: 10 },
                        { value: 'partial', label: 'Yes, but less frequently', points: 5 },
                        { value: 'no', label: 'No training', points: 0 }
                    ]
                },
                {
                    id: 'es-3',
                    text: 'Do you have a process for reporting suspicious emails?',
                    options: [
                        { value: 'yes', label: 'Yes, with clear reporting channels', points: 10 },
                        { value: 'partial', label: 'Yes, but not well communicated', points: 5 },
                        { value: 'no', label: 'No process', points: 0 }
                    ]
                },
                {
                    id: 'es-4',
                    text: 'Do you use email encryption for sensitive information?',
                    options: [
                        { value: 'yes', label: 'Yes, for all sensitive communications', points: 10 },
                        { value: 'partial', label: 'Yes, but not consistently', points: 5 },
                        { value: 'no', label: 'No encryption', points: 0 }
                    ]
                },
                {
                    id: 'es-5',
                    text: 'Do you have email backup and archiving solutions?',
                    options: [
                        { value: 'yes', label: 'Yes, with retention policies', points: 10 },
                        { value: 'partial', label: 'Yes, but no formal policies', points: 5 },
                        { value: 'no', label: 'No backup solution', points: 0 }
                    ]
                }
            ]
        }
    ]
};

// DOM Elements
const assessmentForm = document.getElementById('assessment-form');
const questionContainer = document.getElementById('question-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const progressBar = document.getElementById('assessment-progress-bar');
const currentSection = document.getElementById('current-section');
const progressCounter = document.getElementById('progress-counter');
const startAssessmentBtn = document.getElementById('start-assessment-btn');
const authNotice = document.getElementById('auth-notice');
const assessmentFormContainer = document.getElementById('assessment-form-container');

// State variables
let currentCategoryIndex = 0;
let currentQuestionIndex = 0;
let answers = {};
let courseId = null;

// Initialize assessment
function initAssessment() {
    // Get course ID from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    courseId = urlParams.get('course');

    // Check if user is logged in
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            authNotice.style.display = 'none';
            assessmentFormContainer.style.display = 'block';
        } else {
            authNotice.style.display = 'block';
            assessmentFormContainer.style.display = 'none';
        }
    });

    // Start assessment button click handler
    startAssessmentBtn.addEventListener('click', () => {
        if (firebase.auth().currentUser) {
            authNotice.style.display = 'none';
            assessmentFormContainer.style.display = 'block';
            showCurrentQuestion();
        } else {
            window.location.href = 'login.html';
        }
    });

    // Navigation button handlers
    prevBtn.addEventListener('click', showPreviousQuestion);
    nextBtn.addEventListener('click', showNextQuestion);
    submitBtn.addEventListener('click', submitAssessment);
}

// Show current question
function showCurrentQuestion() {
    const category = assessmentData.categories[currentCategoryIndex];
    const question = category.questions[currentQuestionIndex];
    
    // Update progress
    const totalQuestions = assessmentData.categories.reduce((sum, cat) => sum + cat.questions.length, 0);
    const currentQuestionNumber = currentCategoryIndex * 5 + currentQuestionIndex + 1;
    const progress = (currentQuestionNumber / totalQuestions) * 100;
    
    progressBar.style.width = `${progress}%`;
    currentSection.textContent = `Section ${currentCategoryIndex + 1}: ${category.name}`;
    progressCounter.textContent = `Question ${currentQuestionNumber} of ${totalQuestions}`;
    
    // Update navigation buttons
    prevBtn.disabled = currentQuestionIndex === 0 && currentCategoryIndex === 0;
    nextBtn.style.display = currentQuestionNumber === totalQuestions ? 'none' : 'block';
    submitBtn.style.display = currentQuestionNumber === totalQuestions ? 'block' : 'none';
    
    // Create question HTML
    const questionHTML = `
        <div class="question" data-question-id="${question.id}">
            <h3>${question.text}</h3>
            <div class="options">
                ${question.options.map(option => `
                    <label class="option">
                        <input type="radio" name="${question.id}" value="${option.value}" 
                            data-points="${option.points}"
                            ${answers[question.id]?.value === option.value ? 'checked' : ''}>
                        <span>${option.label}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `;
    
    questionContainer.innerHTML = questionHTML;
    
    // Add event listeners to radio buttons
    const radioButtons = questionContainer.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', (e) => {
            answers[question.id] = {
                value: e.target.value,
                points: parseInt(e.target.getAttribute('data-points'))
            };
        });
    });
}

// Show previous question
function showPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
    } else if (currentCategoryIndex > 0) {
        currentCategoryIndex--;
        currentQuestionIndex = assessmentData.categories[currentCategoryIndex].questions.length - 1;
    }
    showCurrentQuestion();
}

// Show next question
function showNextQuestion() {
    const currentCategory = assessmentData.categories[currentCategoryIndex];
    if (currentQuestionIndex < currentCategory.questions.length - 1) {
        currentQuestionIndex++;
    } else if (currentCategoryIndex < assessmentData.categories.length - 1) {
        currentCategoryIndex++;
        currentQuestionIndex = 0;
    }
    showCurrentQuestion();
}

// Calculate score
function calculateScore() {
    let totalScore = 0;
    let maxScore = 0;
    
    assessmentData.categories.forEach(category => {
        category.questions.forEach(question => {
            maxScore += 10; // Each question has max 10 points
            if (answers[question.id]) {
                totalScore += answers[question.id].points;
            }
        });
    });
    
    return {
        score: totalScore,
        maxScore: maxScore,
        percentage: Math.round((totalScore / maxScore) * 100)
    };
}

// Submit assessment
async function submitAssessment(e) {
    e.preventDefault();
    
    const user = firebase.auth().currentUser;
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Check if all questions are answered
    const totalQuestions = assessmentData.categories.reduce((sum, cat) => sum + cat.questions.length, 0);
    if (Object.keys(answers).length < totalQuestions) {
        alert('Please answer all questions before submitting.');
        return;
    }
    
    try {
        // Calculate score
        const result = calculateScore();
        
        // Get course name if course ID is provided
        let courseName = 'Cybersecurity Assessment';
        if (courseId) {
            const courseDoc = await firebase.firestore()
                .collection('courses')
                .doc(courseId)
                .get();
            
            if (courseDoc.exists) {
                courseName = courseDoc.data().title;
            }
        }
        
        // Save assessment results to Firestore
        const assessmentRef = await firebase.firestore().collection('assessments').add({
            userId: user.uid,
            courseId: courseId,
            courseName: courseName,
            answers: answers,
            score: result.percentage,
            totalScore: result.score,
            maxScore: result.maxScore,
            completedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Show success message and redirect to certificate
        alert(`Assessment completed! Your score: ${result.percentage}%`);
        
        // Redirect to certificate page
        window.location.href = `certificate.html?assessment=${assessmentRef.id}`;
        
    } catch (error) {
        console.error('Error submitting assessment:', error);
        alert('There was an error submitting your assessment. Please try again.');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAssessment);