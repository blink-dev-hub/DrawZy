import { useEffect, useRef, useState } from 'react'

export const senderDraw = (onDraw: ({ ctx, currentPoint, prevPoint, mode }: Draw) => void) => {
  const [mouseDown, setMouseDown] = useState(false)

  const senderCanvasRef = useRef<HTMLCanvasElement>(null)
  const prevPoint = useRef<null | Point>(null)

  const onMouseDown = () => setMouseDown(true)

  const senderClear = () => {
    const canvas = senderCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!mouseDown) return
      const currentPoint = computePointInCanvas(e)

      const ctx = senderCanvasRef.current?.getContext('2d')
      if (!ctx || !currentPoint) return

      onDraw({ ctx, currentPoint, prevPoint: prevPoint.current, mode:'erase'})
      prevPoint.current = currentPoint
    }

    const computePointInCanvas = (e: MouseEvent) => {
        const canvas = senderCanvasRef.current;
        if (!canvas) return;
      
        const rect = canvas.getBoundingClientRect();
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      };

    const mouseUpHandler = () => {
      setMouseDown(false)
      prevPoint.current = null
    }


    senderCanvasRef.current?.addEventListener('mousemove', handler)
    window.addEventListener('mouseup', mouseUpHandler)

    return () => {
      senderCanvasRef.current?.removeEventListener('mousemove', handler)
      window.removeEventListener('mouseup', mouseUpHandler)
    }
  }, [onDraw])

  return { senderCanvasRef, senderClear }
}

type Draw = {
    ctx: CanvasRenderingContext2D
    currentPoint: Point
    prevPoint: Point | null
    mode: 'draw' | 'erase'
}
  
type Point = { x: number; y: number }