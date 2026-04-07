import toast from 'react-hot-toast'

export const useToast = () => {
  const showSuccess = (message) => toast.success(message)
  const showError = (message) => toast.error(message)
  const showLoading = (message) => toast.loading(message)
  const dismiss = (id) => toast.dismiss(id)

  return { showSuccess, showError, showLoading, dismiss }
}