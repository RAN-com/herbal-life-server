//  change the port according to the server hosted
// default is 3000

const isDev = process.env.NODE_ENV === "development";
export const SERVER_URL = isDev
  ? "http://localhost:3000/api"
  : "https://herbal-life.raninfo.in/api";

export const SERVER_DOMAIN = isDev
  ? "localhost:3000"
  : "herbal-life.raninfo.in";
