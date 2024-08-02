<script lang="ts" setup>
import { useTheme } from "@/hooks/useTheme"
import { ElNotification } from "element-plus"
// 将 Element Plus 的语言设置为中文
import zhCn from "element-plus/es/locale/lang/zh-cn"

const { initTheme } = useTheme()
/** Initialize the theme */
initTheme()

/** The author's careful thoughts */
ElNotification({
  title: "Hello",
  type: "success",
  dangerouslyUseHTMLString: true,
  message:
    "<a style='color: teal' target='_blank' href='https://github.com/un-pany/v3-admin-vite'>It's not easy to get a star for a small project. If you like this project, please click here to support a star! This is the only motivation for the author to continue to maintain it (whisper: after all, it's free)</a>",
  duration: 0,
  position: "bottom-right"
})
</script>

<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>
