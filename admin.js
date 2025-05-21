// Admin Panel Dashboard
import { auth, db } from './auth.js';
import { 
  collection, 
  query, 
  getDocs, 
  orderBy, 
  limit, 
  startAfter,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  where,
  Timestamp
} from 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
    // Your Firebase configuration will go here
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// DOM Elements
// User section
const usersTable = document.getElementById('users-table');
const usersLoading = document.getElementById('users-loading');
const usersError = document.getElementById('users-error');
const usersCurrentPage = document.getElementById('users-current-page');
const usersTotalPages = document.getElementById('users-total-pages');
const usersPrevButton = document.querySelector('#users-section .pagination-prev');
const usersNextButton = document.querySelector('#users-section .pagination-next');

// Assessment section
const assessmentsTable = document.getElementById('assessments-table');
const assessmentsLoading = document.getElementById('assessments-loading');
const assessmentsError = document.getElementById('assessments-error');
const assessmentsCurrentPage = document.getElementById('assessments-current-page');
const assessmentsTotalPages = document.getElementById('assessments-total-pages');
const assessmentsPrevButton = document.querySelector('#assessment-section .pagination-prev');
const assessmentsNextButton = document.querySelector('#assessment-section .pagination-next');

// Message section
const messagesTable = document.getElementById('messages-table');
const messagesLoading = document.getElementById('messages-loading');
const messagesError = document.getElementById('messages-error');
const messagesCurrentPage = document.getElementById('messages-current-page');
const messagesTotalPages = document.getElementById('messages-total-pages');
const messagesPrevButton = document.querySelector('#messages-section .pagination-prev');
const messagesNextButton = document.querySelector('#messages-section .pagination-next');

// Message modal
const messageModal = document.getElementById('message-modal');
const closeModal = document.querySelector('.close-modal');
const messageFrom = document.getElementById('message-from');
const messageEmail = document.getElementById('message-email');
const messagePhone = document.getElementById('message-phone');
const messageCompany = document.getElementById('message-company');
const messageSubject = document.getElementById('message-subject');
const messageDate = document.getElementById('message-date');
const messageContent = document.getElementById('message-content');
const deleteMessageBtn = document.getElementById('delete-message');
const replyMessageBtn = document.getElementById('reply-message');

// Dashboard Counters
const usersCount = document.getElementById('users-count');
const assessmentsCount = document.getElementById('assessments-count');
const messagesCount = document.getElementById('messages-count');
const enrollmentsCount = document.getElementById('enrollments-count');

// Pagination state
let usersPagination = {
  pageSize: 10,
  currentPage: 1,
  lastVisible: null,
  totalPages: 1
};

let assessmentsPagination = {
  pageSize: 10,
  currentPage: 1,
  lastVisible: null,
  totalPages: 1
};

let messagesPagination = {
  pageSize: 10,
  currentPage: 1,
  lastVisible: null,
  totalPages: 1
};

// Current message for modal
let currentMessageId = null;

// Check authentication state
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // Check if user is admin
        firebase.firestore().collection('users').doc(user.uid).get()
            .then((doc) => {
                if (doc.exists && doc.data().role === 'admin') {
                    // User is admin, load admin data
                    loadAdminData();
                    loadUsers();
                } else {
                    // User is not admin, redirect to home
                    window.location.href = 'index.html';
                }
            })
            .catch((error) => {
                console.error('Error checking admin status:', error);
                window.location.href = 'index.html';
            });
    } else {
        // No user is signed in, redirect to login
        window.location.href = 'login.html';
    }
});

