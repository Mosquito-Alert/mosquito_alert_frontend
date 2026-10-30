import { ref } from 'vue'

// Tracks loading/error state for a component and ignores responses from superseded requests.
export const useLatestRequest = () => {
  const loading = ref(false)
  const error = ref(false)
  let requestId = 0

  const run = async <T>(fetcher: () => Promise<T>, onSuccess: (result: T) => void) => {
    const id = ++requestId
    loading.value = true
    error.value = false
    try {
      const result = await fetcher()
      if (id === requestId) onSuccess(result)
    } catch {
      if (id === requestId) error.value = true
    } finally {
      if (id === requestId) loading.value = false
    }
  }

  // Invalidate any in-flight request, e.g. when the filters become incomplete.
  const cancel = () => {
    requestId++
    loading.value = false
  }

  return { loading, error, run, cancel }
}
