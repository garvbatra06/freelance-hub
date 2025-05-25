// Import Firebase (Modular SDK)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, push, get, child, set, update } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js"; // Added 'update'
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC_4ImmkQfHuhpQuFtAjtb0485ZhVxV3p4",
  authDomain: "freelancehub-a1f32.firebaseapp.com",
  projectId: "freelancehub-a1f32",
  storageBucket: "freelancehub-a1f32.appspot.com",
  messagingSenderId: "443483995651",
  appId: "1:443483995651:web:7d49449f605aeb183b5836",
  measurementId: "G-PMN8VY94Y3"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// DOM Elements
const freelancerSignupBtn = document.getElementById('freelancer-signup');
const clientSignupBtn = document.getElementById('client-signup');
const freelancerForm = document.getElementById('freelancer-form');
const clientForm = document.getElementById('client-form');
const freelancerRegistration = document.getElementById('freelancer-registration');
const clientRegistration = document.getElementById('client-registration');
const clientDashboard = document.getElementById('client-dashboard');
const freelancersGrid = document.getElementById('freelancers-grid');
const loadingSpinner = document.getElementById('loading');
const navFreelancers = document.querySelector('.nav-freelancers');
const statusContainer = document.getElementById('status-container');
const statusMessage = document.getElementById('status-message');

const heroCtaButtons = document.getElementById('hero-cta-buttons'); 
const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');

const authButtonsContainer = document.getElementById('auth-buttons-container'); 
const userProfileDisplay = document.getElementById('user-profile-display');
const profilePic = document.getElementById('profile-pic');
const userName = document.getElementById('user-name');

// NEW: Job Posting elements
const postJobButton = document.getElementById('post-job-button');
const jobPostingFormSection = document.getElementById('job-posting-form');
const newJobForm = document.getElementById('new-job-form');


// Status Display (your "pop-up" message)
function showStatus(message, isSuccess) {
  statusContainer.style.display = 'block';
  statusMessage.textContent = message;
  statusMessage.className = isSuccess ? 'status-message success' : 'status-message error';
  setTimeout(() => {
    statusContainer.style.display = 'none';
  }, 5000);
}

// Function to check if logged in and redirect if not
function ensureLoggedIn(event) {
  if (!auth.currentUser) {
    event.preventDefault(); 
    showStatus('Please sign in or sign up to continue.', false);
    setTimeout(() => { 
        window.location.href = 'auth.html';
    }, 1500);
    return true; 
  }
  return false; 
}

// Event Listeners for Header Auth Buttons
loginButton.addEventListener('click', () => {
    window.location.href = 'auth.html';
});

signupButton.addEventListener('click', () => {
    window.location.href = 'auth.html';
});

// Event Listeners for Hero CTA Buttons
freelancerSignupBtn.addEventListener('click', (e) => {
  if (!ensureLoggedIn(e)) { 
    freelancerForm.style.display = 'block';
    clientForm.style.display = 'none';
    clientDashboard.style.display = 'none';
    jobPostingFormSection.style.display = 'none'; // Hide job posting form
    if (auth.currentUser) { 
        document.getElementById('email').value = auth.currentUser.email;
    }
    window.scrollTo({ top: freelancerForm.offsetTop - 50, behavior: 'smooth' });
  }
});

clientSignupBtn.addEventListener('click', (e) => {
  if (!ensureLoggedIn(e)) { 
    clientForm.style.display = 'block';
    freelancerForm.style.display = 'none';
    clientDashboard.style.display = 'none';
    jobPostingFormSection.style.display = 'none'; // Hide job posting form
    if (auth.currentUser) { 
        document.getElementById('client-email').value = auth.currentUser.email;
    }
    window.scrollTo({ top: clientForm.offsetTop - 50, behavior: 'smooth' });
  }
});

// Event Listener for "Freelancers" Nav Link
navFreelancers.addEventListener('click', (e) => {
  if (!ensureLoggedIn(e)) { 
    showClientDashboard();
  }
});

// NEW: Post a Job button click handler
postJobButton.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default if it's an anchor tag
    // Ensure only logged-in clients can access
    if (!auth.currentUser) {
        ensureLoggedIn(e); // This will handle the redirect/message
        return;
    }
    // No need to check role here as button is only visible to clients by JS
    jobPostingFormSection.style.display = 'block';
    freelancerForm.style.display = 'none';
    clientForm.style.display = 'none';
    clientDashboard.style.display = 'none';
    window.scrollTo({ top: jobPostingFormSection.offsetTop - 50, behavior: 'smooth' });
});


