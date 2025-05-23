// js/admin-courses.js - Admin Course Management

// Course management functions for admin panel
let editingCourseId = null;

// Add course section to admin panel
function initializeCourseManagement() {
    // Add courses section to admin nav
    const adminNav = document.querySelector('.admin-nav ul');
    if (adminNav && !document.querySelector('a[href="#courses-section"]')) {
        const coursesNavItem = document.createElement('li');
        coursesNavItem.innerHTML = `
            <a href="#courses-section">
                <i class="fas fa-book"></i>
                <span>Courses</span>
            </a>
        `;
        adminNav.insertBefore(coursesNavItem, adminNav.querySelector('a[href="#settings-section"]').parentElement);
    }

    // Add courses section to admin content
    const adminContent = document.querySelector('.admin-content');
    if (adminContent && !document.getElementById('courses-section')) {
        const coursesSection = createCoursesSection();
        adminContent.insertBefore(coursesSection, document.getElementById('messages-section'));
    }

    // Initialize course management
    loadCourses();
    setupCourseEventListeners();
}

// Create courses section HTML
function createCoursesSection() {
    const section = document.createElement('section');
    section.id = 'courses-section';
    section.className = 'admin-section';
    section.innerHTML = `
        <div class="section-header">
            <h2>Courses</h2>
            <div class="section-actions">
                <button class="btn btn-primary" onclick="showAddCourseModal()">
                    <i class="fas fa-plus"></i> Add Course
                </button>
            </div>
        </div>
        <div class="table-container">
            <table class="data-table" id="courses-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Duration</th>
                        <th>Level</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Courses will be populated here -->
                </tbody>
            </table>
            <div id="courses-loading" class="loading-indicator">
                <div class="spinner"></div>
                <p>Loading courses...</p>
            </div>
            <div id="courses-error" class="error-message" style="display: none;"></div>
        </div>
    `;
    return section;
}

