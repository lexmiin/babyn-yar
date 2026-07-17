// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounce = (callback: any, wait = 300) => {
  let timeout: ReturnType<typeof setTimeout>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => callback(...args), wait)
  }
}
