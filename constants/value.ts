//  change the port according to the server hosted
// default is 3000

const isDev = process.env.NODE_ENV === "development";
export const SERVER_URL = isDev
  ? "http://localhost:3000/api"
  : "https://vcard.raninfo.in/api";

export const SERVER_DOMAIN = isDev
  ? "vcard.localhost:3000"
  : "vcard.raninfo.in";

export const razorpay_key = isDev
  ? process.env.RAZORPAY_KEY
  : process.env.RAZORPAY_KEY_PRODUCTION;
export const razorpay_secret = isDev
  ? process.env.RAZORPAY_SECRET_KEY
  : process.env.RAZORPAY_SECRET_KEY_PRODUCTION;
