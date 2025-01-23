import { CustomerRecords } from './customers.d'

export type CreateStaff = {
  name: string
  email: string
  city: string
  locality: string
  uid: string
  photo_url?: string
  createdOn: string
  createdBy: string
  gender: string
  phone: string
  address: string
  date_of_birth: string
  medical_issues?: string
  assigned_subdomain?: string
}

export type StaffData = {
  data: CreateStaff & { sid: string }
  total_customers_assigned: number
  total_visitors_assigned: number
  total_appointments_recorded: number
  records: CustomerRecords[]
}

export type AppointmentData = {
  aid: string
  createdOn: string
  name: string
  phone: string
  email?: string
  assigned_to: {
    sid: string
    name: string
  }
  gender: string
}
