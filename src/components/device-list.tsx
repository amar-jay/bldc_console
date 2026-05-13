"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { RefreshCw, Usb } from "lucide-react"

interface DeviceDropdownProps {
  devices: Device[]
  onConnect: (device: Device) => void
  onRefresh?: () => void
	loading?: boolean
}

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export function DeviceListDropDown({
  devices,
  onConnect,
  onRefresh,
	loading = false,
}: DeviceDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "text-xs gap-2"
        )}
      >
        <Usb className="w-3.5 h-3.5" />
        Connect
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 text-xs">
        
        <div className="px-2 py-1 text-[10px] text-muted-foreground">
          USB Devices
        </div>

        <DropdownMenuSeparator />

        {devices.length === 0 && !loading && (
          <div className="px-2 py-3 text-xs text-muted-foreground">
            No devices found
          </div>
        )}
				{
					loading && (
						<div className="px-2 py-3 text-xs text-muted-foreground">
							Scanning for devices...
						</div>
					)
				}

        {devices.map((device) => (
          <DropdownMenuItem
            key={device.id}
            onClick={() => onConnect(device)}
            className="flex flex-col items-start gap-0.5 text-xs"
          >
            <div className="flex w-full justify-between items-center">
              <span className="font-medium">{device.name}</span>
              {device.connected && (
                <span className="text-[10px] text-green-500">
                  connected
                </span>
              )}
            </div>

            {device.vendor && (
              <span className="text-[10px] text-muted-foreground">
                {device.vendor}
              </span>
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onRefresh}
          className="text-xs gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Rescan devices
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}