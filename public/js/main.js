// API endpoints
const API = {
    auth: {
        login: '/api/auth/login',
        register: '/api/auth/register',
        profile: '/api/auth/profile'
    },
    videos: {
        upload: '/api/videos',
        list: '/api/videos',
        single: (id) => `/api/videos/${id}`,
        like: (id) => `/api/videos/${id}/like`,
        comment: (id) => `/api/videos/${id}/comments`
    },
    wiki: {
        create: '/api/wiki',
        list: '/api/wiki',
        single: (id) => `/api/wiki/${id}`,
        like: (id) => `/api/wiki/${id}/like`,
        revision: (id) => `/api/wiki/${id}/revisions`
    }
};

// Auth token management
const Auth = {
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user')),

    setToken(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this.updateUI();
    },

    clearToken() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.updateUI();
    },

    updateUI() {
        const authButtons = document.getElementById('authButtons');
        const userProfile = document.getElementById('userProfile');
        
        if (this.token) {
            authButtons.classList.add('hidden');
            userProfile.classList.remove('hidden');
            userProfile.querySelector('.username').textContent = this.user.username;
        } else {
            authButtons.classList.remove('hidden');
            userProfile.classList.add('hidden');
        }
    },

    getHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }
};

// API request handler
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                ...(Auth.token ? Auth.getHeaders() : {})
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        showError(error.message);
        throw error;
    }
}

