<script lang="ts" setup>
import { watchEffect } from "vue"
import { storeToRefs } from "pinia"
import { useSettingsStore } from "@/store/modules/settings"
import { useLayoutMode } from "@/hooks/useLayoutMode"
import { resetConfigLayout } from "@/utils"
import SelectLayoutMode from "./SelectLayoutMode.vue"
import { Refresh } from "@element-plus/icons-vue"

const { isLeft } = useLayoutMode()
const settingsStore = useSettingsStore()

/** Use storeToRefs to keep the fetched properties responsive */
const {
  showTagsView,
  showLogo,
  fixedHeader,
  showFooter,
  showNotify,
  showThemeSwitch,
  showScreenfull,
  showSearchMenu,
  cacheTagsView,
  showWatermark,
  showGreyMode,
  showColorWeakness
} = storeToRefs(settingsStore)

/** Define switch settings */
const switchSettings = {
  "Show tab bar": showTagsView,
  "Show Logo": showLogo,
  "Fixed Header": fixedHeader,
  "Show Footer": showFooter,
  "Show message notification": showNotify,
  "Show theme switch button": showThemeSwitch,
  "Show full screen button": showScreenfull,
  "Show search button": showSearchMenu,
  "Whether to cache tab bar": cacheTagsView,
  "Enable system watermark": showWatermark,
  "Show gray mode": showGreyMode,
  "Show color weakness mode": showColorWeakness
}

/** When not in left mode, the Header is in fixed layout */
watchEffect(() => {
  !isLeft.value && (fixedHeader.value = true)
})
</script>

<template>
  <div class="setting-container">
    <h4>Layout Configuration</h4>
    <SelectLayoutMode />
    <el-divider />
    <h4>Function Configuration</h4>
    <div class="setting-item" v-for="(settingValue, settingName, index) in switchSettings" :key="index">
      <span class="setting-name">{{ settingName }}</span>
      <el-switch v-model="settingValue.value" :disabled="!isLeft && settingName === 'Fix Header'" />
    </div>
    <el-button type="danger" :icon="Refresh" @click="resetConfigLayout">Reset</el-button>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/mixins.scss";

.setting-container {
  padding: 20px;
  .setting-item {
    font-size: 14px;
    color: var(--el-text-color-regular);
    padding: 5px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .setting-name {
      @extend %ellipsis;
    }
  }
  .el-button {
    margin-top: 40px;
    width: 100%;
  }
}
</style>
