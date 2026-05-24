<script setup lang="ts">
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
    class?: string
  }>(),
  {
    size: 'md',
  },
)

const sizeClasses = {
  sm: 'h-7 max-w-[100px]',
  md: 'h-9 max-w-[130px]',
  lg: 'h-12 max-w-[180px]',
}
</script>

<template>
  <img
    src="/Davao_City_Logo.png"
    alt="Davao City — Life is Here"
    :class="cn('w-auto shrink-0 object-contain object-left', sizeClasses[props.size], props.class)"
  />
</template>