// UI Components
const UI = {
    // Show toast notification
    showToast(message, type = 'success') {
        // Remove any existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());

        // Create new toast
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded shadow-lg transform transition-transform duration-300 translate-y-full z-50 ${
            type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Show toast with animation
        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-full');
        });

        // Hide and remove toast after delay
        setTimeout(() => {
            toast.classList.add('translate-y-full');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Show error message
    showError(message) {
        this.showToast(message, 'error');
    },

    // Show success message
    showSuccess(message) {
        this.showToast(message, 'success');
    },

    // Toggle modal
    toggleModal(modalId) {
        const modal = document.getElementById(modalId);
        const uploadModal = document.getElementById('uploadModal');
        
        if (modalId === 'uploadModal') {
            // If opening upload modal, just toggle it
            modal.classList.toggle('hidden');
        } else if (modalId === 'uploadVideoModal' || modalId === 'createWikiModal') {
            // If opening specific content modal, hide upload modal and show the specific one
            uploadModal.classList.add('hidden');
            modal.classList.remove('hidden');
        } else {
            // For other modals (login, register), just toggle them
            modal.classList.toggle('hidden');
        }
    }
};

// Authentication handlers
const AuthHandlers = {
    async login(event) {
        event.preventDefault();
        const form = event.target;
        const data = {
            username: form.username.value,
            password: form.password.value
        };

        try {
            const response = await apiRequest(API.auth.login, {
                method: 'POST',
                body: JSON.stringify(data)
            });

            Auth.setToken(response.token, response.user);
            UI.showSuccess('Logged in successfully');
            UI.toggleModal('loginModal');
        } catch (error) {
            UI.showError('Login failed: ' + error.message);
        }
    },

    async register(event) {
        event.preventDefault();
        const form = event.target;
        const data = {
            username: form.username.value,
            email: form.email.value,
            password: form.password.value
        };

        try {
            const response = await apiRequest(API.auth.register, {
                method: 'POST',
                body: JSON.stringify(data)
            });

            Auth.setToken(response.token, response.user);
            UI.showSuccess('Registered successfully');
            UI.toggleModal('registerModal');
        } catch (error) {
            UI.showError('Registration failed: ' + error.message);
        }
    },

    logout() {
        Auth.clearToken();
        UI.showSuccess('Logged out successfully');
        window.location.href = '/';
    }
};

// Video handlers
const VideoHandlers = {
    async upload(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        try {
            const response = await apiRequest(API.videos.upload, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${Auth.token}`
                }
            });

            UI.showSuccess('Video uploaded successfully');
            UI.toggleModal('uploadVideoModal');
            this.loadVideos(); // Refresh video list
        } catch (error) {
            UI.showError('Upload failed: ' + error.message);
        }
    },

    async loadVideos(page = 1) {
        try {
            const response = await apiRequest(`${API.videos.list}?page=${page}`);
            this.renderVideos(response.videos);
        } catch (error) {
            UI.showError('Failed to load videos');
        }
    },

    renderVideos(videos) {
        const container = document.getElementById('videoGrid');
        container.innerHTML = videos.map(video => `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <video class="w-full h-48 object-cover" src="${video.videoUrl}" poster="${video.thumbnailUrl}"></video>
                <div class="p-4">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${video.title}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300">${video.author.username}</p>
                    <div class="mt-2 flex items-center space-x-2">
                        <span>${video.views} views</span>
                        <span>•</span>
                        <span>${video.likes.length} likes</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
};

// Wiki handlers
const WikiHandlers = {
    editor: null,

    async create(event) {
        event.preventDefault();

        // Check if user is authenticated
        if (!Auth.token) {
            UI.showError('Please log in to create a wiki post');
            UI.toggleModal('createWikiModal');
            UI.toggleModal('loginModal');
            return;
        }

        const form = event.target;
        const title = form.title.value.trim();
        const content = WikiHandlers.editor.getContent().trim();
        const categories = form.categories.value.trim();
        const tags = form.tags.value.trim();

        // Validate form
        if (!title) {
            UI.showError('Please enter a title');
            return;
        }
        if (!content || content === '<p><br></p>') {
            UI.showError('Please enter some content');
            return;
        }
        if (!categories) {
            UI.showError('Please enter at least one category');
            return;
        }
        if (!tags) {
            UI.showError('Please enter at least one tag');
            return;
        }

        const data = {
            title,
            content,
            categories: categories.split(',').map(c => c.trim()),
            tags: tags.split(',').map(t => t.trim())
        };

        try {
            await apiRequest(API.wiki.create, {
                method: 'POST',
                body: JSON.stringify(data)
            });

            UI.showSuccess('Wiki post created successfully');
            UI.toggleModal('createWikiModal');
            form.reset(); // Reset form
            if (WikiHandlers.editor) {
                WikiHandlers.editor.setContent(''); // Clear editor
            }
            this.loadWikiPosts(); // Refresh wiki list
        } catch (error) {
            UI.showError('Failed to create wiki post: ' + error.message);
        }
    },

    async loadWikiPosts(page = 1) {
        try {
            const response = await apiRequest(`${API.wiki.list}?page=${page}`);
            this.renderWikiPosts(response.wikis);
        } catch (error) {
            UI.showError('Failed to load wiki posts');
        }
    },

    renderWikiPosts(posts) {
        const container = document.getElementById('wikiGrid');
        container.innerHTML = posts.map(post => `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">${post.title}</h3>
                <div class="mt-2 flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <span>By ${post.author.username}</span>
                    <span>•</span>
                    <span>${post.views} views</span>
                    <span>•</span>
                    <span>${post.likes.length} likes</span>
                </div>
                <div class="mt-4 space-x-2">
                    ${post.tags.map(tag => `
                        <span class="inline-block bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 text-sm">
                            ${tag}
                        </span>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }
};

// Content Feed Handler
const ContentFeed = {
    currentTab: 'all',
    currentType: 'videos',
    page: 1,
    loading: false,

    async init() {
        this.loadContent();
        this.updateUI();
    },

    switchTab(tab) {
        this.currentTab = tab;
        this.page = 1;
        this.updateUI();
        this.loadContent();
    },

    switchType(type) {
        this.currentType = type;
        this.page = 1;
        this.updateUI();
        this.loadContent();
    },

    updateUI() {
        // Update tab buttons
        document.querySelectorAll('[id$="Tab"]').forEach(btn => {
            btn.classList.remove('active-tab', 'bg-primary-500', 'text-white');
            btn.classList.add('bg-white', 'dark:bg-gray-800');
        });
        const activeTab = document.getElementById(`${this.currentTab}Tab`);
        if (activeTab) {
            activeTab.classList.add('active-tab', 'bg-primary-500', 'text-white');
            activeTab.classList.remove('bg-white', 'dark:bg-gray-800');
        }

        // Update type buttons
        document.querySelectorAll('[id$="Type"]').forEach(btn => {
            btn.classList.remove('active-type', 'bg-primary-500', 'text-white');
            btn.classList.add('bg-white', 'dark:bg-gray-800');
        });
        const activeType = document.getElementById(`${this.currentType}Type`);
        if (activeType) {
            activeType.classList.add('active-type', 'bg-primary-500', 'text-white');
            activeType.classList.remove('bg-white', 'dark:bg-gray-800');
        }
    },

    async loadContent() {
        if (this.loading) return;
        this.loading = true;

        try {
            const endpoint = this.currentType === 'videos' ? API.videos.list : API.wiki.list;
            const queryParams = new URLSearchParams({
                page: this.page,
                type: this.currentTab === 'my' ? 'user' : 'all'
            });

            const response = await apiRequest(`${endpoint}?${queryParams}`);
            
            if (this.page === 1) {
                document.getElementById('contentGrid').innerHTML = '';
            }

            if (this.currentType === 'videos') {
                this.renderVideos(response.videos);
            } else {
                this.renderWikis(response.wikis);
            }
        } catch (error) {
            UI.showError('Failed to load content');
        } finally {
            this.loading = false;
        }
    },

    renderVideos(videos) {
        const grid = document.getElementById('contentGrid');
        videos.forEach(video => {
            const card = document.createElement('div');
            card.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden';
            card.innerHTML = `
                <video class="w-full h-48 object-cover" src="${video.url}" poster="${video.thumbnail}"></video>
                <div class="p-4">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${video.title}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300">${video.description}</p>
                    <div class="mt-2 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>${video.author}</span>
                        <span>•</span>
                        <span>${video.views} views</span>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    },

    renderWikis(wikis) {
        const grid = document.getElementById('contentGrid');
        wikis.forEach(wiki => {
            const card = document.createElement('div');
            card.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6';
            card.innerHTML = `
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">${wiki.title}</h3>
                <div class="prose dark:prose-invert max-w-none mb-4">${wiki.excerpt}</div>
                <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>${wiki.author}</span>
                    <span>${wiki.lastModified}</span>
                </div>
                <div class="mt-4 flex flex-wrap gap-2">
                    ${wiki.tags.map(tag => `
                        <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                            ${tag}
                        </span>
                    `).join('')}
                </div>
            `;
            grid.appendChild(card);
        });
    },

    loadMore() {
        this.page++;
        this.loadContent();
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize auth state
    Auth.updateUI();

    // Initialize Content Feed
    ContentFeed.init();

    // Initialize Wiki Editor
    const wikiEditor = document.getElementById('wikiEditor');
    if (wikiEditor) {
        WikiHandlers.editor = new RichTextEditor('wikiEditor');
    }

    // Setup event listeners
    document.getElementById('loginForm')?.addEventListener('submit', AuthHandlers.login);
    document.getElementById('registerForm')?.addEventListener('submit', AuthHandlers.register);
    document.getElementById('logoutButton')?.addEventListener('click', AuthHandlers.logout);
    document.getElementById('uploadVideoForm')?.addEventListener('submit', VideoHandlers.upload);
    document.getElementById('createWikiForm')?.addEventListener('submit', WikiHandlers.create);

    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
        });
    }
});
