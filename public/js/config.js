// Frontend Configuration for The Unlocked Library

const config = {
    // API Configuration
    api: {
        baseUrl: '/api',
        timeout: 30000, // 30 seconds
        retryAttempts: 3,
        endpoints: {
            auth: {
                login: '/auth/login',
                register: '/auth/register',
                logout: '/auth/logout',
                profile: '/auth/profile'
            },
            videos: {
                upload: '/videos',
                list: '/videos',
                search: '/videos/search',
                trending: '/videos/trending'
            },
            wiki: {
                create: '/wiki',
                list: '/wiki',
                search: '/wiki/search',
                popular: '/wiki/popular'
            }
        }
    },

    // Upload Configuration
    upload: {
        maxVideoSize: 100 * 1024 * 1024, // 100MB
        allowedVideoTypes: ['video/mp4', 'video/webm', 'video/ogg'],
        maxThumbnailSize: 5 * 1024 * 1024, // 5MB
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif']
    },

    // UI Configuration
    ui: {
        themes: {
            light: {
                primary: '#FF4B4B',
                secondary: '#1A1A1A',
                background: '#FFFFFF',
                text: '#1A1A1A',
                border: '#E5E7EB'
            },
            dark: {
                primary: '#FF4B4B',
                secondary: '#FFFFFF',
                background: '#1A1A1A',
                text: '#FFFFFF',
                border: '#374151'
            }
        },
        animations: {
            transition: 'all 0.3s ease',
            hover: 'transform 0.2s ease'
        },
        breakpoints: {
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
            '2xl': '1536px'
        }
    },

    // Feature Flags
    features: {
        darkMode: true,
        videoComments: true,
        wikiRevisions: true,
        socialSharing: true,
        notifications: true
    },

    // Content Configuration
    content: {
        maxTitleLength: 100,
        maxDescriptionLength: 2000,
        maxTagsPerPost: 10,
        maxCategoriesPerPost: 5,
        defaultThumbnail: '/images/default-thumbnail.jpg',
        defaultAvatar: '/images/default-avatar.jpg'
    },

    // Editor Configuration
    editor: {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['clean']
        ],
        placeholder: 'Start writing your content...',
        theme: 'snow'
    },

    // Political Symbols Configuration
    politicalSymbols: [
        {
            name: 'USSR Hammer and Sickle',
            image: '/images/symbols/ussr-hammer-sickle.png',
            description: 'Symbol of the Soviet Union'
        },
        // Add more political symbols here
    ],

    // Error Messages
    errors: {
        network: 'Network error. Please check your connection.',
        unauthorized: 'Please login to continue.',
        forbidden: 'You do not have permission to perform this action.',
        notFound: 'The requested resource was not found.',
        validation: 'Please check your input and try again.',
        upload: 'Error uploading file. Please try again.',
        default: 'An unexpected error occurred. Please try again.'
    }
};

// Custom Tailwind CSS Configuration
const tailwindConfig = {
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fff1f1',
                    100: '#ffe0e0',
                    200: '#ffc5c5',
                    300: '#ff9b9b',
                    400: '#ff6262',
                    500: '#ff4b4b',
                    600: '#ff1414',
                    700: '#db0000',
                    800: '#b40000',
                    900: '#920000'
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                heading: ['Poppins', 'sans-serif']
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out'
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' }
                },
                slideDown: {
                    '0%': { transform: 'translateY(-20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' }
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.9)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' }
                }
            }
        }
    },
    variants: {
        extend: {
            opacity: ['dark'],
            backgroundColor: ['dark', 'dark-hover'],
            textColor: ['dark', 'dark-hover'],
            borderColor: ['dark']
        }
    }
};

// Initialize configuration
window.appConfig = config;
window.tailwindConfig = tailwindConfig;

// Apply Tailwind configuration
if (window.tailwind) {
    window.tailwind.config = tailwindConfig;
}
