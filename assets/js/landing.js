document.addEventListener('DOMContentLoaded', () => {
    // Get the video button
    const videoButton = document.getElementById('video-btn');

    // Check if the button exists
    if (videoButton) {
        // Add click event listener to the button
        videoButton.addEventListener('click', () => {
            // Redirect to the index.html page
            window.location.href = '/video';
        });
    }
});
