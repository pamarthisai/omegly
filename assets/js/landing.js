document.addEventListener('DOMContentLoaded', () => {
    const videoButton = document.getElementById('video-btn');
    
    if (videoButton) {
        videoButton.addEventListener('click', () => {
            window.location.href = '/video'; // Ensure this path is correct
        });
    }
});
