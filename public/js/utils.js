// Utility functions for the Unlocked Library platform

// Date formatting
const dateUtils = {
    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    },

    timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60,
            second: 1
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
            }
        }
        return 'just now';
    }
};

// File handling
const fileUtils = {
    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    },

    getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
    },

    isValidVideoFile(file) {
        const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        return validTypes.includes(file.type);
    },

    generateThumbnail(videoFile) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            video.onloadeddata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg'));
            };

            video.src = URL.createObjectURL(videoFile);
        });
    }
};

// Form validation
const validationUtils = {
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    validatePassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(password);
    },

    validateUsername(username) {
        // 3-20 characters, letters, numbers, underscores
        return /^[a-zA-Z0-9_]{3,20}$/.test(username);
    },

    getPasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    }
};

// UI helpers
const uiUtils = {
    showLoading(element) {
        element.classList.add('loading');
        element.innerHTML = `
            <div class="loading-spinner">
                <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        `;
    },

    hideLoading(element, originalContent) {
        element.classList.remove('loading');
        element.innerHTML = originalContent;
    },

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded shadow-lg ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white transform transition-transform duration-300 translate-y-full`;
        
        toast.innerHTML = message;
        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateY(0)';
        }, 10);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateY(full)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(
            () => this.showToast('Copied to clipboard!'),
            () => this.showToast('Failed to copy text', 'error')
        );
    }
};

// Local storage wrapper
const storageUtils = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    },

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultValue;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    },

    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Error clearing localStorage:', e);
            return false;
        }
    }
};

// Export utilities
window.dateUtils = dateUtils;
window.fileUtils = fileUtils;
window.validationUtils = validationUtils;
window.uiUtils = uiUtils;
window.storageUtils = storageUtils;
