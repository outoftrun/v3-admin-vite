<script lang="ts" setup>
import { nextTick, reactive, ref } from "vue"
import { type ElMessageBoxOptions, ElMessageBox, ElMessage } from "element-plus"
import { deleteTableDataApi, getTableDataApi } from "@/api/table"
import { type TableResponseData } from "@/api/table/types/table"
import RoleColumnSlots from "./tsx/RoleColumnSlots"
import StatusColumnSlots from "./tsx/StatusColumnSlots"
import {
  type VxeGridInstance,
  type VxeGridProps,
  type VxeModalInstance,
  type VxeModalProps,
  type VxeFormInstance,
  type VxeFormProps
} from "vxe-table"

defineOptions({
  // 命名当前组件
  name: "VxeTable"
})

//#region vxe-grid
interface RowMeta {
  id: string
  username: string
  roles: string
  phone: string
  email: string
  status: boolean
  createTime: string
  /** vxe-table 自动添加上去的属性 */
  _VXE_ID?: string
}
const xGridDom = ref<VxeGridInstance>()
const xGridOpt: VxeGridProps = reactive({
  loading: true,
  autoResize: true,
  /** Paging configuration items */
  pagerConfig: {
    align: "right"
  },
  /** Form configuration items */
  formConfig: {
    items: [
      {
        field: "username",
        itemRender: {
          name: "$input",
          props: { placeholder: "username", clearable: true }
        }
      },
      {
        field: "phone",
        itemRender: {
          name: "$input",
          props: { placeholder: "Phone number", clearable: true }
        }
      },
      {
        itemRender: {
          name: "$buttons",
          children: [
            {
              props: { type: "submit", content: "查询", status: "primary" }
            },
            {
              props: { type: "reset", content: "重置" }
            }
          ]
        }
      }
    ]
  },
  /** 工具栏配置 */
  toolbarConfig: {
    refresh: true,
    custom: true,
    slots: { buttons: "toolbar-btns" }
  },
  /** 自定义列配置项 */
  customConfig: {
    /** 是否允许列选中  */
    checkMethod: ({ column }) => !["username"].includes(column.field)
  },
  /** 列配置 */
  columns: [
    {
      type: "checkbox",
      width: "50px"
    },
    {
      field: "dns",
      title: "mdns name"
    },
    {
      field: "IP",
      title: "IP Address"
    },
    {
      field: "CPUType",
      title: "CPU",
      /** Using custom columns with columns of type: "html" will result in errors, so TSX is used to implement it */
      slots: RoleColumnSlots
    },
    {
      field: "phone",
      title: "Phone number"
    },
    {
      field: "email",
      title: "email"
    },
    {
      field: "status",
      title: "Status",
      slots: StatusColumnSlots
    },
    {
      field: "createTime",
      title: "createTime"
    },
    {
      title: "Operation",
      width: "250px",
      fixed: "right",
      showOverflow: false,
      slots: { default: "row-operate" }
    }
  ],
  /** Data proxy configuration items (based on Promise API) */
  proxyConfig: {
    /** Enable dynamic serial number proxy */
    seq: true,
    /** Whether to proxy form */
    form: true,
    /** Whether to load automatically, the default is true */
    // autoLoad: false,
    props: {
      total: "total"
    },
    ajax: {
      query: ({ page, form }) => {
        xGridOpt.loading = true
        crudStore.clearTable()
        return new Promise((resolve) => {
          let total = 0
          let result: RowMeta[] = []
          /** 加载数据 */
          const callback = (res: TableResponseData) => {
            if (res?.data) {
              // 列表数据
              const esp = { dns: "esp-home", IP: "192.168.100.3", CPUType: "ESP32" }
              res.data.list.splice(1, 0, esp)
              res.data.list[0]["username"] = "Paul"
              total = res.data.total
              result = res.data.list
            }
            xGridOpt.loading = false
            // The return value has format requirements, see the vxe-table official document for details
            resolve({ total, result })
          }

          /** Parameters required by the interface */
          const params = {
            username: form.username || undefined,
            phone: form.phone || undefined,
            size: page.pageSize,
            currentPage: page.currentPage
          }
          /** 调用接口 */
          getTableDataApi(params).then(callback).catch(callback)
        })
      }
    }
  }
})
//#endregion

//#region vxe-modal
const xModalDom = ref<VxeModalInstance>()
const xModalOpt: VxeModalProps = reactive({
  title: "",
  showClose: true,
  escClosable: true,
  maskClosable: true,
  beforeHideMethod: () => {
    xFormDom.value?.clearValidate()
    return Promise.resolve()
  }
})
//#endregion

