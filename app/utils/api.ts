export function toDataURL(img: ArrayBuffer, contentType: string) {
  const image = btoa(
    new Uint8Array(img)
      .reduce((data, byte) => data + String.fromCharCode(byte), ''),
  )
  return `data:${contentType};base64,${image}`
}
