export type VisitorCreate = {
  name: string
  gender: string
  email: string
  phone: string
  address: string
  date_of_birth: string
  photo_url: string | null
  created_by: string
  created_on: string
  medical_issues?: string
  assigned_staff?: {
    name: string
    sid: string
  }
}

export type VisitorData = {
  data: {
    name: string
    gender: string
    email: string
    phone: string
    address: string
    date_of_birth: string
    photo_url: string | null
    vid: string
    created_by: string
    created_on: string
    medical_issues?: string
    assigned_staff?: {
      name: string
      sid: string
    }
  }
  records: {
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
    vid: string
    recorded_on: string
    recorded_by: string
  }[]
}
