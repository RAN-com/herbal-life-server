export type CustomerResponse = {
  name: string
  photo_url: string
  email: string
  phone: string
  address: string
  date_of_birth: string
  medical_issues: string
  created_on: string
  cid: string
  gender: string
  amount_paid?: number
  assigned_staff?: {
    name: string
    sid: string
  }
  created_by: {
    uid: string
  }
}

export type CreateCustomer = {
  name: string
  photo_url: string | null
  email: string
  phone: string
  created_by: {
    uid: string
  }
  assigned_staff: {
    name: string
    sid: string
  }
  address: string | null
  date_of_birth: string | null
  medical_issues: string
}

export type CustomerAttendance = {
  date: string
  marked_by: string
  weight: string
  mark_status: boolean
  amount_paid?: number
  photo_url: string[]
}

export type MarathonData = {
  created_on: number
  total_notes: string
  total_absent: number
  total_present: number
  notes: MarathonNotes[]
}

export type MarathonNotes = {
  uid: string
  date: number
  weight: number
  notes: string
  attendance: 'PRESENT' | 'ABSENT'
}

export type CustomerRecords = {
  data: {
    BMI: number
    BMR: number
    BODY_FAT: number
    MUSCLE_MASS: number
    BODY_AGE: number
    TSF: number
    HEIGHT: number
    WEIGHT: number
  }
  cid: string
  recorded_on: number
  recorded_by: string
}

export type AttendanceSubscription = {
  id: string
  uid: string
  cid: string
  price: number
  boughtOn: string
  totalDays: number
  daysLeft: number
  isActive: boolean
}
