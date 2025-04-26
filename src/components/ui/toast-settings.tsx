"use client"

import { Volume2, VolumeX, Settings } from "lucide-react"
import { useToastSound } from "../../hooks/use-toast-sound"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"
import { Slider } from "./slider"
import { Button } from "./button"
import { useState } from "react"

export function ToastSettings() {
  const { isMuted, volume, toggleMute, updateVolume } = useToastSound()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="w-8 h-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Settings className="h-4 w-4" />
          <span className="sr-only">إعدادات التنبيهات</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">إعدادات الصوت</h4>
            <p className="text-sm text-muted-foreground">
              اضبط مستوى صوت التنبيهات أو أوقفه
            </p>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="px-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-slate-500" />
                ) : (
                  <Volume2 className="h-4 w-4 text-slate-500" />
                )}
                <span className="sr-only">
                  {isMuted ? "تشغيل الصوت" : "إيقاف الصوت"}
                </span>
              </Button>
              <Slider
                max={1}
                min={0}
                step={0.1}
                value={[volume]}
                onValueChange={([value]) => updateVolume(value)}
                disabled={isMuted}
                className="w-[120px]"
                aria-label="مستوى الصوت"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}