// Load admin data
async function loadAdminData() {
    try {
        // Get user profile
        const user = firebase.auth().currentUser;
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        // Update admin profile
        adminName.textContent = userData.name || 'Admin';
        if (userData.avatar) {
            adminAvatar.src = userData.avatar;
        }

        // Get counts
        const usersSnapshot = await firebase.firestore().collection('users').count().get();
        const assessmentsSnapshot = await firebase.firestore().collection('assessments').count().get();
        const messagesSnapshot = await firebase.firestore().collection('messages').where('read', '==', false).count().get();
        const enrollmentsSnapshot = await firebase.firestore().collection('enrollments').count().get();

        // Update counts
        usersCount.textContent = usersSnapshot.data().count;
        assessmentsCount.textContent = assessmentsSnapshot.data().count;
        messagesCount.textContent = messagesSnapshot.data().count;
        enrollmentsCount.textContent = enrollmentsSnapshot.data().count;

        totalUsers = usersSnapshot.data().count;
        updatePagination();
    } catch (error) {
        console.error('Error loading admin data:', error);
    }
}

// Load users
async function loadUsers() {
    try {
        usersLoading.style.display = 'flex';
        usersError.style.display = 'none';

        const startAt = (usersPagination.currentPage - 1) * usersPagination.pageSize;
        const usersQuery = query(
            collection(db, "users"),
            orderBy("createdAt", "desc"),
            startAfter(usersPagination.lastVisible),
            limit(usersPagination.pageSize)
        );
        const usersSnapshot = await getDocs(usersQuery);

        usersPagination.lastVisible = usersSnapshot.docs[usersSnapshot.docs.length - 1];
        usersPagination.totalPages = Math.ceil(totalUsers / usersPagination.pageSize);

        if (usersTotalPages) {
            usersTotalPages.textContent = usersPagination.totalPages;
        }

        if (usersCurrentPage) {
            usersCurrentPage.textContent = usersPagination.currentPage;
        }

        updatePaginationButtons('users');

        let html = '';
        usersSnapshot.forEach((userDoc) => {
            const userData = userDoc.data();
            const userId = userDoc.id;
            
            // Format date
            const createdAt = userData.createdAt ? userData.createdAt.toDate() : new Date();
            const formattedDate = createdAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            html += `
                <tr>
                    <td>${userData.displayName || 'N/A'}</td>
                    <td>${userData.email || 'N/A'}</td>
                    <td>${userData.company || 'N/A'}</td>
                    <td><span class="user-status active">Active</span></td>
                    <td>${formattedDate}</td>
                    <td>
                        <div class="table-actions">
                            <button class="view-user" data-id="${userId}"><i class="fas fa-eye"></i></button>
                            <button class="edit-user" data-id="${userId}"><i class="fas fa-edit"></i></button>
                            <button class="delete-user" data-id="${userId}"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });

        usersTable.querySelector('tbody').innerHTML = html;

        // Add event listeners to action buttons
        setupUserActionListeners();
    } catch (error) {
        console.error('Error loading users:', error);
        usersLoading.style.display = 'none';
        usersError.style.display = 'block';
        usersError.textContent = 'Error loading users. Please try again.';
    }
}

// Load assessments data
async function loadAssessments() {
  if (!assessmentsTable || !assessmentsLoading) return;
  
  try {
    // Show loading
    assessmentsLoading.style.display = 'flex';
    assessmentsTable.querySelector('tbody').innerHTML = '';
    
    // Create query
    let assessmentsQuery;
    if (assessmentsPagination.lastVisible && assessmentsPagination.currentPage > 1) {
      assessmentsQuery = query(
        collection(db, "assessments"),
        orderBy("completedAt", "desc"),
        startAfter(assessmentsPagination.lastVisible),
        limit(assessmentsPagination.pageSize)
      );
    } else {
      assessmentsQuery = query(
        collection(db, "assessments"),
        orderBy("completedAt", "desc"),
        limit(assessmentsPagination.pageSize)
      );
    }
    
    // Get assessments
    const assessmentsSnapshot = await getDocs(assessmentsQuery);
    
    // Hide loading
    assessmentsLoading.style.display = 'none';
    
    // Check if empty
    if (assessmentsSnapshot.empty) {
      assessmentsTable.querySelector('tbody').innerHTML = `
        <tr>
          <td colspan="6" class="text-center">No assessments found</td>
        </tr>
      `;
      return;
    }
    
    // Get total assessments for pagination
    const totalAssessmentsQuery = query(collection(db, "assessments"));
    const totalAssessmentsSnapshot = await getDocs(totalAssessmentsQuery);
    const totalAssessments = totalAssessmentsSnapshot.size;
    assessmentsPagination.totalPages = Math.ceil(totalAssessments / assessmentsPagination.pageSize);
    
    if (assessmentsTotalPages) {
      assessmentsTotalPages.textContent = assessmentsPagination.totalPages;
    }
    
    if (assessmentsCurrentPage) {
      assessmentsCurrentPage.textContent = assessmentsPagination.currentPage;
    }
    
    // Update pagination buttons
    updatePaginationButtons('assessments');
    
    // Update lastVisible for pagination
    assessmentsPagination.lastVisible = assessmentsSnapshot.docs[assessmentsSnapshot.docs.length - 1];
    
    // Render assessments
    let html = '';
    for (const assessmentDoc of assessmentsSnapshot.docs) {
      const assessmentData = assessmentDoc.data();
      const assessmentId = assessmentDoc.id;
      
      // Get user info
      let userDisplayName = 'N/A';
      if (assessmentData.userId) {
        const userDoc = await getDoc(doc(db, "users", assessmentData.userId));
        if (userDoc.exists()) {
          userDisplayName = userDoc.data().displayName || userDoc.data().email || 'N/A';
        }
      }
      
      // Format date
      const completedAt = assessmentData.completedAt ? assessmentData.completedAt.toDate() : new Date();
      const formattedDate = completedAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      // Calculate score percentage
      const scorePercentage = assessmentData.totalScore ? 
        Math.round((assessmentData.score / assessmentData.totalScore) * 100) : 0;
      
      // Determine result badge
      let resultBadge = '';
      if (scorePercentage >= 80) {
        resultBadge = '<span class="badge success">Excellent</span>';
      } else if (scorePercentage >= 60) {
        resultBadge = '<span class="badge warning">Average</span>';
      } else {
        resultBadge = '<span class="badge danger">Needs Improvement</span>';
      }
      
      html += `
        <tr>
          <td>${userDisplayName}</td>
          <td>${assessmentData.assessmentType || 'N/A'}</td>
          <td>${scorePercentage}%</td>
          <td>${resultBadge}</td>
          <td>${formattedDate}</td>
          <td>
            <div class="table-actions">
              <button class="view-assessment" data-id="${assessmentId}"><i class="fas fa-eye"></i></button>
              <button class="delete-assessment" data-id="${assessmentId}"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
    }
    
    assessmentsTable.querySelector('tbody').innerHTML = html;
    
    // Add event listeners to action buttons
    setupAssessmentActionListeners();
  } catch (error) {
    console.error("Error loading assessments:", error);
    assessmentsLoading.style.display = 'none';
    if (assessmentsError) {
      assessmentsError.style.display = 'block';
      assessmentsError.textContent = 'Error loading assessments. Please try again.';
    }
  }
}

// Load messages data
async function loadMessages() {
  if (!messagesTable || !messagesLoading) return;
  
  try {
    // Show loading
    messagesLoading.style.display = 'flex';
    messagesTable.querySelector('tbody').innerHTML = '';
    
    // Create query
    let messagesQuery;
    if (messagesPagination.lastVisible && messagesPagination.currentPage > 1) {
      messagesQuery = query(
        collection(db, "messages"),
        orderBy("createdAt", "desc"),
        startAfter(messagesPagination.lastVisible),
        limit(messagesPagination.pageSize)
      );
    } else {
      messagesQuery = query(
        collection(db, "messages"),
        orderBy("createdAt", "desc"),
        limit(messagesPagination.pageSize)
      );
    }
    
    // Get messages
    const messagesSnapshot = await getDocs(messagesQuery);
    
    // Hide loading
    messagesLoading.style.display = 'none';
    
    // Check if empty
    if (messagesSnapshot.empty) {
      messagesTable.querySelector('tbody').innerHTML = `
        <tr>
          <td colspan="6" class="text-center">No messages found</td>
        </tr>
      `;
      return;
    }
    
    // Get total messages for pagination
    const totalMessagesQuery = query(collection(db, "messages"));
    const totalMessagesSnapshot = await getDocs(totalMessagesQuery);
    const totalMessages = totalMessagesSnapshot.size;
    messagesPagination.totalPages = Math.ceil(totalMessages / messagesPagination.pageSize);
    
    if (messagesTotalPages) {
      messagesTotalPages.textContent = messagesPagination.totalPages;
    }
    
    if (messagesCurrentPage) {
      messagesCurrentPage.textContent = messagesPagination.currentPage;
    }
    
    // Update pagination buttons
    updatePaginationButtons('messages');
    
    // Update lastVisible for pagination
    messagesPagination.lastVisible = messagesSnapshot.docs[messagesSnapshot.docs.length - 1];
    
    // Render messages
    let html = '';
    messagesSnapshot.forEach((messageDoc) => {
      const messageData = messageDoc.data();
      const messageId = messageDoc.id;
      
      // Format date
      const createdAt = messageData.createdAt ? messageData.createdAt.toDate() : new Date();
      const formattedDate = createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      // Message status
      const statusClass = messageData.status === 'new' ? 'warning' : 
                         messageData.status === 'read' ? 'info' : 
                         messageData.status === 'replied' ? 'success' : 
                         'primary';
      
      const statusText = messageData.status ? messageData.status.charAt(0).toUpperCase() + messageData.status.slice(1) : 'New';
      
      html += `
        <tr>
          <td>${messageData.name || 'N/A'}</td>
          <td>${messageData.email || 'N/A'}</td>
          <td>${messageData.subject || 'N/A'}</td>
          <td>${formattedDate}</td>
          <td><span class="badge ${statusClass}">${statusText}</span></td>
          <td>
            <div class="table-actions">
              <button class="view-message" data-id="${messageId}"><i class="fas fa-eye"></i></button>
              <button class="delete-message" data-id="${messageId}"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
    });
    
    messagesTable.querySelector('tbody').innerHTML = html;
    
    // Add event listeners to action buttons
    setupMessageActionListeners();
  } catch (error) {
    console.error("Error loading messages:", error);
    messagesLoading.style.display = 'none';
    if (messagesError) {
      messagesError.style.display = 'block';
      messagesError.textContent = 'Error loading messages. Please try again.';
    }
  }
}

// Set up pagination
function setupPagination() {
  // Users pagination
  if (usersPrevButton && usersNextButton) {
    usersPrevButton.addEventListener('click', () => {
      if (usersPagination.currentPage > 1) {
        usersPagination.currentPage--;
        usersPagination.lastVisible = null; // Reset for previous page
        loadUsers();
      }
    });
    
    usersNextButton.addEventListener('click', () => {
      if (usersPagination.currentPage < usersPagination.totalPages) {
        usersPagination.currentPage++;
        loadUsers();
      }
    });
  }
  
  // Assessments pagination
  if (assessmentsPrevButton && assessmentsNextButton) {
    assessmentsPrevButton.addEventListener('click', () => {
      if (assessmentsPagination.currentPage > 1) {
        assessmentsPagination.currentPage--;
        assessmentsPagination.lastVisible = null; // Reset for previous page
        loadAssessments();
      }
    });
    
    assessmentsNextButton.addEventListener('click', () => {
      if (assessmentsPagination.currentPage < assessmentsPagination.totalPages) {
        assessmentsPagination.currentPage++;
        loadAssessments();
      }
    });
  }
  
  // Messages pagination
  if (messagesPrevButton && messagesNextButton) {
    messagesPrevButton.addEventListener('click', () => {
      if (messagesPagination.currentPage > 1) {
        messagesPagination.currentPage--;
        messagesPagination.lastVisible = null; // Reset for previous page
        loadMessages();
      }
    });
    
    messagesNextButton.addEventListener('click', () => {
      if (messagesPagination.currentPage < messagesPagination.totalPages) {
        messagesPagination.currentPage++;
        loadMessages();
      }
    });
  }
}

// Update pagination buttons
function updatePaginationButtons(section) {
  switch (section) {
    case 'users':
      if (usersPrevButton) {
        usersPrevButton.disabled = usersPagination.currentPage === 1;
      }
      if (usersNextButton) {
        usersNextButton.disabled = usersPagination.currentPage === usersPagination.totalPages;
      }
      break;
    case 'assessments':
      if (assessmentsPrevButton) {
        assessmentsPrevButton.disabled = assessmentsPagination.currentPage === 1;
      }
      if (assessmentsNextButton) {
        assessmentsNextButton.disabled = assessmentsPagination.currentPage === assessmentsPagination.totalPages;
      }
      break;
    case 'messages':
      if (messagesPrevButton) {
        messagesPrevButton.disabled = messagesPagination.currentPage === 1;
      }
      if (messagesNextButton) {
        messagesNextButton.disabled = messagesPagination.currentPage === messagesPagination.totalPages;
      }
      break;
  }
}

// Set up modal for messages
function setupModal() {
  if (messageModal && closeModal) {
    // Close modal when clicking the X button
    closeModal.addEventListener('click', () => {
      messageModal.classList.remove('active');
    });
    
    // Close modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
      if (event.target === messageModal) {
        messageModal.classList.remove('active');
      }
    });
    
    // Delete message button
    if (deleteMessageBtn) {
      deleteMessageBtn.addEventListener('click', async () => {
        if (currentMessageId) {
          try {
            await deleteDoc(doc(db, "messages", currentMessageId));
            messageModal.classList.remove('active');
            loadMessages();
            loadCounters();
          } catch (error) {
            console.error("Error deleting message:", error);
            alert("Error deleting message. Please try again.");
          }
        }
      });
    }
    
    // Reply message button
    if (replyMessageBtn) {
      replyMessageBtn.addEventListener('click', () => {
        if (currentMessageId) {
          // Update message status to 'replied'
          updateDoc(doc(db, "messages", currentMessageId), {
            status: 'replied',
            updatedAt: Timestamp.now()
          });
          
          // Compose email (this just opens the default email client)
          const emailElement = document.getElementById('message-email');
          const subjectElement = document.getElementById('message-subject');
          
          if (emailElement && subjectElement) {
            const email = emailElement.textContent;
            const subject = subjectElement.textContent;
            
            window.open(`mailto:${email}?subject=Re: ${subject}`);
          }
        }
      });
    }
  }
}

// Set up action listeners for users
function setupUserActionListeners() {
  // View user
  const viewUserButtons = document.querySelectorAll('.view-user');
  viewUserButtons.forEach(button => {
    button.addEventListener('click', () => {
      const userId = button.getAttribute('data-id');
      // Here you would typically open a modal with user details
      // For simplicity, we'll just show an alert
      alert(`View user with ID: ${userId}`);
    });
  });
  
  // Edit user
  const editUserButtons = document.querySelectorAll('.edit-user');
  editUserButtons.forEach(button => {
    button.addEventListener('click', () => {
      const userId = button.getAttribute('data-id');
      // Here you would typically open a modal with a form to edit user details
      alert(`Edit user with ID: ${userId}`);
    });
  });
  
  // Delete user
  const deleteUserButtons = document.querySelectorAll('.delete-user');
  deleteUserButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const userId = button.getAttribute('data-id');
      
      if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        try {
          await deleteDoc(doc(db, "users", userId));
          loadUsers();
          loadCounters();
        } catch (error) {
          console.error("Error deleting user:", error);
          alert("Error deleting user. Please try again.");
        }
      }
    });
  });
}

// Set up action listeners for assessments
function setupAssessmentActionListeners() {
  // View assessment
  const viewAssessmentButtons = document.querySelectorAll('.view-assessment');
  viewAssessmentButtons.forEach(button => {
    button.addEventListener('click', () => {
      const assessmentId = button.getAttribute('data-id');
      // Here you would typically open a modal with assessment details
      alert(`View assessment with ID: ${assessmentId}`);
    });
  });
  
  // Delete assessment
  const deleteAssessmentButtons = document.querySelectorAll('.delete-assessment');
  deleteAssessmentButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const assessmentId = button.getAttribute('data-id');
      
      if (confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
        try {
          await deleteDoc(doc(db, "assessments", assessmentId));
          loadAssessments();
          loadCounters();
        } catch (error) {
          console.error("Error deleting assessment:", error);
          alert("Error deleting assessment. Please try again.");
        }
      }
    });
  });
}

// Set up action listeners for messages
function setupMessageActionListeners() {
  // View message
  const viewMessageButtons = document.querySelectorAll('.view-message');
  viewMessageButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const messageId = button.getAttribute('data-id');
      currentMessageId = messageId;
      
      try {
        // Get message details
        const messageDoc = await getDoc(doc(db, "messages", messageId));
        
        if (messageDoc.exists()) {
          const messageData = messageDoc.data();
          
          // Format date
          const createdAt = messageData.createdAt ? messageData.createdAt.toDate() : new Date();
          const formattedDate = createdAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          
          // Update modal with message details
          messageFrom.textContent = messageData.name || 'N/A';
          messageEmail.textContent = messageData.email || 'N/A';
          messagePhone.textContent = messageData.phone || 'N/A';
          messageCompany.textContent = messageData.company || 'N/A';
          messageSubject.textContent = messageData.subject || 'N/A';
          messageDate.textContent = formattedDate;
          messageContent.textContent = messageData.message || 'N/A';
          
          // Show modal
          messageModal.classList.add('active');
          
          // Update message status to 'read' if it's 'new'
          if (messageData.status === 'new') {
            await updateDoc(doc(db, "messages", messageId), {
              status: 'read',
              readAt: Timestamp.now()
            });
            
            // Refresh messages list to show updated status
            loadMessages();
          }
        } else {
          alert("Message not found");
        }
      } catch (error) {
        console.error("Error loading message:", error);
        alert("Error loading message. Please try again.");
      }
    });
  });
  
  // Delete message
  const deleteMessageButtons = document.querySelectorAll('.delete-message');
  deleteMessageButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const messageId = button.getAttribute('data-id');
      
      if (confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
        try {
          await deleteDoc(doc(db, "messages", messageId));
          loadMessages();
          loadCounters();
        } catch (error) {
          console.error("Error deleting message:", error);
          alert("Error deleting message. Please try again.");
        }
      }
    });
  });
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(totalUsers / usersPagination.pageSize);
    usersPagination.totalPages = totalPages;
    usersPagination.currentPage = Math.min(Math.max(usersPagination.currentPage, 1), totalPages);
    usersPagination.lastVisible = null;
    loadUsers();
}

// Event Listeners
usersPrevButton.addEventListener('click', () => {
    if (usersPagination.currentPage > 1) {
        usersPagination.currentPage--;
        loadUsers();
        updatePagination();
    }
});

usersNextButton.addEventListener('click', () => {
    if (usersPagination.currentPage < usersPagination.totalPages) {
        usersPagination.currentPage++;
        loadUsers();
        updatePagination();
    }
});

// Mobile sidebar toggle
const mobileSidebarToggle = document.querySelector('.mobile-sidebar-toggle');
const adminSidebar = document.querySelector('.admin-sidebar');

mobileSidebarToggle.addEventListener('click', () => {
    adminSidebar.classList.toggle('active');
});