export interface CreateOrUpdateTableRequestData {
  id?: string
  username: string
  password?: string
}

export interface TableRequestData {
  /** Current page number */
  currentPage: number
  /** Query number */
  size: number
  /** Query parameter: username */
  username?: string
  /** Query parameter: Phone number */
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
