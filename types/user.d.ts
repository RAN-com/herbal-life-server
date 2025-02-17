export type CenterUser = {
  name: string
  email: string
  city: string
  locality: string
  uid: string

  center_address: string
  photo_url?: string
  createdOn: string
  subscription: {
    type: 'FREE_TRAIL' | 'PAID'
    subscribedOn: string
    valid_till: string
    total_customers: number
    total_staffs: number
    total_visitors: number
    total_products: number
  } | null
}

export type CenterUserPricing = {
  title: string
  price: number
  type: 'appointments' | 'subscription' | 'attendance'
  validity?: '3_month' | '6_months' | '1_year' // in days
  priceId: string
  features: string[]
}
