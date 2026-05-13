import { useEffect, useState, useCallback } from "react"

export const useUsbDevices = () => {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(false)

  const onConnect = useCallback(async (device: Device) => {
    setLoading(true)
    try {
      const updated = await window.api.usb.connect(device.id)

      setDevices(prev =>
        prev.map(d => (d.id === updated.id ? updated : d))
      )
    } finally {
      setLoading(false)
    }
  }, [])

  const onRefresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await window.api.usb.refresh()
      setDevices(res)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let alive = true

    const init = async () => {
      setLoading(true)
      try {
        const res = await window.api.usb.list()
        if (alive) setDevices(res)
      } finally {
        if (alive) setLoading(false)
      }
    }

    init()

    const unsubscribe = window.api.usb.onUpdate((updated) => {
      if (alive) {
        setDevices(updated)
        setLoading(false)
      }
    })

    return () => {
      alive = false
      unsubscribe?.()
    }
  }, [])

  return {
    devices,
    loading,
    onConnect,
    onRefresh,
  }
}