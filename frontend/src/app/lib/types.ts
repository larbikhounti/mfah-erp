export interface Dom {
  id: number
  name: string
  address: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface User {
  id: number
  name: string
  email: string
  role: string
  domain: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface Role {
  id: number
  name: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}
