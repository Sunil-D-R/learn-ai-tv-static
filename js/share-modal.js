// Only initialize share functionality if elements exist
document.addEventListener('DOMContentLoaded', function() {
    const shareButton = document.getElementById('share-button');
    const shareModal = document.getElementById('share-modal');
    const closeModal = document.getElementById('close-modal');
    
    if (shareButton && shareModal) {
        shareButton.addEventListener('click', function(e) {
            e.preventDefault();
            shareModal.classList.toggle('hidden');
        });

        if (closeModal) {
            closeModal.addEventListener('click', function() {
                shareModal.classList.add('hidden');
            });
        }

        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === shareModal) {
                shareModal.classList.add('hidden');
            }
        });
    }
});