// Register Freelancer (Updated to set user role)
freelancerRegistration.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!auth.currentUser) { 
      showStatus('You must be logged in to register as a freelancer.', false);
      return;
  }

  const freelancerProfile = {
    name: document.getElementById('name').value,
    email: auth.currentUser.email, 
    title: document.getElementById('title').value,
    skills: document.getElementById('skills').value.split(',').map(skill => skill.trim()),
    experience: document.getElementById('experience').value,
    hourlyRate: document.getElementById('hourly-rate').value,
    bio: document.getElementById('bio').value,
    location: document.getElementById('location').value, // NEW
    timeZone: document.getElementById('timezone').value, // NEW
    availability: document.getElementById('availability').value, // NEW
    dateRegistered: new Date().toISOString(),
    uid: auth.currentUser.uid 
  };

  try {
    await set(ref(database, 'freelancers/' + auth.currentUser.uid), freelancerProfile);
    // Update user's role in the 'users' node
    await update(ref(database, 'users/' + auth.currentUser.uid), { role: 'freelancer' });

    freelancerRegistration.reset();
    showStatus('Freelancer profile created successfully! You are now registered as a Freelancer.', true);
    freelancerForm.style.display = 'none';
    showClientDashboard(); // Or redirect to a freelancer dashboard if you build one
  } catch (err) {
    console.error("Freelancer registration error:", err);
    showStatus('Freelancer registration failed. ' + err.message, false);
  }
});

// Register Client (Updated to set user role)
clientRegistration.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!auth.currentUser) { 
      showStatus('You must be logged in to register as a client.', false);
      return;
  }

  const clientProfile = {
    name: document.getElementById('client-name').value,
    email: auth.currentUser.email, 
    company: document.getElementById('company').value,
    industry: document.getElementById('industry').value,
    dateRegistered: new Date().toISOString(),
    uid: auth.currentUser.uid
  };

  try {
    await set(ref(database, 'clients/' + auth.currentUser.uid), clientProfile);
    // Update user's role in the 'users' node
    await update(ref(database, 'users/' + auth.currentUser.uid), { role: 'client' });

    clientRegistration.reset();
    showStatus('Client profile created successfully! You are now registered as a Client.', true);
    clientForm.style.display = 'none';
    showClientDashboard(); // Show dashboard after client registers
  } catch (err) {
    console.error("Client registration error:", err);
    showStatus('Client registration failed. ' + err.message, false);
  }
});

// NEW: Handle Job Posting Submission
newJobForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
        showStatus('You must be logged in to post a job.', false);
        return;
    }

    // Optional: Fetch current user's role to double-check if they are a client
    // This is a good security check for the server-side, less critical for client-side as UI already controls visibility
    const userRef = ref(database, 'users/' + auth.currentUser.uid);
    const userSnapshot = await get(userRef);
    const userRole = userSnapshot.exists() ? userSnapshot.val().role : 'unassigned';

    if (userRole !== 'client') {
        showStatus('Only registered clients can post jobs. Please register as a client first.', false);
        return;
    }

    const jobData = {
        title: document.getElementById('job-title').value,
        description: document.getElementById('job-description').value,
        budget: document.getElementById('job-budget').value,
        duration: document.getElementById('job-duration').value,
        clientId: auth.currentUser.uid,
        clientEmail: auth.currentUser.email,
        datePosted: new Date().toISOString()
    };

    try {
        await push(ref(database, 'jobs'), jobData); // Push to 'jobs' node, generating a unique ID
        newJobForm.reset();
        showStatus('Job posted successfully!', true);
        jobPostingFormSection.style.display = 'none'; // Hide form after submission
        showClientDashboard(); // Optionally redirect to dashboard or job listings
    } catch (err) {
        console.error("Job posting error:", err);
        showStatus('Failed to post job. ' + err.message, false);
    }
});


// Fetch freelancers
async function fetchFreelancers() {
  try {
    loadingSpinner.style.display = 'block';
    const snapshot = await get(child(ref(database), 'freelancers'));
    
    return snapshot.exists() ? Object.values(snapshot.val()) : []; 
  } catch (err) {
    console.error(err);
    showStatus('Failed to fetch freelancers.', false);
    return [];
  } finally {
    loadingSpinner.style.display = 'none';
  }
}

