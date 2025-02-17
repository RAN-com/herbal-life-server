import CryptoJS from 'crypto-js'

const key = CryptoJS.enc.Hex.parse('2B7E151628AED2A6ABF7158809CF4F3C')
const iv = CryptoJS.enc.Hex.parse('3AD77BB40D7A3660A89ECAF32466EF97')

function base64UrlEncode(str: string) {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(str: string) {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) {
    str += '='
  }
  return str
}

export function encryptData(data: string | null) {
  if (!data) return null

  try {
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }).toString()
    const encryptedData = base64UrlEncode(encrypted)
    console.log('Encrypted data:', encryptedData)
    return encryptedData
  } catch (error) {
    console.error('Error encrypting data:', error)
    return null
  }
}

export function decryptData(data: string | null) {
  if (!data) return null

  try {
    const encryptedData = base64UrlDecode(data)
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }).toString(CryptoJS.enc.Utf8)
    console.log('Decrypted data:', decrypted)
    return decrypted
  } catch (error) {
    console.error('Error decrypting data:', error)
    return null
  }
}
