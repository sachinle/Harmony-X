import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithCredential,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

const isNative = () =>
  typeof window !== 'undefined' &&
  !!window.Capacitor?.isNativePlatform?.()

// Email/Password
export const signUpWithEmail = async (email, password, displayName) => {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(result.user, { displayName })
  return result.user
}

export const signInWithEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

// Google
export const signInWithGoogle = async () => {
  try {
    if (isNative()) {
      const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
      const nativeResult = await FirebaseAuthentication.signInWithGoogle()

      const idToken = nativeResult.credential?.idToken
      if (!idToken) throw new Error('No idToken returned')

      const credential = GoogleAuthProvider.credential(idToken)
      const result = await signInWithCredential(auth, credential)
      return { user: result.user, error: null }
    } else {
      const result = await signInWithPopup(auth, googleProvider)
      return { user: result.user, error: null }
    }
  } catch (error) {
    if (
      error?.code === 'SIGN_IN_CANCELLED' ||
      error?.message?.includes('SIGN_IN_CANCELLED') ||
      error?.code === 'auth/popup-closed-by-user'
    ) return { user: null, error: null }

    console.error('Google Sign-In error:', error)
    return { user: null, error: error.message }
  }
}

// Logout
export const logout = async () => {
  if (isNative()) {
    try {
      const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
      await FirebaseAuthentication.signOut()
    } catch {}
  }
  await signOut(auth)
}