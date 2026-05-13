import * as React from "react"
import { Terminal as TerminalIcon, Trash2, Download, Play, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import TopBar from "@/components/top-bar"

interface ConsoleMessage {
  id: string
  timestamp: string
  type: "in" | "out" | "error" | "info"
  text: string
}

export default function Console() {
  const [messages, setMessages] = React.useState<ConsoleMessage[]>([
    { id: "1", timestamp: "12:00:01", type: "info", text: "Serial system initialized." },
    { id: "2", timestamp: "12:00:02", type: "in", text: "VOUT: 12.4V, TEMP: 34C" },
  ])
  const [inputValue, setInputValue] = React.useState("")
  const [isPaused, setIsPaused] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll logic
  React.useEffect(() => {
    if (!isPaused && scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, isPaused])

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputValue.trim()) return

    const newMessage: ConsoleMessage = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      type: "out",
      text: inputValue
    }

    setMessages(prev => [...prev, newMessage])
    setInputValue("")
    
    // Simulate echo for demo
    setTimeout(() => {
        setMessages(prev => [...prev, {
            id: (Date.now()+1).toString(),
            timestamp: new Date().toLocaleTimeString([], { hour12: false }),
            type: "in",
            text: `ACK: ${inputValue}`
        }])
    }, 100)
  }

  const clearConsole = () => setMessages([])

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar />
      
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-card shadow-sm">
          {/* Console Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-md">
                <TerminalIcon className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <h2 className="text-sm font-semibold tracking-tight">Serial Console</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-green-500/10 text-green-500 border-green-500/20">
                    Connected
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">115200 bps</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => setIsPaused(!isPaused)}
                title={isPaused ? "Resume scrolling" : "Pause scrolling"}
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearConsole} title="Clear console">
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Download log">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea ref={scrollRef} className="flex-1 p-4 bg-muted/5 font-mono text-[13px] leading-relaxed">
            <div className="space-y-1 text-left">
              {messages.map((msg) => (
                <div key={msg.id} className="group flex items-start gap-3 hover:bg-muted/30 px-2 py-0.5 rounded transition-colors">
                  <span className="text-muted-foreground/50 shrink-0 select-none w-16">
                    [{msg.timestamp}]
                  </span>
                  <span className={cn(
                    "shrink-0 font-bold w-4",
                    msg.type === "in" && "text-blue-500",
                    msg.type === "out" && "text-green-500",
                    msg.type === "error" && "text-destructive",
                    msg.type === "info" && "text-muted-foreground"
                  )}>
                    {msg.type === "in" ? "←" : msg.type === "out" ? "→" : "•"}
                  </span>
                  <span className={cn(
                    "break-all whitespace-pre-wrap",
                    msg.type === "error" && "text-destructive",
                    msg.type === "info" && "text-muted-foreground italic"
                  )}>
                    {msg.text}
                  </span>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground pt-20">
                  <TerminalIcon className="w-8 h-8 opacity-20 mb-2" />
                  <p className="text-sm">Waiting for data...</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-3 border-t bg-muted/20">
            <form onSubmit={handleSend} className="flex gap-2">
              <div className="relative flex-1 group">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type command (at+config...)"
                  className="font-mono text-sm bg-background border-muted-foreground/20 focus-visible:ring-primary/30"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                  <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">↵</span>
                  </kbd>
                </div>
              </div>
              <Button type="submit" size="sm" className="px-4">
                Send
              </Button>
            </form>
            <div className="flex items-center justify-between mt-2 px-1">
                <div className="flex gap-3">
                    <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                        <input type="checkbox" className="rounded-sm border-muted" defaultChecked />
                        <span>Append CR</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                        <input type="checkbox" className="rounded-sm border-muted" defaultChecked />
                        <span>Append LF</span>
                    </label>
                </div>
                <span className="text-[10px] text-muted-foreground">
                    History: Use <kbd className="font-sans">↑</kbd> <kbd className="font-sans">↓</kbd>
                </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}