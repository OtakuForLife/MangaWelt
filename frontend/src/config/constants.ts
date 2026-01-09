/**
 * MangaWelt - Application-wide constants and configuration
 */

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  DEFAULT_BACKEND_URL: 'http://localhost:8000',
  ENDPOINTS: {
    BASE: '/api',
    PRODUCTS: '/api/products',
    FRANCHISES: '/api/franchises',
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please try again.',
  PRODUCT_NOT_FOUND: 'Product not found',
  FRANCHISE_NOT_FOUND: 'Franchise not found',
  LOAD_FAILED: 'Failed to load data',
  UNKNOWN_CONTENT_TYPE: 'Unknown content type',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  PRODUCT_TOGGLED: 'Product ownership updated',
  FRANCHISE_TOGGLED: 'Franchise bookmark updated',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  BACKEND_URL_KEY: 'backend_url',
  BACKEND_HOST_KEY: 'backend_host',
  BACKEND_PORT_KEY: 'backend_port',
  SYNC_ENABLED_KEY: 'sync_enabled',
} as const;