// Course modal HTML
function createCourseModal() {
    const modal = document.createElement('div');
    modal.id = 'course-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="course-modal-title">Add New Course</h3>
                <button class="close-modal" onclick="closeCourseModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="course-form">
                    <div class="form-group">
                        <label for="course-title">Course Title *</label>
                        <input type="text" id="course-title" name="title" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="course-description">Description *</label>
                        <textarea id="course-description" name="description" rows="3" required></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="course-category">Category *</label>
                            <select id="course-category" name="category" required>
                                <option value="">Select Category</option>
                                <option value="security-fundamentals">Security Fundamentals</option>
                                <option value="threat-protection">Threat Protection</option>
                                <option value="compliance">Compliance</option>
                                <option value="incident-response">Incident Response</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="course-level">Level *</label>
                            <select id="course-level" name="level" required>
                                <option value="">Select Level</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="course-duration">Duration *</label>
                            <input type="text" id="course-duration" name="duration" placeholder="e.g., 8 hours" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="course-price">Price (RM)</label>
                            <input type="number" id="course-price" name="price" value="0" min="0" disabled>
                            <small>All courses are currently free</small>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="course-video-url">Video URL *</label>
                        <input type="url" id="course-video-url" name="videoUrl" placeholder="https://example.com/video.mp4" required>
                        <small>Enter the URL of the course video</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="course-full-description">Full Description</label>
                        <textarea id="course-full-description" name="fullDescription" rows="6" placeholder="Detailed course description..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="course-status">Status</label>
                        <select id="course-status" name="status">
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" onclick="closeCourseModal()">Cancel</button>
                <button type="submit" form="course-form" class="btn btn-primary">Save Course</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Load courses
async function loadCourses() {
    const coursesTable = document.getElementById('courses-table');
    const coursesLoading = document.getElementById('courses-loading');
    const coursesError = document.getElementById('courses-error');
    
    if (!coursesTable) return;
    
    try {
        coursesLoading.style.display = 'flex';
        coursesError.style.display = 'none';
        
        const coursesSnapshot = await firebase.firestore()
            .collection('courses')
            .orderBy('createdAt', 'desc')
            .get();
        
        coursesLoading.style.display = 'none';
        
        let html = '';
        if (coursesSnapshot.empty) {
            html = '<tr><td colspan="6" class="text-center">No courses found</td></tr>';
        } else {
            coursesSnapshot.forEach((doc) => {
                const course = doc.data();
                const courseId = doc.id;
                
                const statusClass = course.status === 'active' ? 'success' : 
                                  course.status === 'draft' ? 'warning' : 'secondary';
                
                html += `
                    <tr>
                        <td>${course.title}</td>
                        <td>${course.category || 'N/A'}</td>
                        <td>${course.duration}</td>
                        <td>${course.level}</td>
                        <td><span class="badge ${statusClass}">${course.status || 'Active'}</span></td>
                        <td>
                            <div class="table-actions">
                                <button class="edit-course" data-id="${courseId}" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="delete-course" data-id="${courseId}" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }
        
        coursesTable.querySelector('tbody').innerHTML = html;
        
        // Add event listeners
        setupCourseActionListeners();
        
    } catch (error) {
        console.error('Error loading courses:', error);
        coursesLoading.style.display = 'none';
        coursesError.style.display = 'block';
        coursesError.textContent = 'Error loading courses. Please try again.';
    }
}

// Setup course event listeners
function setupCourseEventListeners() {
    // Create modal if it doesn't exist
    if (!document.getElementById('course-modal')) {
        createCourseModal();
    }
    
    // Form submission
    const courseForm = document.getElementById('course-form');
    if (courseForm) {
        courseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveCourse();
        });
    }
}

// Setup action listeners for course buttons
function setupCourseActionListeners() {
    // Edit course buttons
    document.querySelectorAll('.edit-course').forEach(button => {
        button.addEventListener('click', async () => {
            const courseId = button.getAttribute('data-id');
            await showEditCourseModal(courseId);
        });
    });
    
    // Delete course buttons
    document.querySelectorAll('.delete-course').forEach(button => {
        button.addEventListener('click', async () => {
            const courseId = button.getAttribute('data-id');
            await deleteCourse(courseId);
        });
    });
}

// Show add course modal
function showAddCourseModal() {
    editingCourseId = null;
    const modal = document.getElementById('course-modal');
    const modalTitle = document.getElementById('course-modal-title');
    const form = document.getElementById('course-form');
    
    modalTitle.textContent = 'Add New Course';
    form.reset();
    modal.classList.add('active');
}

// Show edit course modal
async function showEditCourseModal(courseId) {
    editingCourseId = courseId;
    const modal = document.getElementById('course-modal');
    const modalTitle = document.getElementById('course-modal-title');
    const form = document.getElementById('course-form');
    
    modalTitle.textContent = 'Edit Course';
    
    try {
        const courseDoc = await firebase.firestore()
            .collection('courses')
            .doc(courseId)
            .get();
        
        if (courseDoc.exists) {
            const course = courseDoc.data();
            
            // Fill form with course data
            document.getElementById('course-title').value = course.title || '';
            document.getElementById('course-description').value = course.description || '';
            document.getElementById('course-category').value = course.category || '';
            document.getElementById('course-level').value = course.level || '';
            document.getElementById('course-duration').value = course.duration || '';
            document.getElementById('course-price').value = course.price || 0;
            document.getElementById('course-video-url').value = course.videoUrl || '';
            document.getElementById('course-full-description').value = course.fullDescription || '';
            document.getElementById('course-status').value = course.status || 'active';
            
            modal.classList.add('active');
        }
    } catch (error) {
        console.error('Error loading course:', error);
        alert('Error loading course data');
    }
}

// Close course modal
function closeCourseModal() {
    const modal = document.getElementById('course-modal');
    modal.classList.remove('active');
    editingCourseId = null;
}

// Save course
async function saveCourse() {
    const form = document.getElementById('course-form');
    const formData = new FormData(form);
    
    const courseData = {
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        level: formData.get('level'),
        duration: formData.get('duration'),
        price: 0, // All courses are free
        videoUrl: formData.get('videoUrl'),
        fullDescription: formData.get('fullDescription'),
        status: formData.get('status'),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        if (editingCourseId) {
            // Update existing course
            await firebase.firestore()
                .collection('courses')
                .doc(editingCourseId)
                .update(courseData);
            
            alert('Course updated successfully!');
        } else {
            // Add new course
            courseData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            
            await firebase.firestore()
                .collection('courses')
                .add(courseData);
            
            alert('Course added successfully!');
        }
        
        closeCourseModal();
        loadCourses();
        
    } catch (error) {
        console.error('Error saving course:', error);
        alert('Error saving course. Please try again.');
    }
}

// Delete course
async function deleteCourse(courseId) {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
        return;
    }
    
    try {
        await firebase.firestore()
            .collection('courses')
            .doc(courseId)
            .delete();
        
        alert('Course deleted successfully!');
        loadCourses();
        
    } catch (error) {
        console.error('Error deleting course:', error);
        alert('Error deleting course. Please try again.');
    }
}

// Initialize course management when admin page loads
if (window.location.pathname.includes('admin.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for Firebase to initialize
        setTimeout(initializeCourseManagement, 1000);
    });
}

// Make functions available globally
window.showAddCourseModal = showAddCourseModal;
window.closeCourseModal = closeCourseModal;