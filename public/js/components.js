// Rich Text Editor Configuration
class RichTextEditor {
    constructor(elementId) {
        this.elementId = elementId;
        this.element = document.getElementById(elementId);
        this.init();
    }

    init() {
        // Create a div for Quill to attach to
        const editorContainer = document.createElement('div');
        editorContainer.style.height = '300px';
        this.element.appendChild(editorContainer);

        // Initialize Quill
        this.editor = new Quill(editorContainer, {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'align': [] }],
                    ['link', 'image'],
                    ['clean']
                ]
            },
            placeholder: 'Start writing your content...'
        });

        // Handle dark mode
        if (window.document.documentElement.classList.contains('dark')) {
            editorContainer.classList.add('dark');
        }
    }

    getContent() {
        return this.editor.root.innerHTML;
    }

    setContent(content) {
        this.editor.root.innerHTML = content;
    }

    destroy() {
        // Clean up if needed
        this.editor = null;
        this.element.innerHTML = '';
    }
}

// Custom Video Player
class VideoPlayer {
    constructor(videoElement) {
        this.video = videoElement;
        this.container = this.createPlayerContainer();
        this.initializePlayer();
    }

    createPlayerContainer() {
        const container = document.createElement('div');
        container.className = 'video-player-container relative';
        this.video.parentNode.insertBefore(container, this.video);
        container.appendChild(this.video);
        return container;
    }

    initializePlayer() {
        // Add custom controls
        const controls = document.createElement('div');
        controls.className = 'video-controls absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4';
        
        controls.innerHTML = `
            <div class="flex items-center space-x-4">
                <button class="play-pause text-white">
                    <i class="fas fa-play"></i>
                </button>
                <div class="progress-bar flex-1 h-1 bg-gray-600 rounded cursor-pointer">
                    <div class="progress h-full bg-primary rounded" style="width: 0%"></div>
                </div>
                <div class="time text-white text-sm">0:00 / 0:00</div>
                <button class="volume text-white">
                    <i class="fas fa-volume-up"></i>
                </button>
                <button class="fullscreen text-white">
                    <i class="fas fa-expand"></i>
                </button>
            </div>
        `;

        this.container.appendChild(controls);
        this.initializeControls(controls);
    }

    initializeControls(controls) {
        const playPauseBtn = controls.querySelector('.play-pause');
        const progressBar = controls.querySelector('.progress-bar');
        const progress = controls.querySelector('.progress');
        const timeDisplay = controls.querySelector('.time');
        const volumeBtn = controls.querySelector('.volume');
        const fullscreenBtn = controls.querySelector('.fullscreen');

        // Play/Pause
        playPauseBtn.addEventListener('click', () => this.togglePlay());
        this.video.addEventListener('click', () => this.togglePlay());

        // Progress bar
        this.video.addEventListener('timeupdate', () => {
            const percent = (this.video.currentTime / this.video.duration) * 100;
            progress.style.width = `${percent}%`;
            timeDisplay.textContent = `${this.formatTime(this.video.currentTime)} / ${this.formatTime(this.video.duration)}`;
        });

        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.video.currentTime = percent * this.video.duration;
        });

        // Volume
        volumeBtn.addEventListener('click', () => {
            this.video.muted = !this.video.muted;
            volumeBtn.innerHTML = `<i class="fas fa-volume-${this.video.muted ? 'mute' : 'up'}"></i>`;
        });

        // Fullscreen
        fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    }

    togglePlay() {
        if (this.video.paused) {
            this.video.play();
            this.container.querySelector('.play-pause').innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            this.video.pause();
            this.container.querySelector('.play-pause').innerHTML = '<i class="fas fa-play"></i>';
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.container.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Search Component
class SearchComponent {
    constructor(options) {
        this.options = {
            searchInput: '#searchInput',
            resultsContainer: '#searchResults',
            types: ['videos', 'wiki'],
            ...options
        };
        
        this.init();
    }

    init() {
        this.searchInput = document.querySelector(this.options.searchInput);
        this.resultsContainer = document.querySelector(this.options.resultsContainer);
        
        this.searchInput.addEventListener('input', this.debounce(() => {
            this.performSearch(this.searchInput.value);
        }, 300));
    }

    async performSearch(query) {
        if (!query.trim()) {
            this.resultsContainer.innerHTML = '';
            return;
        }

        try {
            const results = await Promise.all(
                this.options.types.map(type => 
                    fetch(`/api/${type}/search?q=${encodeURIComponent(query)}`)
                        .then(res => res.json())
                )
            );

            this.displayResults(results);
        } catch (error) {
            console.error('Search failed:', error);
        }
    }

    displayResults(results) {
        const combinedResults = results.flat().sort((a, b) => 
            b.relevance - a.relevance
        );

        this.resultsContainer.innerHTML = combinedResults.map(result => `
            <div class="search-result p-4 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <div class="flex items-center">
                    ${result.type === 'video' ? `
                        <div class="w-32 h-20 bg-gray-200 rounded mr-4">
                            <img src="${result.thumbnailUrl}" alt="${result.title}" class="w-full h-full object-cover rounded">
                        </div>
                    ` : `
                        <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-4">
                            <i class="fas fa-book text-white"></i>
                        </div>
                    `}
                    <div>
                        <h4 class="font-semibold text-gray-900 dark:text-white">${result.title}</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-300">${result.description}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Export components
window.RichTextEditor = RichTextEditor;
window.VideoPlayer = VideoPlayer;
window.SearchComponent = SearchComponent;

// Initialize components when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize rich text editors
    document.querySelectorAll('[data-rich-editor]').forEach(element => {
        new RichTextEditor(element.id);
    });

    // Initialize video players
    document.querySelectorAll('[data-video-player]').forEach(element => {
        new VideoPlayer(element);
    });

    // Initialize search
    if (document.querySelector('#searchInput')) {
        new SearchComponent();
    }
});
