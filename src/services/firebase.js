import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
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

// ─── Email / Password ─────────────────────────────────────────────────────────
export const signUpWithEmail = async (email, password, displayName) => {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(result.user, { displayName })
  return result.user
}

export const signInWithEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

// ─── Google Sign-In ───────────────────────────────────────────────────────────
export const signInWithGoogle = async () => {
  try {
    if (isNative()) {
      // Dynamically import to avoid errors in web builds
      const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')

      const nativeResult = await FirebaseAuthentication.signInWithGoogle()

      const idToken     = nativeResult?.credential?.idToken
      const accessToken = nativeResult?.credential?.accessToken

      if (idToken) {
        // Sign in the web Firebase SDK so onAuthStateChanged fires
        const credential = GoogleAuthProvider.credential(idToken, accessToken ?? undefined)
        const result = await signInWithCredential(auth, credential)
        return { user: result.user, error: null }
      }

      // skipNativeAuth:false path — native SDK already signed in; check web SDK user
      // The bridge may have already synced the session
      if (auth.currentUser) {
        return { user: auth.currentUser, error: null }
      }

      // Last resort: wait briefly for onAuthStateChanged to propagate the session
      return await new Promise((resolve) => {
        const unsub = auth.onAuthStateChanged((u) => {
          unsub()
          if (u) resolve({ user: u, error: null })
          else   resolve({ user: null, error: 'Google sign-in failed. Please try again.' })
        })
        // Timeout after 5 s
        setTimeout(() => {
          unsub()
          resolve({ user: null, error: 'Sign-in timed out. Please try again.' })
        }, 5000)
      })
    }

    // ── Web (popup) ────────────────────────────────────────────────────────────
    const result = await signInWithPopup(auth, googleProvider)
    return { user: result.user, error: null }

  } catch (error) {
    // Swallow user-cancelled errors silently
    if (
      error?.code === 'SIGN_IN_CANCELLED' ||
      error?.message?.includes('SIGN_IN_CANCELLED') ||
      error?.code === 'auth/popup-closed-by-user' ||
      error?.message?.includes('popup-closed-by-user')
    ) {
      return { user: null, error: null }
    }

    console.error('Google Sign-In error:', error)
    // Provide a friendly message instead of the raw Firebase/plugin error
    const friendly =
      error?.code === 'auth/network-request-failed'
        ? 'No internet connection. Please check your network and try again.'
        : error?.message?.includes('developer_error') || error?.message?.includes('10:')
        ? 'Google sign-in is not configured correctly. Check SHA-1 in Firebase console.'
        : error?.message ?? 'Something went wrong. Please try again.'

    return { user: null, error: friendly }
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = async () => {
  if (isNative()) {
    try {
      const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
      await FirebaseAuthentication.signOut()
    } catch (e) {
      console.warn('Native sign-out error (ignored):', e)
    }
  }
  await signOut(auth)
}
