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
                        { value: 'yes', label: 'Yes, documented and regularly reviewed' },
                        { value: 'partial', label: 'Yes, but not regularly reviewed' },
                        { value: 'no', label: 'No formal process' }
                    ]
                },
                {
                    id: 'ac-2',
                    text: 'Do you use multi-factor authentication (MFA) for accessing sensitive systems?',
                    options: [
                        { value: 'yes', label: 'Yes, for all sensitive systems' },
                        { value: 'partial', label: 'Yes, but only for some systems' },
                        { value: 'no', label: 'No MFA implementation' }
                    ]
                },
                {
                    id: 'ac-3',
                    text: 'Do you have a process for revoking access when employees leave?',
                    options: [
                        { value: 'yes', label: 'Yes, immediate and documented' },
                        { value: 'partial', label: 'Yes, but not always immediate' },
                        { value: 'no', label: 'No formal process' }
                    ]
                },
                {
                    id: 'ac-4',
                    text: 'Do you regularly review and update user access privileges?',
                    options: [
                        { value: 'yes', label: 'Yes, quarterly or more frequently' },
                        { value: 'partial', label: 'Yes, but less frequently' },
                        { value: 'no', label: 'No regular review' }
                    ]
                },
                {
                    id: 'ac-5',
                    text: 'Do you have a password policy that enforces strong passwords?',
                    options: [
                        { value: 'yes', label: 'Yes, with regular changes required' },
                        { value: 'partial', label: 'Yes, but not strictly enforced' },
                        { value: 'no', label: 'No password policy' }
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
                        { value: 'yes', label: 'Yes, enterprise-grade solution' },
                        { value: 'partial', label: 'Yes, basic filtering' },
                        { value: 'no', label: 'No filtering' }
                    ]
                },
                {
                    id: 'es-2',
                    text: 'Do you provide regular phishing awareness training?',
                    options: [
                        { value: 'yes', label: 'Yes, quarterly or more frequently' },
                        { value: 'partial', label: 'Yes, but less frequently' },
                        { value: 'no', label: 'No training' }
                    ]
                },
                {
                    id: 'es-3',
                    text: 'Do you have a process for reporting suspicious emails?',
                    options: [
                        { value: 'yes', label: 'Yes, with clear reporting channels' },
                        { value: 'partial', label: 'Yes, but not well communicated' },
                        { value: 'no', label: 'No process' }
                    ]
                },
                {
                    id: 'es-4',
                    text: 'Do you use email encryption for sensitive information?',
                    options: [
                        { value: 'yes', label: 'Yes, for all sensitive communications' },
                        { value: 'partial', label: 'Yes, but not consistently' },
                        { value: 'no', label: 'No encryption' }
                    ]
                },
                {
                    id: 'es-5',
                    text: 'Do you have email backup and archiving solutions?',
                    options: [
                        { value: 'yes', label: 'Yes, with retention policies' },
                        { value: 'partial', label: 'Yes, but no formal policies' },
                        { value: 'no', label: 'No backup solution' }
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

// Initialize assessment
function initAssessment() {
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
                            ${answers[question.id] === option.value ? 'checked' : ''}>
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
            answers[question.id] = e.target.value;
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

// Submit assessment
async function submitAssessment(e) {
    e.preventDefault();
    
    const user = firebase.auth().currentUser;
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        // Save assessment results to Firestore
        await firebase.firestore().collection('assessments').add({
            userId: user.uid,
            answers: answers,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Redirect to results page
        window.location.href = 'assessment-results.html';
    } catch (error) {
        console.error('Error submitting assessment:', error);
        alert('There was an error submitting your assessment. Please try again.');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAssessment); 