// Display freelancers
async function updateFreelancersList() {
  freelancersGrid.innerHTML = '';
  freelancersGrid.appendChild(loadingSpinner);

  const freelancers = await fetchFreelancers();
  freelancersGrid.removeChild(loadingSpinner);

  if (freelancers.length === 0) {
    freelancersGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No freelancers registered yet.</p>';
  } else {
    freelancers.forEach((freelancer) => {
      const card = document.createElement('div');
      card.className = 'freelancer-card';
      const skillsHTML = Array.isArray(freelancer.skills) 
                         ? freelancer.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')
                         : ''; 
      card.innerHTML = `
        <div class="card-header">
          <h3 class="freelancer-name">${freelancer.name}</h3>
          <p class="freelancer-title">${freelancer.title}</p>
        </div>
        <div class="card-body">
          <div class="freelancer-skills">${skillsHTML}</div>
          <p class="freelancer-rate">$${freelancer.hourlyRate}/hour</p>
          <p><strong>Location:</strong> ${freelancer.location || 'N/A'}</p>
          <p><strong>Availability:</strong> ${freelancer.availability || 'N/A'}</p>
          <p>${freelancer.bio.substring(0, 100)}${freelancer.bio.length > 100 ? '...' : ''}</p>
          <button class="contact-button" data-email="${freelancer.email}">Contact</button>
        </div>
      `;
      freelancersGrid.appendChild(card);
    });
  }
}

// Contact button alert
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('contact-button')) {
    const email = e.target.getAttribute('data-email');
    alert(`Contact feature will be implemented soon. Email: ${email}`);
  }
});

// Show dashboard
function showClientDashboard() {
  clientDashboard.style.display = 'block';
  freelancerForm.style.display = 'none';
  clientForm.style.display = 'none';
  jobPostingFormSection.style.display = 'none'; // Hide job posting form
  window.scrollTo({ top: clientDashboard.offsetTop - 50, behavior: 'smooth' });
  updateFreelancersList();
}


// --- Main UI Logic based on Auth State ---
onAuthStateChanged(auth, async (user) => { // Made async to fetch user role
  if (user) {
    console.log('User logged in:', user.email, 'UID:', user.uid);
    
    // Hide Login/Sign Up buttons
    authButtonsContainer.style.display = 'none';
    
    // Show user profile display
    userProfileDisplay.style.display = 'flex'; 
    
    // Set profile picture
    if (user.photoURL) {
      profilePic.src = user.photoURL; 
    } else {
      profilePic.src = 'assets/default-profile.png'; 
    }

    // Set user name/email
    userName.textContent = user.displayName || user.email;

    // Attach logout functionality to the profile display
    userProfileDisplay.removeEventListener('click', handleLogout); 
    userProfileDisplay.addEventListener('click', handleLogout);

    // Fetch user's role
    const userRef = ref(database, 'users/' + user.uid);
    const userSnapshot = await get(userRef);
    const userRole = userSnapshot.exists() ? userSnapshot.val().role : 'unassigned';
    console.log('User Role:', userRole);

    // Conditionally show "Post a Job" button based on role
    if (userRole === 'client') {
        postJobButton.style.display = 'block';
    } else {
        postJobButton.style.display = 'none';
    }

    // Show appropriate dashboard/forms
    if (userRole === 'client' || userRole === 'freelancer') {
        showClientDashboard(); // For now, both see the freelancer list
    } else {
        // If 'unassigned', prompt them to register as freelancer/client
        showStatus('Welcome! Please register as a Freelancer or Client to access full features.', true);
        freelancerForm.style.display = 'none'; // Hide forms initially
        clientForm.style.display = 'none';
        clientDashboard.style.display = 'none';
        jobPostingFormSection.style.display = 'none';
    }


    // Pre-fill email fields in registration forms
    if (document.getElementById('email')) {
        document.getElementById('email').value = user.email;
    }
    if (document.getElementById('client-email')) {
        document.getElementById('client-email').value = user.email;
    }

  } else {
    console.log('User not logged in');

    // Show Login/Sign Up buttons
    authButtonsContainer.style.display = 'flex'; 
    
    // Hide user profile display and Post a Job button
    userProfileDisplay.style.display = 'none';
    postJobButton.style.display = 'none';

    // Ensure all forms/dashboards are hidden when logged out
    freelancerForm.style.display = 'none'; 
    clientForm.style.display = 'none'; 
    clientDashboard.style.display = 'none'; 
    jobPostingFormSection.style.display = 'none';

    // Re-attach original login/signup listeners 
    loginButton.removeEventListener('click', handleLogout); 
    loginButton.addEventListener('click', () => { window.location.href = 'auth.html'; }); 
    signupButton.addEventListener('click', () => { window.location.href = 'auth.html'; }); 
  }
});

// Separate logout function to be reusable and properly add/remove listener
async function handleLogout() {
    try {
        await signOut(auth);
        showStatus('Logged out successfully!', true);
        // onAuthStateChanged will handle UI updates
    } catch (error) {
        console.error("Logout failed:", error);
        showStatus('Logout failed: ' + error.message, false);
    }
}