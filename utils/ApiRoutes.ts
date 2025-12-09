// Base URL of your backend
export const HOST = "https://render-backend-ksnp.onrender.com" as const;

// Grouped base route segments for different API modules
const AUTH_ROUTE = `${HOST}/api/auth` as const;
const MESSAGES_ROUTE = `${HOST}/api/messages` as const;

// ---- AUTH ROUTES ----
export const ONBOARD_USER_ROUTE = `${AUTH_ROUTE}/onboarduser` as const;

export const GET_USER_BY_FIREBASE = `${AUTH_ROUTE}/user` as const;


export const CHECK_USER_ROUTE = `${AUTH_ROUTE}/check-user` as const;
export const GET_ALL_CONTACTS = `${AUTH_ROUTE}/get-contacts` as const;
export const GET_CALL_TOKEN = `${AUTH_ROUTE}/generate-token` as const;

// ---- MESSAGE ROUTES ----
export const ADD_MESSAGE_ROUTE = `${MESSAGES_ROUTE}/add-message` as const;
export const GET_MESSAGES_ROUTE = `${MESSAGES_ROUTE}/get-messages` as const;
export const GET_INITIAL_CONTACTS_ROUTE = `${MESSAGES_ROUTE}/get-initial-contacts` as const;
export const ADD_AUDIO_MESSAGE_ROUTE = `${MESSAGES_ROUTE}/add-audio-message` as const;
export const ADD_IMAGE_MESSAGE_ROUTE = `${MESSAGES_ROUTE}/add-image-message` as const;


// ---- OPTIONAL: export everything as a typed object ----
export interface ApiRoutes {
  HOST: string;

  ONBOARD_USER_ROUTE: string;
  CHECK_USER_ROUTE: string;
  GET_ALL_CONTACTS: string;
  GET_CALL_TOKEN: string;

  ADD_MESSAGE_ROUTE: string;
  GET_MESSAGES_ROUTE: string;
  GET_INITIAL_CONTACTS_ROUTE: string;
  ADD_AUDIO_MESSAGE_ROUTE: string;
  ADD_IMAGE_MESSAGE_ROUTE: string;
}

export const API_ROUTES: ApiRoutes = {
  HOST,

  ONBOARD_USER_ROUTE,
  CHECK_USER_ROUTE,
  GET_ALL_CONTACTS,
  GET_CALL_TOKEN,

  ADD_MESSAGE_ROUTE,
  GET_MESSAGES_ROUTE,
  GET_INITIAL_CONTACTS_ROUTE,
  ADD_AUDIO_MESSAGE_ROUTE,
  ADD_IMAGE_MESSAGE_ROUTE,
} as const;
