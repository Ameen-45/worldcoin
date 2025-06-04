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

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    // Hamburger menu toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Voting system variables
    const currentDate = new Date();
    const currentMonthYear = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
    const votesRef = database.ref(`votes/${currentMonthYear}`);
    const votersRef = database.ref(`voters/${currentMonthYear}`);

    let votesData = { 0: 0, 1: 0, 2: 0 };
    let currentVote = null;
    let hasVoted = false;
    let userId = null;

    // Generate unique user ID and store it
    function generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    }

    function checkVotingStatus() {
        userId = localStorage.getItem('worldcoinUserId');
        if (!userId) {
            userId = generateUserId();
            localStorage.setItem('worldcoinUserId', userId);
        }

        votersRef.child(userId).once('value').then(snapshot => {
            if (snapshot.exists()) {
                hasVoted = true;
                currentVote = snapshot.val();
                highlightVotedOption(currentVote);
            }
        }).catch(error => {
            console.error("Error checking voting status:", error);
            showVoteStatus("Error checking your voting status. Please refresh the page.", "error", 3000);
        });
    }

    // Highlight the option the user voted for
    function highlightVotedOption(optionIndex) {
        document.querySelectorAll('.vote-item').forEach((item, index) => {
            if (index === optionIndex) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    // Update UI with vote counts and percentages
    function updateVoteCounts(data) {
        const totalVotes = Object.values(data).reduce((sum, val) => sum + val, 0);

        [0, 1, 2].forEach(option => {
            const count = data[option] || 0;
            const percent = totalVotes ? Math.round((count / totalVotes) * 100) : 0;

            document.getElementById(`count-${option}`).textContent = `${count} vote${count !== 1 ? 's' : ''}`;
            document.getElementById(`percent-${option}`).textContent = `${percent}%`;
            document.getElementById(`progress-${option}`).style.width = `${percent}%`;
        });
    }

    // Show status messages for voting feedback
    function showVoteStatus(message, type, duration = 3000) {
        const statusEl = document.getElementById('vote-status');
        statusEl.textContent = message;
        statusEl.className = `vote-status ${type}`;

        if (duration > 0) {
            setTimeout(() => {
                statusEl.className = 'vote-status';
            }, duration);
        }
    }

    // Handle vote casting logic
    function castVote(optionIndex) {
        if (hasVoted && currentVote === optionIndex) {
            showVoteStatus("You've already voted for this option.", "info", 2000);
            return;
        }

        if (hasVoted) {
            if (!confirm("You've already voted. Do you want to change your vote?")) {
                return;
            }
        }

        document.getElementById('vote-loading').style.display = 'block';

        const newVotes = { ...votesData };

        // Remove old vote if changing vote
        if (hasVoted && currentVote !== null) {
            newVotes[currentVote] = Math.max(0, (newVotes[currentVote] || 0) - 1);
        }

        // Add new vote
        newVotes[optionIndex] = (newVotes[optionIndex] || 0) + 1;

        const updates = {
            [`votes/${currentMonthYear}`]: newVotes,
            [`voters/${currentMonthYear}/${userId}`]: optionIndex
        };

        database.ref().update(updates)
            .then(() => {
                votesData = newVotes;
                currentVote = optionIndex;
                hasVoted = true;
                updateVoteCounts(votesData);
                highlightVotedOption(optionIndex);
                document.getElementById('vote-loading').style.display = 'none';
                showVoteStatus("Vote recorded successfully!", "success");
                
                // Track the vote in analytics if needed
                logVoteAnalytics(optionIndex);
            })
            .catch(error => {
                document.getElementById('vote-loading').style.display = 'none';
                console.error("Error casting vote:", error);
                showVoteStatus("Failed to record vote. Please try again.", "error");
            });
    }

    // Log vote analytics (optional)
    function logVoteAnalytics(optionIndex) {
        const optionText = document.querySelector(`.vote-item[data-option="${optionIndex}"] .option-text`).textContent;
        console.log(`User voted for: ${optionText}`);
        // You can add more analytics tracking here
    }

    // Attach click listeners to vote options
    function setupVoteButtons() {
        document.querySelectorAll('.vote-item').forEach(item => {
            item.addEventListener('click', () => {
                const optionIndex = parseInt(item.dataset.option);
                castVote(optionIndex);
            });
        });
    }

    // Listen to real-time vote updates
    function setupVoteListener() {
        votesRef.on('value', snapshot => {
            const data = snapshot.val();
            if (data) {
                votesData = data;
                updateVoteCounts(data);
            } else {
                // Initialize votes if they don't exist
                votesRef.set({ 0: 0, 1: 0, 2: 0 })
                    .catch(error => {
                        console.error("Error initializing votes:", error);
                    });
            }
        }, error => {
            console.error("Error listening to vote updates:", error);
            showVoteStatus("Error loading vote data. Please refresh the page.", "error", 3000);
        });
    }

    // Network status notifications
    window.addEventListener('online', () => {
        showVoteStatus("Back online - votes will sync now.", "success", 3000);
        // Force a refresh of vote data when coming back online
        votesRef.off();
        setupVoteListener();
    });

    window.addEventListener('offline', () => {
        showVoteStatus("Offline - votes will sync when back online.", "info", 3000);
    });

    // Check if user is online
    function checkOnlineStatus() {
        if (!navigator.onLine) {
            showVoteStatus("You're currently offline. Votes will sync when back online.", "info", 3000);
        }
    }

    // Initialize
    checkVotingStatus();
    setupVoteListener();
    setupVoteButtons();
    checkOnlineStatus();

    // Add animation to elements when they come into view
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.section-card, .info-item, .vote-item');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;
            
            if (elementPosition < screenPosition) {
                element.classList.add('animate__animated', 'animate__fadeInUp');
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on load
});
