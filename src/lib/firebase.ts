// Mock Firebase configuration for development
// This avoids the undici module issue

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'demo-app-id',
};

const USER_KEY = 'mock_firebase_user';

function saveUserToStorage(user: any) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

function loadUserFromStorage() {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

export const auth = {
  get currentUser() {
    return loadUserFromStorage();
  },
  onAuthStateChanged: (callback: (user: any) => void) => {
    // Call immediately with current state
    callback(loadUserFromStorage());
    // Listen for storage changes (cross-tab)
    const handler = () => callback(loadUserFromStorage());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  },
  signInWithEmailAndPassword: async (email: string, password: string) => {
    const user = { uid: 'mock-user-id', email, displayName: email.split('@')[0], metadata: { creationTime: new Date().toISOString() } };
    saveUserToStorage(user);
    return { user };
  },
  createUserWithEmailAndPassword: async (email: string, password: string) => {
    const user = { uid: 'mock-user-id', email, displayName: email.split('@')[0], metadata: { creationTime: new Date().toISOString() } };
    saveUserToStorage(user);
    return { user };
  },
  signOut: async () => {
    saveUserToStorage(null);
    return Promise.resolve();
  },
  signInWithPopup: async (provider: any) => {
    const user = { uid: 'mock-google-user-id', email: 'user@example.com', displayName: 'Demo User', metadata: { creationTime: new Date().toISOString() } };
    saveUserToStorage(user);
    return { user };
  },
};

export const db = {
  collection: (path: string) => ({
    doc: (id: string) => ({
      get: async () => ({ data: () => null, exists: false }),
      set: async (data: any) => Promise.resolve(),
      update: async (data: any) => Promise.resolve(),
      delete: async () => Promise.resolve(),
    }),
    add: async (data: any) => Promise.resolve({ id: 'mock-doc-id' }),
    get: async () => ({ docs: [] }),
  }),
};

export const storage = {
  ref: (path: string) => ({
    put: async (file: File) => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('mock-url') } }),
    getDownloadURL: async () => Promise.resolve('mock-url'),
  }),
};

export default { firebaseConfig: {} }; 