export const sanitize = (str) => {
  if (typeof str !== 'string') return ''
  return str
    .trim()
    .replace(/[<>"'`]/g, '')
    .substring(0, 500)
}

export const sanitizeForm = (formData) => {
  const cleaned = {}
  Object.entries(formData).forEach(([key, val]) => {
    cleaned[key] = sanitize(val)
  })
  return cleaned
}
