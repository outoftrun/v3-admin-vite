<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { createTableDataApi, deleteTableDataApi, updateTableDataApi, getTableDataApi } from "@/api/table"
import { type CreateOrUpdateTableRequestData, type TableData } from "@/api/table/types/table"
import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, CirclePlus, Delete, Download, RefreshRight } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { cloneDeep } from "lodash-es"

defineOptions({
  // Name the current component
  name: "ElementPlus"
})

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region increase
const DEFAULT_FORM_DATA: CreateOrUpdateTableRequestData = {
  id: undefined,
  username: "",
  password: ""
}
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const formData = ref<CreateOrUpdateTableRequestData>(cloneDeep(DEFAULT_FORM_DATA))
const formRules: FormRules<CreateOrUpdateTableRequestData> = {
  username: [{ required: true, trigger: "blur", message: "please enter user name" }],
  password: [{ required: true, trigger: "blur", message: "Please enter your password" }]
}
const handleCreateOrUpdate = () => {
  formRef.value?.validate((valid: boolean, fields) => {
    if (!valid) return console.error("Form validation failed", fields)
    loading.value = true
    const api = formData.value.id === undefined ? createTableDataApi : updateTableDataApi
    api(formData.value)
      .then(() => {
        ElMessage.success("Successful operation")
        dialogVisible.value = false
        getTableData()
      })
      .finally(() => {
        loading.value = false
      })
  })
}
const resetForm = () => {
  formRef.value?.clearValidate()
  formData.value = cloneDeep(DEFAULT_FORM_DATA)
}
//#endregion

//#region delete
const handleDelete = (row: TableData) => {
  ElMessageBox.confirm(`Deleting User：${row.username}，confirm deletion？`, "Hint", {
    confirmButtonText: "Sure",
    cancelButtonText: "Cancel",
    type: "warning"
  }).then(() => {
    deleteTableDataApi(row.id).then(() => {
      ElMessage.success("successfully deleted")
      getTableData()
    })
  })
}
//#endregion

//#region change
const handleUpdate = (row: TableData) => {
  dialogVisible.value = true
  formData.value = cloneDeep(row)
}
//#endregion

//#region check
const tableData = ref<TableData[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  username: "",
  phone: ""
})
const getTableData = () => {
  loading.value = true
  getTableDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    username: searchData.username || undefined,
    phone: searchData.phone || undefined
  })
    .then(({ data }) => {
      paginationData.total = data.total
      tableData.value = data.list
    })
    .catch(() => {
      tableData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}
const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}
//#endregion

/** Monitor changes in paging parameters */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="username" label="username">
          <el-input v-model="searchData.username" placeholder="please enter" />
        </el-form-item>
        <el-form-item prop="phone" label="Phone number">
          <el-input v-model="searchData.phone" placeholder="Please enter" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="dialogVisible = true">New users</el-button>
          <el-button type="danger" :icon="Delete">batch deletion</el-button>
        </div>
        <div>
          <el-tooltip content="download">
            <el-button type="primary" :icon="Download" circle />
          </el-tooltip>
          <el-tooltip content="Refresh the current page">
            <el-button type="primary" :icon="RefreshRight" circle @click="getTableData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="tableData">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="username" label="username" align="center" />
          <el-table-column prop="roles" label="Role" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.roles === 'admin'" type="primary" effect="plain">admin</el-tag>
              <el-tag v-else type="warning" effect="plain">{{ scope.row.roles }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="Phone number" align="center" />
          <el-table-column prop="email" label="Email" align="center" />
          <el-table-column prop="status" label="Status" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.status" type="success" effect="plain">enable</el-tag>
              <el-tag v-else type="danger" effect="plain">operate</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="Creation time" align="center" />
          <el-table-column fixed="right" label="Operation" width="150" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="handleUpdate(scope.row)">Revise</el-button>
              <el-button type="danger" text bg size="small" @click="handleDelete(scope.row)">Delete</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination
          background
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.total"
          :page-size="paginationData.pageSize"
          :currentPage="paginationData.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!-- Add/Modify -->
    <el-dialog
      v-model="dialogVisible"
      :title="formData.id === undefined ? 'Add User' : 'Modify User'"
      @closed="resetForm"
      width="30%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item prop="username" label="username">
          <el-input v-model="formData.username" placeholder="Please enter" />
        </el-form-item>
        <el-form-item prop="password" label="password" v-if="formData.id === undefined">
          <el-input v-model="formData.password" placeholder="Please enter" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleCreateOrUpdate" :loading="loading">confirm</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 20px;
  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
