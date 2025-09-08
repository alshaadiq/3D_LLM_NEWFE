# Aetosky Design System

A comprehensive design system for the 3D LLM Frontend project, providing consistent visual language, components, and utilities.

## 🎨 Overview

The Aetosky Design System is built with the following principles:
- **Consistency**: Unified visual language across all components
- **Accessibility**: WCAG compliant color contrasts and interactive states
- **Scalability**: Systematic approach to design tokens and component variants
- **Developer Experience**: TypeScript support with comprehensive type safety
- **Performance**: Optimized for modern frameworks and build tools

## 🏗️ Architecture

```
src/
├── composables/
│   ├── useDesignSystem.js     # JavaScript implementation
│   └── useDesignSystem.ts     # TypeScript implementation (recommended)
├── types/
│   └── design-system.ts       # TypeScript type definitions
├── components/
│   └── ui/                    # Reusable UI components
│       └── AetosButton.vue    # Example button component
└── assets/
    └── base.css              # CSS variables and global styles
```

## 🎯 Design Tokens

### Colors

Our color system is built around the primary Aetosky green (`#BEF975`) with a dark theme approach:

```typescript
import { colors } from '@/composables/useDesignSystem'

// Primary brand colors
colors.primary.green           // #BEF975
colors.primary.greenHover      // #A8E356
colors.primary.greenBg         // rgba(190, 249, 117, 0.08)

// Surface colors (dark theme)
colors.surface.primary         // #181818
colors.surface.secondary       // #1E1E1E
colors.surface.tertiary        // #2A2A2A

// Text colors
colors.text.primary           // #FFFFFF
colors.text.secondary         // #E5E5E5
colors.text.tertiary          // #B3B3B3

// Border colors
colors.border.primary         // rgba(255, 255, 255, 0.12)
colors.border.focus           // #BEF975

// Semantic colors
colors.semantic.error         // #FF4444
colors.semantic.success       // #66BB6A
```

### Typography

Based on Inter font family with systematic sizing:

```typescript
import { typography } from '@/composables/useDesignSystem'

// Display typography (for headers)
typography.display['2xl']     // 72px / 90px line height
typography.display.xl         // 60px / 72px line height
typography.display.lg         // 48px / 60px line height

// Text typography (for body text)
typography.text.xl           // 20px / 30px line height
typography.text.lg           // 18px / 28px line height
typography.text.md           // 16px / 24px line height
typography.text.sm           // 14px / 20px line height
typography.text.xs           // 12px / 18px line height
```

### Spacing

Based on 8px grid system:

```typescript
import { spacing } from '@/composables/useDesignSystem'

spacing['1']     // 4px
spacing['2']     // 8px
spacing['4']     // 16px
spacing['8']     // 32px
spacing['16']    // 64px
```

## 🧩 Components

### Using the Design System Composable

```vue
<script setup lang="ts">
import { useDesignSystem } from '@/composables/useDesignSystem'

const { colors, getTypographyStyles, getSpacing } = useDesignSystem()

// Get typography styles
const headingStyles = getTypographyStyles('display-lg')

// Get color with opacity
const backgroundWithOpacity = getColorWithOpacity('primary.green', 0.1)
</script>
```

### Pre-built Components

#### AetosButton

```vue
<template>
  <AetosButton variant="primary" size="md" @click="handleClick">
    Click me
  </AetosButton>
  
  <AetosButton variant="secondary" size="lg" full-width>
    Full width button
  </AetosButton>
  
  <AetosButton variant="ghost" size="sm" disabled>
    Disabled button
  </AetosButton>
</template>

<script setup>
import AetosButton from '@/components/ui/AetosButton.vue'
</script>
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'ghost' | 'destructive'`
- `size`: `'xs' | 'sm' | 'md' | 'lg' | 'xl'`
- `disabled`: `boolean`
- `fullWidth`: `boolean`

## 🎨 Using Tailwind CSS Classes

All design tokens are available as Tailwind CSS classes:

```vue
<template>
  <!-- Colors -->
  <div class="bg-surface-primary text-text-primary border-border-primary">
    Content with design system colors
  </div>
  
  <!-- Typography -->
  <h1 class="text-display-lg font-bold">
    Display heading
  </h1>
  
  <p class="text-text-md text-text-secondary">
    Body text with secondary color
  </p>
  
  <!-- Spacing -->
  <div class="p-6 m-4 space-y-3">
    Consistent spacing
  </div>
  
  <!-- Interactive states -->
  <button class="bg-primary-green hover:bg-primary-green-hover text-text-brand">
    Interactive button
  </button>
</template>
```

## 📱 Responsive Design

Use the responsive utilities for consistent breakpoints:

```vue
<template>
  <div class="p-4 md:p-6 lg:p-8">
    <!-- 16px padding on mobile, 24px on tablet, 32px on desktop -->
  </div>
  
  <h1 class="text-display-sm md:text-display-md lg:text-display-lg">
    Responsive typography
  </h1>
</template>
```

## 🎯 Best Practices

### 1. Always Use Design Tokens

❌ **Don't:**
```vue
<div style="color: #BEF975; padding: 24px;">
```

✅ **Do:**
```vue
<div class="text-primary-green p-6">
```

### 2. Use Semantic Color Names

❌ **Don't:**
```vue
<div class="text-white">Error message</div>
```

✅ **Do:**
```vue
<div class="text-semantic-error">Error message</div>
```

### 3. Leverage Component Variants

❌ **Don't:**
```vue
<button class="bg-green-500 text-black px-4 py-2 rounded">
```

✅ **Do:**
```vue
<AetosButton variant="primary" size="md">
```

### 4. Use Typography Scales

❌ **Don't:**
```vue
<h1 style="font-size: 32px; line-height: 40px;">
```

✅ **Do:**
```vue
<h1 class="text-display-md">
```

## 🔧 Customization

### Extending Colors

To add new colors, update the Tailwind config:

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#8B5CF6',
          orange: '#F97316',
        }
      }
    }
  }
}
```

### Creating New Components

Follow the established pattern:

```vue
<!-- components/ui/AetosCard.vue -->
<template>
  <div :class="cardClasses">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { componentStyles } from '@/composables/useDesignSystem.ts'

interface Props {
  variant?: 'default' | 'elevated' | 'interactive'
  padding?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
})

const cardClasses = computed(() => {
  const { card } = componentStyles
  return [
    card.base,
    card.variants[props.variant],
    card.padding[props.padding],
  ]
})
</script>
```

## 🎨 Dark Theme

The design system is built with dark theme as the primary theme. All colors and components are optimized for dark backgrounds.

## 📖 References

- [Figma Design System](https://www.figma.com/design/UYzIFQieWiUBFnLvwgXBG3/Aetosky-Design-Systems)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

When contributing to the design system:

1. Follow the established naming conventions
2. Ensure TypeScript type safety
3. Test components in both light and dark themes (if applicable)
4. Update documentation for new tokens or components
5. Maintain consistency with existing patterns

## 📄 License

This design system is part of the 3D LLM Frontend project and follows the same licensing terms.
