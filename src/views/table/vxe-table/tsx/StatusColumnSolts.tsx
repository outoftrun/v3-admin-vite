import { type VxeColumnPropTypes } from "vxe-table/types/column"

const solts: VxeColumnPropTypes.Slots = {
  default: ({ row, column }) => {
    const cellValue = row[column.field]
    const [type, value] = cellValue ? ["success", "Enable"] : ["danger", "Disable"]
    return [<span class={`el-tag el-tag--${type} el-tag--plain`}>{value}</span>]
  }
}

export default solts
