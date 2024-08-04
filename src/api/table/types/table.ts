export interface CreateOrUpdateTableRequestData {
  id?: string
  username: string
  password?: string
}

export interface TableRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  size: number
  /** 查询参数：username */
  username?: string
  /** 查询参数：Phone number */
  phone?: string
}

export interface TableData {
  createTime: string
  email: string
  id: string
  phone: string
  roles: string
  status: boolean
  username: string
}

export type TableResponseData = ApiResponseData<{
  list: TableData[]
  total: number
}>
