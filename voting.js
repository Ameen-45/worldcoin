// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAHNkk5nuaIxDtnWyxpMBg-mB5o62zenrs",
    authDomain: "worldcoin-voting.firebaseapp.com",
    databaseURL: "https://worldcoin-voting-default-rtdb.firebaseio.com",
    projectId: "worldcoin-voting",
    storageBucket: "worldcoin-voting.appspot.com",
    messagingSenderId: "567346433702",
    appId: "1:567346433702:web:a5e30f41d42d8c5961ae67"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const votesRef = database.ref('votes');

// Voting system variables
let currentVote = null;
let votesData = {0: 0, 1: 0, 2: 0}; // Initialize with default values
let hasVoted = false;

// Initialize the voting system
function initVoting() {
    // Listen for realtime updates from Firebase
    votesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            votesData = data;
            updateVoteCounts(votesData);
        }
    });
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Initialize vote options with event listeners
    document.querySelectorAll('.vote-item').forEach(item => {
        item.addEventListener('click', function() {
            if (hasVoted) {
                showVoteStatus("You've already voted! You can change your vote by clicking another option.", "info");
                return;
            }
            
            const optionIndex = parseInt(this.dataset.option);
            castVote(optionIndex);
        });
    });
}

// Cast a vote
function castVote(optionIndex) {
    // Show loading indicator
    document.getElementById('vote-loading').style.display = 'block';
    
    // Update the vote count in Firebase
    const newVotes = {...votesData};
    
    // If user is changing their vote
    if (currentVote !== null) {
        newVotes[currentVote] = Math.max(0, (newVotes[currentVote] || 0) - 1);
    }
    
    // Add new vote
    newVotes[optionIndex] = (newVotes[optionIndex] || 0) + 1;
    currentVote = optionIndex;
    hasVoted = true;
    
    // Update Firebase
    votesRef.set(newVotes)
        .then(() => {
            // Show success notification
            showVoteNotification(optionIndex);
            
            // Highlight the selected option
            highlightVotedOption(optionIndex);
            
            // Hide loading indicator
            document.getElementById('vote-loading').style.display = 'none';
            
            // Show success message
            showVoteStatus("Thank you for voting!", "success");
        })
        .catch((error) => {
            console.error("Error updating vote:", error);
            document.getElementById('vote-loading').style.display = 'none';
            
            // Revert the vote locally
            hasVoted = false;
            if (currentVote !== null) {
                newVotes[currentVote] = Math.max(0, (newVotes[currentVote] || 0) - 1);
                currentVote = null;
            }
            
            // Show error status
            showVoteStatus("Error submitting vote. Please try again.", "error");
        });
}

// Show vote status message
function showVoteStatus(message, type) {
    const statusElement = document.getElementById('vote-status');
    statusElement.textContent = message;
    statusElement.className = `vote-status ${type}`;
    statusElement.style.display = "block";
    
    setTimeout(() => {
        statusElement.style.display = "none";
    }, 3000);
}

// Show vote notification popup
function showVoteNotification(optionIndex) {
    const options = [
        "Education for Underprivileged Children",
        "Community Health Initiatives",
        "School Infrastructure Development"
    ];
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'vote-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <h3>Thank You for Voting!</h3>
            <p>You voted for: <strong>${options[optionIndex]}</strong></p>
            <button class="close-notification">OK</button>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Close button functionality
    notification.querySelector('.close-notification').addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.5s forwards';
        setTimeout(() => {
            notification.remove();
        }, 500);
    });
    
    // Auto-close after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideOut 0.5s forwards';
            setTimeout(() => {
                notification.remove();
            }, 500);
        }
    }, 5000);
}

// Update all vote counts in the UI
function updateVoteCounts(votes) {
    const totalVotes = calculateTotalVotes(votes);
    
    document.querySelectorAll('.vote-item').forEach(item => {
        const optionIndex = parseInt(item.dataset.option);
        const voteCount = votes[optionIndex] || 0;
        const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
        
        // Update vote count display
        item.querySelector('.vote-count').textContent = `${voteCount} vote${voteCount !== 1 ? 's' : ''}`;
        item.querySelector('.vote-percent').textContent = `${percent}%`;
        
        // Update progress bar
        const progressFill = item.querySelector('.progress-fill');
        progressFill.style.width = `${percent}%`;
        
        // Add animation if there's a change
        if (progressFill.getAttribute('data-last-width') !== progressFill.style.width) {
            progressFill.classList.add('animate__animated', 'animate__pulse');
            setTimeout(() => {
                progressFill.classList.remove('animate__animated', 'animate__pulse');
            }, 1000);
            progressFill.setAttribute('data-last-width', progressFill.style.width);
        }
    });
}

// Calculate total votes
function calculateTotalVotes(votes) {
    if (!votes) return 0;
    return Object.values(votes).reduce((total, count) => total + count, 0);
}

// Highlight the option the user voted for
function highlightVotedOption(optionIndex) {
    document.querySelectorAll('.vote-item').forEach(item => {
        item.classList.remove('voted');
    });
    
    const votedItem = document.querySelector(`.vote-item[data-option="${optionIndex}"]`);
    if (votedItem) {
        votedItem.classList.add('voted');
        votedItem.classList.add('animate__animated', 'animate__heartBeat');
        setTimeout(() => {
            votedItem.classList.remove('animate__animated', 'animate__heartBeat');
        }, 1000);
    }
}

// Setup mobile menu
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initVoting);