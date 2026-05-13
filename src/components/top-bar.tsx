import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from "@/components/ui/menubar"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { useUsbDevices } from "@/hooks/use-devices"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import {useState } from "react"
import { DeviceListDropDown } from "./device-list"

export default function TopBar() {
	const { devices, loading, onConnect, onRefresh } = useUsbDevices()
	// const [isDeviceList, setDeviceList] = useState(false)
	// const [devices, setDevices] = useState([
	// 	{id: "1", name: "Device 1", vendor: "Vendor A", connected: false},
	// 	{id: "2", name: "Device 2", vendor: "Vendor B", connected: false},	
	// ])
	// const [loadingDevices, setLoadingDevices] = useState(false)

	const handleConnect = (device) => {
		console.log("Connecting to device:", device)
	}

	const refreshDevices = () => {
		console.log("Refreshing device list...")
		// Implement your device discovery logic here
	}
  return (
    <header className="w-full h-8 border-b flex items-center px-3 bg-background text-xs">
      
      {/* LEFT: Brand */}
      <div className="flex items-center gap-2 font-semibold text-sm">
        <span>BLDC Console</span>
      </div>

      {/* CENTER: Navigation */}
      <div className="ml-6 hidden md:flex">
        <Menubar className="border-none shadow-none">
          <MenubarMenu>
            <MenubarTrigger>Dashboard</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Overview</MenubarItem>
              <MenubarItem>Analytics</MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>Devices</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>All Devices</MenubarItem>
              <MenubarItem>Motor Config</MenubarItem>
              <MenubarItem>Logs</MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>Settings</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Profile</MenubarItem>
              <MenubarItem>System</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>

      {/* RIGHT: Actions */}
      <div className="ml-auto flex items-center gap-2">

        {/* Quick action */}
				<DeviceListDropDown devices={devices} onConnect={onConnect} onRefresh={onRefresh} loading={loading}/>

        {/* Dropdown menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-xs/relaxed font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 size-7 [&_svg:not([class*='size-'])]:size-3.5"
            )}
          >
            <Menu className="w-5 h-5" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem>New Device</DropdownMenuItem>
            <DropdownMenuItem>Import Config</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User */}
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild={true}>
            <Avatar className="h-7 w-7 cursor-pointer">
              <AvatarImage src="" />
              <AvatarFallback>MN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}

      </div>
    </header>
  )
}