// Optional: wrapper around react-hot-toast for consistent styling
import toast from 'react-hot-toast'

export const showToast = {
  success: (msg) => toast.success(msg, { duration: 3000 }),
  error: (msg) => toast.error(msg, { duration: 4000 }),
  loading: (msg) => toast.loading(msg),
  dismiss: (toastId) => toast.dismiss(toastId),
}