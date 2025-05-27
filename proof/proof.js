document.addEventListener('DOMContentLoaded', function() {
    // Configuration - Update these values when you change the file
    const CURRENT_MONTH = "June";  // Change the month name here
    const CURRENT_YEAR = "2024";   // Change the year here
    const PDF_FILE = "donation_proof.pdf"; // Your PDF filename
    
    const downloadBtn = document.getElementById('downloadBtn');
    
    downloadBtn.addEventListener('click', function() {
        // Create temporary download link
        const link = document.createElement('a');
        link.href = PDF_FILE;
        link.download = `proof_of_donation_${CURRENT_MONTH}_${CURRENT_YEAR}.pdf`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Redirect after short delay
        setTimeout(() => {
            window.location.href = "/home/";
        }, 500);
    });
    
    // Optional: Auto-start download after 2 seconds
    // setTimeout(() => downloadBtn.click(), 2000);
});