//#region vxe-form
const xFormDom = ref<VxeFormInstance>()
const xFormOpt: VxeFormProps = reactive({
  span: 24,
  titleWidth: "100px",
  loading: false,
  /** 是否显示标题冒号 */
  titleColon: false,
  /** 表单数据 */
  data: {
    username: "",
    password: ""
  },
  /** 项列表 */
  items: [
    {
      field: "username",
      title: "username",
      itemRender: { name: "$input", props: { placeholder: "please enter" } }
    },
    {
      field: "password",
      title: "password",
      itemRender: { name: "$input", props: { placeholder: "please enter" } }
    },
    {
      align: "right",
      itemRender: {
        name: "$buttons",
        children: [
          { props: { content: "Cancel" }, events: { click: () => xModalDom.value?.close() } },
          {
            props: { type: "submit", content: "sure", status: "primary" },
            events: { click: () => crudStore.onSubmitForm() }
          }
        ]
      }
    }
  ],
  /** Validation rules */
  rules: {
    username: [
      {
        required: true,
        validator: ({ itemValue }) => {
          switch (true) {
            case !itemValue:
              return new Error("please enter")
            case !itemValue.trim():
              return new Error("Invalid spaces")
          }
        }
      }
    ],
    password: [
      {
        required: true,
        validator: ({ itemValue }) => {
          switch (true) {
            case !itemValue:
              return new Error("please enter")
            case !itemValue.trim():
              return new Error("Invalid spaces")
          }
        }
      }
    ]
  }
})
//#endregion

//#region add, delete, modify and query
const crudStore = reactive({
  /** Form type, true means Revise, false means add */
  isUpdate: true,
  /** Load sheet data */
  commitQuery: () => xGridDom.value?.commitProxy("query"),
  /** Clear sheet data */
  clearTable: () => xGridDom.value?.reloadData([]),
  /** Click to display pop-up window */
  onShowModal: (row?: RowMeta) => {
    if (row) {
      crudStore.isUpdate = true
      xModalOpt.title = "Revise user"
      // 赋值
      xFormOpt.data.username = row.username
    } else {
      crudStore.isUpdate = false
      xModalOpt.title = "New users"
    }
    // Disable表单项
    const props = xFormOpt.items?.[0]?.itemRender?.props
    props && (props.disabled = crudStore.isUpdate)
    xModalDom.value?.open()
    nextTick(() => {
      !crudStore.isUpdate && xFormDom.value?.reset()
      xFormDom.value?.clearValidate()
    })
  },
  /** make sure and save */
  onSubmitForm: () => {
    if (xFormOpt.loading) return
    xFormDom.value?.validate((errMap) => {
      if (errMap) return
      xFormOpt.loading = true
      const callback = () => {
        xFormOpt.loading = false
        xModalDom.value?.close()
        ElMessage.success("Operation successful")
        !crudStore.isUpdate && crudStore.afterInsert()
        crudStore.commitQuery()
      }
      if (crudStore.isUpdate) {
        //Simulate calling the Revise interface successfully
        setTimeout(() => callback(), 1000)
      } else {
        // Simulate calling the new interface successfully
        setTimeout(() => callback(), 1000)
      }
    })
  },
  /**Whether to jump to the last page after adding */
  afterInsert: () => {
    const pager = xGridDom.value?.getProxyInfo()?.pager
    if (pager) {
      const currentTotal = pager.currentPage * pager.pageSize
      if (currentTotal === pager.total) {
        ++pager.currentPage
      }
    }
  },
  /** delete */
  onDelete: (row: RowMeta) => {
    const tip = `sure <strong style="color: var(--el-color-danger);"> delete </strong>  user <strong style="color: var(--el-color-primary);"> ${row.username} </strong> ？`
    const config: ElMessageBoxOptions = {
      type: "warning",
      showClose: true,
      closeOnClickModal: true,
      closeOnPressEscape: true,
      cancelButtonText: "cancel",
      confirmButtonText: "confirm",
      dangerouslyUseHTMLString: true
    }
    ElMessageBox.confirm(tip, "hint", config).then(() => {
      deleteTableDataApi(row.id).then(() => {
        ElMessage.success("delete successful")
        crudStore.afterDelete()
        crudStore.commitQuery()
      })
    })
  },
  /**Whether to return to the previous page after deleting*/
  afterDelete: () => {
    const tableData: RowMeta[] = xGridDom.value!.getData()
    const pager = xGridDom.value?.getProxyInfo()?.pager
    if (pager && pager.currentPage > 1 && tableData.length === 1) {
      --pager.currentPage
    }
  },
  /** More customization methods*/
  moreFn: () => {}
})
//#endregion
</script>

<template>
  <div class="app-container">
    <!-- sheet -->
    <vxe-grid ref="xGridDom" @show-header="false" v-bind="xGridOpt">
      <!-- Left button list -->
      <!-- Operation -->
      <template #row-operate="{ row }">
        <el-button link type="primary" @click="crudStore.onShowModal(row)">Revise</el-button>
        <el-button link type="danger" @click="crudStore.onDelete(row)">delete</el-button> </template
      >Revise
    </vxe-grid>
    <!-- Popup -->
    <vxe-modal ref="xModalDom" v-bind="xModalOpt">
      <!-- Form -->
      <vxe-form ref="xFormDom" v-bind="xFormOpt" />
    </vxe-modal>
  </div>
</template>
