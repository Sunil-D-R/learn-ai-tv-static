// YouTube Player API
let player;
function onYouTubeIframeAPIReady() {
    const videoId = document.getElementById('player')?.dataset?.videoId;
    if (!videoId) return;

    player = new YT.Player('player', {
        videoId: videoId,
        playerVars: {
            'playsinline': 1,
            'rel': 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    console.log('Player ready');
}

function onPlayerStateChange(event) {
    console.log('Player state changed:', event.data);
}

// Timestamp functionality
document.addEventListener('DOMContentLoaded', function() {
    const timestamps = document.querySelectorAll('.timestamp-link');
    timestamps.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const time = this.dataset.time;
            if (player && time) {
                const seconds = convertTimeToSeconds(time);
                player.seekTo(seconds, true);
                player.playVideo();
            }
        });
    });
});

function convertTimeToSeconds(timeStr) {
    const parts = timeStr.split(':').reverse();
    let seconds = 0;
    for (let i = 0; i < parts.length; i++) {
        seconds += parseInt(parts[i]) * Math.pow(60, i);
    }
    return seconds;
}

// Course filtering
function filterCourses(category) {
    const courses = document.querySelectorAll('.course-card');
    const filterButtons = document.querySelectorAll('.category-filter');
    
    // Update active filter button
    filterButtons.forEach(btn => {
        if (btn.dataset.category === category) {
            btn.classList.add('bg-primary-600', 'text-white');
            btn.classList.remove('bg-gray-200', 'text-gray-700');
        } else {
            btn.classList.remove('bg-primary-600', 'text-white');
            btn.classList.add('bg-gray-200', 'text-gray-700');
        }
    });

    // Filter courses
    courses.forEach(course => {
        if (category === 'all' || course.dataset.categories.includes(category)) {
            course.classList.remove('hidden');
        } else {
            course.classList.add('hidden');
        }
    });
}
