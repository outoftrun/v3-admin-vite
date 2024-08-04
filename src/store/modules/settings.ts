import { type Ref, ref, watch } from "vue"
import { defineStore } from "pinia"
import { type LayoutSettings, layoutSettings } from "@/config/layouts"
import { setConfigLayout } from "@/utils/cache/local-storage"

type SettingsStore = {
  // Use mapping type to traverse the key of the layoutSettings object
  [Key in keyof LayoutSettings]: Ref<LayoutSettings[Key]>
}

type SettingsStoreKey = keyof SettingsStore

export const useSettingsStore = defineStore("settings", () => {
  /** Status object */
  const state = {} as SettingsStore
  // Traverse the key-value pairs of the layoutSettings object
  for (const [key, value] of Object.entries(layoutSettings)) {
    // Use type assertion to specify the type of key and wrap value in ref In the function, create a responsive variable
    const refValue = ref(value)
    // @ts-ignore
    state[key as SettingsStoreKey] = refValue
    // Monitor each responsive variable
    watch(refValue, () => {
      // Cache
      const settings = _getCacheData()
      setConfigLayout(settings)
    })
  }
  /** Get the data to be cached: convert the state object into a settings object */
  const _getCacheData = () => {
    const settings = {} as LayoutSettings
    for (const [key, value] of Object.entries(state)) {
      // @ts-ignore
      settings[key as SettingsStoreKey] = value.value
    }
    return settings
  }

  return state
})
