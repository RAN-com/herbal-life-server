import { useEffect, useState } from 'react'

// Calculate base font size dynamically based on the device's default font size
const getBaseFontSize = (): number => {
  const rootFontSizeStr: string | null = window.getComputedStyle(document.documentElement).fontSize
  if (rootFontSizeStr) {
    return parseFloat(rootFontSizeStr)
  }
  // Fallback to a default base font size (16px) if unable to retrieve the root font size
  return 16
}

// Define scaling factors for different screen sizes
const smallScreenFactor: number = 0.8
const mediumScreenFactor: number = 1
const largeScreenFactor: number = 1.2

const useFluidTypography = (initialFontSize: string): string => {
  const [scaledFontSize, setScaledFontSize] = useState<string>(initialFontSize)

  useEffect(() => {
    const calculateScaledFontSize = (size: string, screenWidth: number): string => {
      // Choose scaling factor based on screen width
      let scaleFactor: number
      if (screenWidth < 600) {
        scaleFactor = smallScreenFactor
      } else if (screenWidth < 1024) {
        scaleFactor = mediumScreenFactor
      } else {
        scaleFactor = largeScreenFactor
      }

      // Calculate base font size dynamically
      const baseFontSize: number = getBaseFontSize()

      // Parse the font size value and unit
      const [, fontSizeValue, fontSizeUnit] = size.match(/([\d.]+)(\D+)?/) || []

      // Calculate scaled font size
      if (fontSizeUnit === 'rem') {
        // Convert rem to px, then scale
        const pxValue = parseFloat(fontSizeValue) * baseFontSize
        return `${pxValue * scaleFactor}px`
      } else {
        // Directly scale px value
        const pxValue = parseFloat(fontSizeValue)
        return `${pxValue * scaleFactor}px`
      }
    }

    const handleResize = (): void => {
      const { innerWidth: screenWidth } = window
      setScaledFontSize(calculateScaledFontSize(initialFontSize, screenWidth))
    }

    // Initial calculation
    handleResize()

    // Add event listener for window resize
    window.addEventListener('resize', handleResize)

    // Cleanup event listener on component unmount
    return (): void => window.removeEventListener('resize', handleResize)
  }, [initialFontSize])

  return scaledFontSize
}

export default useFluidTypography
