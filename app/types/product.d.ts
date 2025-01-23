export type ProductData = {
  pid: string
  // create
  name: string
  price: number
  in_stock: number
  is_available: boolean
  added_on: number
  added_by: string
  thumbnail?: string
  product_images: {
    url: string
    comment?: string
  }[]
  updated_on?: number
}

export type OrderData = {
  orderId: string
  products: {
    detail: ProductData
    quantity: number
  }[]
  order_on: number
  order_by: string
  total_price: number
  total_products: number
  buyer: {
    name: string
    email: string
    phone: string
    address: string
    mode: string
  }
}
