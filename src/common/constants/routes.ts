/**
 * Centralized API route constants.
 * These MUST match between backend controllers and frontend API client.
 *
 * All routes are relative to the global prefix: /api/v1/
 */
export const API_ROUTES = {
  // ─── Auth ──────────────────────────────────────────
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },

  // ─── Users (Onboarding) ───────────────────────────
  USERS: {
    REGISTER: '/users/register',
    VERIFY_OTP: '/users/verify-otp',
    VERIFY_BIOMETRIC: '/users/verify-biometric',
    SET_PIN: '/users/set-pin',
    ASSIGN_STAFF: '/users/staff/assign',
    BY_ID: '/users/:id',
    CHECK_USERNAME: '/users/check-username/:username',
    CHECK_PHONE: '/users/check-phone',
    RESEND_OTP: '/users/resend-otp',
  },

  // ─── Profiles ─────────────────────────────────────
  PROFILES: {
    CREATE: '/profiles',
    BY_ID: '/profiles/:id',
    BY_USER: '/profiles/user/:userId',
    BY_ENTITY: '/profiles/entity/:entityId',
    UPDATE: '/profiles/:id',
    DELETE: '/profiles/:id',
    VISIBILITY: '/profiles/:profileId/visibility',
    INTERACTION: '/profiles/:profileId/interaction-preferences',
  },

  // ─── Entities ─────────────────────────────────────
  ENTITIES: {
    CREATE_INDIVIDUAL: '/entities/individual',
    CREATE_OTHER: '/entities/other',
    CREATE_BRANCHES: '/entities/branches',
    BY_ID: '/entities/:id',
    BY_OWNER: '/entities/owner/:ownerId',
    BRANCHES: '/entities/:entityId/branches',
  },

  // ─── QPoints ──────────────────────────────────────
  QPOINTS: {
    DEPOSIT: '/qpoints/transactions/deposit',
    TRANSFER: '/qpoints/transactions/transfer',
    WITHDRAW: '/qpoints/transactions/withdraw',
    TRANSACTIONS: '/qpoints/transactions',
    REVIEW_FRAUD: '/qpoints/transactions/review-fraud',
  },

  // ─── Products ─────────────────────────────────────
  PRODUCTS: {
    CREATE: '/products',
    LIST: '/products',
    SEARCH: '/products/search',
    BY_ID: '/products/:id',
    UPDATE: '/products/:id',
    DELETE: '/products/:id',
    UPDATE_STOCK: '/products/:id/stock',
    VIEW: '/products/:id/view',
    RATE: '/products/:id/rating',
    MEDIA: '/products/media',
    DISCOUNTS: '/products/discounts',
    DELIVERY_ZONES: '/products/delivery-zones',
    SOS: '/products/sos',
  },

  // ─── Orders ───────────────────────────────────────
  ORDERS: {
    CREATE: '/orders',
    BY_ID: '/orders/:id',
    BY_USER: '/orders/user/:userId',
    ITEMS: '/orders/:id/items',
    UPDATE_STATUS: '/orders/:id/status',
    START_FULFILLMENT: '/orders/:id/fulfillment/start',
    COMPLETE_FULFILLMENT: '/orders/fulfillment/:sessionId/complete',
    RETURNS: '/orders/returns',
    DELIVERY: '/orders/:id/delivery',
    PACKAGES: '/orders/packages',
  },

  // ─── Vehicles ─────────────────────────────────────
  VEHICLES: {
    CREATE: '/vehicles',
    LIST: '/vehicles',
    BY_ID: '/vehicles/:id',
    UPDATE: '/vehicles/:id',
    DELETE: '/vehicles/:id',
    STATUS: '/vehicles/:id/status',
    BANDS: '/vehicles/bands',
    ASSIGNMENTS: '/vehicles/assignments',
    MEDIA: '/vehicles/media',
    PRICING: '/vehicles/pricing',
  },

  // ─── Rides ────────────────────────────────────────
  RIDES: {
    CREATE: '/rides',
    BY_ID: '/rides/:id',
    BY_USER: '/rides/user/:userId',
    ASSIGN_DRIVER: '/rides/:id/assign-driver',
    UPDATE_STATUS: '/rides/:id/status',
    TRACKING: '/rides/:id/tracking',
    FEEDBACK: '/rides/feedback',
    SOS: '/rides/sos',
    REFERRALS: '/rides/referrals',
  },

  // ─── Social ───────────────────────────────────────
  SOCIAL: {
    HEYYA: '/social/heyya',
    HEYYA_RESPOND: '/social/heyya/:id/respond',
    CHAT_SESSIONS: '/social/chat/sessions',
    CHAT_MESSAGES: '/social/chat/messages',
    UPDATES: '/social/updates',
    COMMENTS: '/social/comments',
    ENGAGEMENTS: '/social/engagements',
  },

  // ─── Calendar ─────────────────────────────────────
  CALENDAR: {
    CREATE: '/calendar',
    LIST: '/calendar',
    BY_ID: '/calendar/:id',
    UPCOMING: '/calendar/upcoming',
    RECURRING: '/calendar/recurring',
    DATE_RANGE: '/calendar/date-range',
  },

  // ─── Planner ──────────────────────────────────────
  PLANNER: {
    TRANSACTIONS: '/planner/transactions',
    BY_TYPE: '/planner/transactions/type/:type',
    MONTHLY: '/planner/transactions/month',
    SUMMARY: '/planner/summary',
    MONTHLY_SUMMARY: '/planner/summary/monthly',
  },

  // ─── Statement ────────────────────────────────────
  STATEMENT: {
    CREATE: '/statement',
    GET: '/statement',
    UPDATE: '/statement',
    DELETE: '/statement',
    EXISTS: '/statement/exists',
  },

  // ─── Wishlist ─────────────────────────────────────
  WISHLIST: {
    CREATE: '/wishlist',
    LIST: '/wishlist',
    BY_ID: '/wishlist/:id',
    BY_STATUS: '/wishlist/status/:status',
    BY_CATEGORY: '/wishlist/category/:category',
    HIGH_PRIORITY: '/wishlist/high-priority',
    TOTAL_VALUE: '/wishlist/total-value',
    PURCHASE: '/wishlist/:id/purchase',
  },

  // ─── Interests ────────────────────────────────────
  INTERESTS: {
    FAVORITE_SHOPS: '/interests/favorite-shops',
    INTERESTS: '/interests/interests',
    CONNECTION_REQUESTS: '/interests/connection-requests',
    CONNECTIONS: '/interests/connections/:userId',
  },

  // ─── Places ───────────────────────────────────────
  PLACES: {
    CREATE: '/places',
    LIST: '/places',
    SEARCH: '/places/search',
    BY_CATEGORY: '/places/category/:category',
    NEARBY: '/places/nearby',
    BY_ID: '/places/:id',
    VERIFY: '/places/:id/verify',
    RATE: '/places/:id/rate',
  },

  // ─── Subscriptions ────────────────────────────────
  SUBSCRIPTIONS: {
    PLANS: '/subscriptions/plans',
    ACTIVATE: '/subscriptions/activate',
    ACTIVE: '/subscriptions/active/:targetType/:targetId',
    CANCEL: '/subscriptions/:id/cancel',
    RENEW: '/subscriptions/renew',
  },

  // ─── AI ───────────────────────────────────────────
  AI: {
    MODELS: '/ai/models',
    INFERENCES: '/ai/inferences',
    FEATURES: '/ai/features',
    RECOMMENDATIONS: '/ai/recommendations',
    WORKFLOWS: '/ai/workflows',
    EVENTS: '/ai/events',
  },

  // ─── Health ───────────────────────────────────────
  HEALTH: {
    CHECK: '/health',
    READY: '/health/ready',
    LIVE: '/health/live',
  },
} as const;
