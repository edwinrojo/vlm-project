<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { X } from 'lucide-vue-next'
import { DialogClose, DialogContent, DialogPortal } from 'reka-ui'
import { cn } from '@/lib/utils'
import SheetOverlay from './SheetOverlay.vue'

type SheetSide = 'top' | 'right' | 'bottom' | 'left'

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class']
    side?: SheetSide
  }>(),
  { side: 'right' },
)

const sideClasses: Record<SheetSide, string> = {
  top: 'inset-x-0 top-0 border-b',
  bottom: 'inset-x-0 bottom-0 border-t',
  left: 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
  right: 'inset-y-0 right-0 h-full w-full border-l sm:max-w-2xl lg:max-w-4xl',
}
</script>

<template>
  <DialogPortal>
    <SheetOverlay />
    <DialogContent
      :class="
        cn(
          'fixed z-[1100] flex flex-col bg-background shadow-xl transition ease-in-out duration-300',
          sideClasses[side],
          props.class,
        )
      "
    >
      <slot />
      <DialogClose
        class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <X class="h-4 w-4" />
        <span class="sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
