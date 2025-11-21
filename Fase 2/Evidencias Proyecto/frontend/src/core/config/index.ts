// Application Configuration
export const APP_CONFIG = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  APP_NAME: "React App",
  VERSION: "1.0.0",
  ENVIRONMENT: import.meta.env.MODE,

  // Feature flags
  FEATURES: {
    EVALUACION: true,
    USUARIO: true,
  },

  // UI Configuration
  UI: {
    THEME: "light",
    SIDEBAR_COLLAPSED: false,
    ITEMS_PER_PAGE: 10,
  },

  // API Configuration
  API: {
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
  },
};

export default APP_CONFIG;
