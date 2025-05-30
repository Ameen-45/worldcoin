document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // Close mobile menu when clicking a link
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
    
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

    // Initialize Firebase with error handling
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log("Firebase initialized successfully");
        }
        
        // Enable offline persistence
        firebase.database().enablePersistence()
            .catch((err) => {
                console.log("Offline persistence enabled with warning:", err);
            });
    } catch (error) {
        console.error("Firebase initialization error:", error);
        showVoteStatus("Voting system initialization failed", "error", 5000);
    }
    
    const database = firebase.database();
    
    // Get current month and year for vote period
    const currentDate = new Date();
    const currentMonthYear = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
    
    // Firebase references
    const votesRef = database.ref(`votes/${currentMonthYear}`);
    const votersRef = database.ref(`voters/${currentMonthYear}`);
    
    // Voting system variables
    let currentVote = null;
    let votesData = {0: 0, 1: 0, 2: 0};
    let hasVoted = false;
    let userId = null;
    let isOnline = navigator.onLine;

    // Network status detection
    window.addEventListener('online', () => {
        isOnline = true;
        console.log("Network connection restored");
        showVoteStatus("Back online - votes will sync now", "success", 3000);
    });

    window.addEventListener('offline', () => {
        isOnline = false;
        console.log("Network connection lost");
        showVoteStatus("Offline - votes will sync when back online", "info", 3000);
    });

    // Generate a unique session ID for the user
    function generateSessionId() {
        return `user_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
    }

    // Check if user has already voted this month
    function checkVotingStatus() {
        userId = sessionStorage.getItem('worldcoinSessionId');
        if (!userId) {
            userId = generateSessionId();
            sessionStorage.setItem('worldcoinSessionId', userId);
            console.log("New user session created:", userId);
        }
        
        votersRef.child(userId).once('value').then((snapshot) => {
            if (snapshot.exists()) {
                hasVoted = true;
                currentVote = snapshot.val();
                highlightVotedOption(currentVote);
                console.log("Existing vote found for user:", currentVote);
            }
        }).catch((error) => {
            console.error("Error checking voting status:", error);
        });
    }

    // Enhanced real-time vote listener with offline support
    function setupVoteListener() {
        votesRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                console.log("Received vote update:", data);
                votesData = data;
                updateVoteCounts(votesData);
                animateVoteChanges(data);
            } else {
                console.log("Initializing new month's votes");
                votesRef.set({0: 0, 1: 0, 2: 0}).catch(error => {
                    console.error("Error initializing votes:", error);
                });
            }
        }, (error) => {
            console.error("Vote listener error:", error);
        });
    }

    // Initialize vote options with enhanced event listeners
    function setupVoteButtons() {
        document.querySelectorAll('.vote-item').forEach(item => {
            // Remove any existing listeners to prevent duplicates
            item.replaceWith(item.cloneNode(true));
        });

        document.querySelectorAll('.vote-item').forEach(item => {
            item.addEventListener('click', function() {
                const optionIndex = parseInt(this.dataset.option);
                
                if (hasVoted && currentVote === optionIndex) {
                    showVoteStatus("You've already voted for this option", "info", 2000);
                    return;
                }
                
                castVote(optionIndex);
            });
        });
    }

    // Robust vote casting with offline support
    function castVote(optionIndex) {
        if (!userId) {
            showVoteStatus("Please refresh the page and try again", "error", 3000);
            return;
        }

        console.log(`Attempting to vote for option ${optionIndex}`);
        document.getElementById('vote-loading').style.display = 'block';
        
        const newVotes = {...votesData};
        
        // If user is changing their vote
        if (hasVoted && currentVote !== null) {
            console.log(`Changing vote from ${currentVote} to ${optionIndex}`);
            newVotes[currentVote] = Math.max(0, (newVotes[currentVote] || 0) - 1);
        }
        
        // Add new vote
        newVotes[optionIndex] = (newVotes[optionIndex] || 0) + 1;
        
        const updates = {};
        updates[`/votes/${currentMonthYear}`] = newVotes;
        updates[`/voters/${currentMonthYear}/${userId}`] = optionIndex;
        
        console.log("Preparing database updates:", updates);
        
        // First update local state for immediate UI feedback
        currentVote = optionIndex;
        hasVoted = true;
        votesData = newVotes;
        highlightVotedOption(optionIndex);
        updateVoteCounts(votesData);
        
        // Then attempt to update Firebase
        database.ref().update(updates)
            .then(() => {
                console.log("Vote successfully recorded in Firebase");
                document.getElementById('vote-loading').style.display = 'none';
                showVoteNotification(optionIndex);
                showVoteStatus("Vote recorded successfully!", "success", 3000);
            })
            .catch((error) => {
                console.error("Vote submission error:", error);
                document.getElementById('vote-loading').style.display = 'none';
                
                if (!isOnline) {
                    showVoteStatus("Vote saved locally - will sync when online", "info", 3000);
                } else if (error.code === 'PERMISSION_DENIED') {
                    showVoteStatus("Database permission denied", "error", 3000);
                } else {
                    showVoteStatus("Voting failed. Please try again.", "error", 3000);
                }
                
                // Queue the vote for retry when online
                queueVoteForRetry(updates);
            });
    }

    // Queue failed votes for retry when online
    function queueVoteForRetry(updates) {
        if (!isOnline) {
            const pendingVotes = JSON.parse(sessionStorage.getItem('pendingVotes') || [];
            pendingVotes.push(updates);
            sessionStorage.setItem('pendingVotes', JSON.stringify(pendingVotes));
            console.log("Vote queued for retry when online");
        }
    }

    // Retry any pending votes when coming back online
    function retryPendingVotes() {
        const pendingVotes = JSON.parse(sessionStorage.getItem('pendingVotes') || [];
        if (pendingVotes.length > 0 && isOnline) {
            console.log(`Retrying ${pendingVotes.length} pending votes`);
            
            pendingVotes.forEach((updates, index) => {
                database.ref().update(updates)
                    .then(() => {
                        console.log(`Successfully synced pending vote ${index + 1}`);
                        // Remove successfully synced votes
                        const updatedPending = pendingVotes.filter((_, i) => i !== index);
                        sessionStorage.setItem('pendingVotes', JSON.stringify(updatedPending));
                    })
                    .catch(error => {
                        console.error(`Failed to sync pending vote ${index + 1}:`, error);
                    });
            });
        }
    }

    // Enhanced vote status display
    function showVoteStatus(message, type, duration = 3000) {
        const statusElement = document.getElementById('vote-status');
        
        // Clear any existing timeouts
        if (statusElement.timeoutId) {
            clearTimeout(statusElement.timeoutId);
        }
        
        statusElement.textContent = message;
        statusElement.className = `vote-status ${type}`;
        statusElement.style.display = "block";
        statusElement.style.opacity = "1";
        
        // Add animation
        statusElement.classList.add('animate__animated', 'animate__fadeIn');
        setTimeout(() => {
            statusElement.classList.remove('animate__animated', 'animate__fadeIn');
        }, 500);
        
        // Auto-hide after duration
        statusElement.timeoutId = setTimeout(() => {
            let opacity = 1;
            const fadeInterval = setInterval(() => {
                opacity -= 0.1;
                statusElement.style.opacity = opacity;
                if (opacity <= 0) {
                    clearInterval(fadeInterval);
                    statusElement.style.display = "none";
                    statusElement.style.opacity = "1";
                }
            }, 100);
        }, duration);
    }

    // Enhanced vote notification
    function showVoteNotification(optionIndex) {
        const options = [
            "Education for Underprivileged Children",
            "Community Health Initiatives",
            "School Infrastructure Development"
        ];
        
        // Remove any existing notifications
        const existingNotification = document.querySelector('.vote-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'vote-notification animate__animated animate__fadeInUp';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <h3>Thank You for Voting!</h3>
                <p>You voted for: <strong>${options[optionIndex]}</strong></p>
                <div class="notification-progress">
                    <div class="notification-progress-bar"></div>
                </div>
                <button class="close-notification">OK</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate progress bar
        const progressBar = notification.querySelector('.notification-progress-bar');
        progressBar.style.width = '100%';
        progressBar.style.transition = 'width 5s linear';
        
        // Close button functionality
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.animation = 'fadeOut 0.3s forwards';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
    }

    // Update vote counts with smooth animations
    function updateVoteCounts(votes) {
        const totalVotes = calculateTotalVotes(votes);
        
        document.querySelectorAll('.vote-item').forEach(item => {
            const optionIndex = parseInt(item.dataset.option);
            const voteCount = votes[optionIndex] || 0;
            const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
            
            // Update vote count display
            const voteCountElement = item.querySelector('.vote-count');
            const oldCount = parseInt(voteCountElement.textContent) || 0;
            voteCountElement.textContent = `${voteCount} vote${voteCount !== 1 ? 's' : ''}`;
            
            // Update percentage display
            const percentElement = item.querySelector('.vote-percent');
            const oldPercent = parseInt(percentElement.textContent) || 0;
            percentElement.textContent = `${percent}%`;
            
            // Update progress bar
            const progressFill = item.querySelector('.progress-fill');
            progressFill.style.width = `${percent}%`;
            
            // Add animation if there's a change
            if (Math.abs(oldCount - voteCount) > 0) {
                animateNumberChange(voteCountElement, oldCount, voteCount);
            }
            if (Math.abs(oldPercent - percent) > 0) {
                animateNumberChange(percentElement, oldPercent, percent);
            }
        });
    }

    // Animate number changes smoothly
    function animateNumberChange(element, from, to) {
        let current = from;
        const increment = to > from ? 1 : -1;
        const stepTime = Math.max(1, 1000 / Math.abs(to - from));
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment === 1 && current >= to) || (increment === -1 && current <= to)) {
                clearInterval(timer);
            }
            
            if (element.classList.contains('vote-percent')) {
                element.textContent = `${current}%`;
            } else {
                element.textContent = `${current} vote${current !== 1 ? 's' : ''}`;
            }
        }, stepTime);
    }

    // Animate vote changes with visual feedback
    function animateVoteChanges(newVotes) {
        document.querySelectorAll('.vote-item').forEach(item => {
            const optionIndex = parseInt(item.dataset.option);
            const oldCount = votesData[optionIndex] || 0;
            const newCount = newVotes[optionIndex] || 0;
            
            if (newCount > oldCount) {
                const optionLetter = item.querySelector('.option-letter');
                optionLetter.classList.add('animate__animated', 'animate__bounce');
                setTimeout(() => {
                    optionLetter.classList.remove('animate__animated', 'animate__bounce');
                }, 1000);
            }
        });
    }

    // Calculate total votes
    function calculateTotalVotes(votes) {
        if (!votes) return 0;
        return Object.values(votes).reduce((total, count) => total + count, 0);
    }

    // Highlight the voted option
    function highlightVotedOption(optionIndex) {
        document.querySelectorAll('.vote-item').forEach(item => {
            item.classList.remove('voted');
        });
        
        const votedItem = document.querySelector(`.vote-item[data-option="${optionIndex}"]`);
        if (votedItem) {
            votedItem.classList.add('voted');
            votedItem.classList.add('animate__animated', 'animate__pulse');
            setTimeout(() => {
                votedItem.classList.remove('animate__animated', 'animate__pulse');
            }, 1000);
        }
    }

    // Initialize the voting system
    checkVotingStatus();
    setupVoteListener();
    setupVoteButtons();
    
    // Check for pending votes periodically
    setInterval(retryPendingVotes, 10000); // Check every 10 seconds
    window.addEventListener('online', retryPendingVotes);
});

// Add CSS for the voting interface
const style = document.createElement('style');
style.textContent = `
    /* Notification styles */
    .vote-notification {
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        padding: 20px;
        max-width: 300px;
        z-index: 1000;
        transform: translateY(20px);
        opacity: 0;
        animation: slideIn 0.5s forwards;
    }
    
    .notification-content {
        text-align: center;
    }
    
    .notification-content i {
        font-size: 3rem;
        color: #4CAF50;
        margin-bottom: 10px;
    }
    
    .notification-content h3 {
        margin: 10px 0;
        color: #4a6bff;
    }
    
    .notification-content p {
        margin-bottom: 15px;
    }
    
    .notification-progress {
        height: 5px;
        background: #f0f0f0;
        border-radius: 3px;
        margin-bottom: 15px;
        overflow: hidden;
    }
    
    .notification-progress-bar {
        height: 100%;
        background: linear-gradient(to right, #4a6bff, #ff6b4a);
        width: 0%;
    }
    
    .close-notification {
        background: #4a6bff;
        color: white;
        border: none;
        padding: 8px 20px;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .close-notification:hover {
        background: #3a56d4;
        transform: translateY(-2px);
    }
    
    /* Status messages */
    .vote-status {
        padding: 15px;
        margin: 15px 0;
        border-radius: 8px;
        text-align: center;
        font-weight: 500;
        display: none;
    }
    
    .vote-status.success {
        background-color: rgba(76, 175, 80, 0.15);
        color: #2e7d32;
        border: 1px solid rgba(76, 175, 80, 0.3);
    }
    
    .vote-status.error {
        background-color: rgba(244, 67, 54, 0.15);
        color: #c62828;
        border: 1px solid rgba(244, 67, 54, 0.3);
    }
    
    .vote-status.info {
        background-color: rgba(33, 150, 243, 0.15);
        color: #1565c0;
        border: 1px solid rgba(33, 150, 243, 0.3);
    }
    
    /* Monthly indicator */
    .monthly-vote-indicator {
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(10, 31, 92, 0.9);
        color: white;
        padding: 10px 15px;
        border-radius: 20px;
        font-size: 0.9rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 100;
        display: flex;
        align-items: center;
    }
    
    .monthly-vote-indicator i {
        margin-right: 8px;
        font-size: 1.1rem;
    }
    
    /* Animations */
    @keyframes slideIn {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(20px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Add monthly indicator to the page
const monthlyIndicator = document.createElement('div');
monthlyIndicator.className = 'monthly-vote-indicator animate__animated animate__fadeInUp';
const currentDate = new Date();
const monthName = currentDate.toLocaleString('default', { month: 'long' });
monthlyIndicator.innerHTML = `<i class="fas fa-calendar-alt"></i> ${monthName} Community Vote`;
document.body.appendChild(monthlyIndicator);