import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    // Sinkronisasi awal ditunda satu microtask agar tidak memanggil setState
    // sinkron di dalam effect (aturan react-hooks/set-state-in-effect).
    // Perilaku sama: berjalan sebelum paint berikutnya.
    queueMicrotask(onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
