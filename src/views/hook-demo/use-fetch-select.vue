<script lang="ts" setup>
import { useFetchSelect } from "@/hooks/useFetchSelect"
import { getSelectDataApi } from "@/api/hook-demo/use-fetch-select"

const { loading, options, value } = useFetchSelect({
  api: getSelectDataApi
})
</script>

<template>
  <div class="app-container">
    <h4>
      This example is a demonstration: After automatically calling the api through the hook, get the data required by
      the Select component and pass it to the Select component
    </h4>
    <h5>Select Example</h5>
    <el-select :loading="loading" v-model="value" filterable>
      <el-option v-for="(item, index) in options" v-bind="item" :key="index" placeholder="Please select" />
    </el-select>
    <h5>Select V2 Example (If the amount of data is too much, you can choose this component)</h5>
    <el-select-v2 :loading="loading" v-model="value" :options="options" filterable placeholder="Please select" />
  </div>
</template>
