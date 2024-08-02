import { ref } from "vue"

export function useFocus() {
  /** Is there focus */
  const isFocus = ref<boolean>(false)

  /** Lost focus */
  const handleBlur = () => {
    isFocus.value = false
  }
  /** Get focus */
  const handleFocus = () => {
    isFocus.value = true
  }

  return { isFocus, handleBlur, handleFocus }
}
