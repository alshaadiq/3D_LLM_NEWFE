<!-- 
  Aetosky Button Component
  Example implementation using the design system
-->
<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { componentStyles } from '@/composables/useDesignSystem.ts'
import type { ButtonVariant, ButtonSize } from '@/types/design-system'

interface Props {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  fullWidth?: boolean
}

interface Emits {
  click: [event: MouseEvent]
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  fullWidth: false,
})

const emit = defineEmits<Emits>()

const buttonClasses = computed(() => {
  const { button } = componentStyles
  return [
    button.base,
    button.variants[props.variant],
    button.sizes[props.size],
    {
      'w-full': props.fullWidth,
      'opacity-50 cursor-not-allowed': props.disabled,
    }
  ]
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
/* Additional component-specific styles can go here */
</style>
