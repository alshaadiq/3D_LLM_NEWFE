<!-- Design System Demo Page -->
<template>
  <div class="min-h-screen bg-surface-primary text-text-primary p-8">
    <div class="max-w-6xl mx-auto space-y-12">
      <!-- Header -->
      <header class="text-center space-y-4">
        <h1 class="text-display-lg text-text-primary">
          Aetosky Design System
        </h1>
        <p class="text-text-lg text-text-secondary max-w-2xl mx-auto">
          A comprehensive design system showcasing colors, typography, spacing, and components
          for the 3D LLM Frontend project.
        </p>
      </header>

      <!-- Colors Section -->
      <section class="space-y-6">
        <h2 class="text-display-sm text-text-primary">Colors</h2>
        
        <!-- Primary Colors -->
        <div class="space-y-4">
          <h3 class="text-text-lg-semibold text-text-secondary">Primary Brand Colors</h3>
          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-2">
              <div class="w-full h-16 bg-primary-green rounded-lg border border-border-primary"></div>
              <div class="text-text-sm">
                <div class="text-text-primary">Primary Green</div>
                <div class="text-text-tertiary font-mono">#BEF975</div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="w-full h-16 bg-primary-green-hover rounded-lg border border-border-primary"></div>
              <div class="text-text-sm">
                <div class="text-text-primary">Green Hover</div>
                <div class="text-text-tertiary font-mono">#A8E356</div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="w-full h-16 bg-primary-green-bg rounded-lg border border-border-primary"></div>
              <div class="text-text-sm">
                <div class="text-text-primary">Green Background</div>
                <div class="text-text-tertiary font-mono">rgba(190, 249, 117, 0.08)</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Surface Colors -->
        <div class="space-y-4">
          <h3 class="text-text-lg-semibold text-text-secondary">Surface Colors</h3>
          <div class="grid grid-cols-4 gap-4">
            <div class="space-y-2">
              <div class="w-full h-16 bg-surface-primary rounded-lg border border-border-primary"></div>
              <div class="text-text-sm">
                <div class="text-text-primary">Primary</div>
                <div class="text-text-tertiary font-mono">#181818</div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="w-full h-16 bg-surface-secondary rounded-lg border border-border-primary"></div>
              <div class="text-text-sm">
                <div class="text-text-primary">Secondary</div>
                <div class="text-text-tertiary font-mono">#1E1E1E</div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="w-full h-16 bg-surface-tertiary rounded-lg border border-border-primary"></div>
              <div class="text-text-sm">
                <div class="text-text-primary">Tertiary</div>
                <div class="text-text-tertiary font-mono">#2A2A2A</div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="w-full h-16 bg-surface-quaternary rounded-lg border border-border-primary"></div>
              <div class="text-text-sm">
                <div class="text-text-primary">Quaternary</div>
                <div class="text-text-tertiary font-mono">#333333</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Semantic Colors -->
        <div class="space-y-4">
          <h3 class="text-text-lg-semibold text-text-secondary">Semantic Colors</h3>
          <div class="grid grid-cols-4 gap-4">
            <div class="space-y-2">
              <div class="w-full h-16 bg-semantic-error rounded-lg border border-border-primary"></div>
              <div class="text-text-sm">
                <div class="text-text-primary">Error</div>
                <div class="text-text-tertiary font-mono">#FF4444</div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="w-full h-16 bg-semantic-warning rounded-lg border border-border-primary"></div>
              <div class="text-text-sm">
                <div class="text-text-primary">Warning</div>
                <div class="text-text-tertiary font-mono">#FFA726</div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="w-full h-16 bg-semantic-success rounded-lg border border-border-primary"></div>
              <div class="text-text-sm">
                <div class="text-text-primary">Success</div>
                <div class="text-text-tertiary font-mono">#66BB6A</div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="w-full h-16 bg-semantic-info rounded-lg border border-border-primary"></div>
              <div class="text-text-sm">
                <div class="text-text-primary">Info</div>
                <div class="text-text-tertiary font-mono">#42A5F5</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Typography Section -->
      <section class="space-y-6">
        <h2 class="text-display-sm text-text-primary">Typography</h2>
        
        <!-- Display Typography -->
        <div class="space-y-4">
          <h3 class="text-text-lg-semibold text-text-secondary">Display Typography</h3>
          <div class="space-y-3">
            <div class="text-display-2xl text-text-primary">Display 2XL - 72px</div>
            <div class="text-display-xl text-text-primary">Display XL - 60px</div>
            <div class="text-display-lg text-text-primary">Display LG - 48px</div>
            <div class="text-display-md text-text-primary">Display MD - 36px</div>
            <div class="text-display-sm text-text-primary">Display SM - 30px</div>
            <div class="text-display-xs text-text-primary">Display XS - 24px</div>
          </div>
        </div>

        <!-- Text Typography -->
        <div class="space-y-4">
          <h3 class="text-text-lg-semibold text-text-secondary">Text Typography</h3>
          <div class="space-y-3">
            <div class="text-text-xl text-text-primary">Text XL - 20px - Regular weight</div>
            <div class="text-text-xl-semibold text-text-primary">Text XL - 20px - Semibold weight</div>
            <div class="text-text-lg text-text-primary">Text LG - 18px - Regular weight</div>
            <div class="text-text-lg-semibold text-text-primary">Text LG - 18px - Semibold weight</div>
            <div class="text-text-md text-text-primary">Text MD - 16px - Regular weight</div>
            <div class="text-text-md-semibold text-text-primary">Text MD - 16px - Semibold weight</div>
            <div class="text-text-sm text-text-primary">Text SM - 14px - Regular weight</div>
            <div class="text-text-sm-semibold text-text-primary">Text SM - 14px - Semibold weight</div>
            <div class="text-text-xs text-text-primary">Text XS - 12px - Regular weight</div>
            <div class="text-text-xs-semibold text-text-primary">Text XS - 12px - Semibold weight</div>
          </div>
        </div>

        <!-- Text Colors -->
        <div class="space-y-4">
          <h3 class="text-text-lg-semibold text-text-secondary">Text Color Hierarchy</h3>
          <div class="space-y-2">
            <div class="text-text-md text-text-primary">Primary text color - Most important content</div>
            <div class="text-text-md text-text-secondary">Secondary text color - Supporting content</div>
            <div class="text-text-md text-text-tertiary">Tertiary text color - Less important content</div>
            <div class="text-text-md text-text-quaternary">Quaternary text color - Subtle content</div>
            <div class="text-text-md text-text-neutral">Neutral text color - Muted content</div>
            <div class="text-text-md text-text-disabled">Disabled text color - Inactive content</div>
          </div>
        </div>
      </section>

      <!-- Components Section -->
      <section class="space-y-6">
        <h2 class="text-display-sm text-text-primary">Components</h2>
        
        <!-- Buttons -->
        <div class="space-y-4">
          <h3 class="text-text-lg-semibold text-text-secondary">Buttons</h3>
          
          <!-- Button Variants -->
          <div class="space-y-4">
            <div class="space-y-2">
              <h4 class="text-text-md-semibold text-text-tertiary">Variants</h4>
              <div class="flex flex-wrap gap-3">
                <AetosButton variant="primary">Primary Button</AetosButton>
                <AetosButton variant="secondary">Secondary Button</AetosButton>
                <AetosButton variant="ghost">Ghost Button</AetosButton>
                <AetosButton variant="destructive">Destructive Button</AetosButton>
              </div>
            </div>
            
            <!-- Button Sizes -->
            <div class="space-y-2">
              <h4 class="text-text-md-semibold text-text-tertiary">Sizes</h4>
              <div class="flex flex-wrap items-center gap-3">
                <AetosButton variant="primary" size="xs">Extra Small</AetosButton>
                <AetosButton variant="primary" size="sm">Small</AetosButton>
                <AetosButton variant="primary" size="md">Medium</AetosButton>
                <AetosButton variant="primary" size="lg">Large</AetosButton>
                <AetosButton variant="primary" size="xl">Extra Large</AetosButton>
              </div>
            </div>
            
            <!-- Button States -->
            <div class="space-y-2">
              <h4 class="text-text-md-semibold text-text-tertiary">States</h4>
              <div class="flex flex-wrap gap-3">
                <AetosButton variant="primary">Normal</AetosButton>
                <AetosButton variant="primary" disabled>Disabled</AetosButton>
                <AetosButton variant="primary" full-width class="max-w-xs">Full Width</AetosButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Cards -->
        <div class="space-y-4">
          <h3 class="text-text-lg-semibold text-text-secondary">Cards</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="rounded-xl border border-border-primary bg-surface-secondary p-6">
              <h4 class="text-text-lg-semibold text-text-primary mb-2">Default Card</h4>
              <p class="text-text-md text-text-secondary">
                This is a default card with standard styling and border.
              </p>
            </div>
            
            <div class="rounded-xl border border-border-primary bg-surface-secondary p-6 shadow-lg">
              <h4 class="text-text-lg-semibold text-text-primary mb-2">Elevated Card</h4>
              <p class="text-text-md text-text-secondary">
                This card has elevation with a shadow for visual hierarchy.
              </p>
            </div>
            
            <div class="rounded-xl border border-border-primary bg-surface-secondary p-6 hover:border-border-secondary transition-colors duration-200 cursor-pointer">
              <h4 class="text-text-lg-semibold text-text-primary mb-2">Interactive Card</h4>
              <p class="text-text-md text-text-secondary">
                This card changes on hover and indicates interactivity.
              </p>
            </div>
          </div>
        </div>

        <!-- Form Elements -->
        <div class="space-y-4">
          <h3 class="text-text-lg-semibold text-text-secondary">Form Elements</h3>
          <div class="max-w-md space-y-4">
            <div>
              <label class="block text-text-sm-semibold text-text-secondary mb-2">Default Input</label>
              <input 
                type="text" 
                placeholder="Enter text here..."
                class="w-full rounded-lg border bg-surface-secondary border-border-primary text-text-primary placeholder-text-quaternary px-4 py-3 text-text-md focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-colors duration-200"
              >
            </div>
            
            <div>
              <label class="block text-text-sm-semibold text-text-secondary mb-2">Error State Input</label>
              <input 
                type="text" 
                placeholder="This has an error..."
                class="w-full rounded-lg border bg-surface-secondary border-semantic-error text-text-primary placeholder-text-quaternary px-4 py-3 text-text-md focus:outline-none focus:ring-2 focus:ring-semantic-error focus:border-semantic-error transition-colors duration-200"
              >
              <p class="text-text-xs text-semantic-error mt-1">This field has an error</p>
            </div>

            <div>
              <label class="block text-text-sm-semibold text-text-secondary mb-2">Textarea</label>
              <textarea 
                placeholder="Enter longer text here..."
                rows="4"
                class="w-full rounded-lg border bg-surface-secondary border-border-primary text-text-primary placeholder-text-quaternary px-4 py-3 text-text-md focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-colors duration-200 resize-vertical"
              ></textarea>
            </div>
          </div>
        </div>
      </section>

      <!-- Spacing Section -->
      <section class="space-y-6">
        <h2 class="text-display-sm text-text-primary">Spacing Scale</h2>
        <div class="space-y-4">
          <p class="text-text-md text-text-secondary">
            Based on 8px grid system for consistent spacing throughout the application.
          </p>
          <div class="space-y-3">
            <div class="flex items-center gap-4">
              <div class="w-1 bg-primary-green"></div>
              <span class="text-text-sm text-text-tertiary font-mono w-12">4px</span>
              <span class="text-text-sm text-text-primary">spacing-1</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="w-2 bg-primary-green"></div>
              <span class="text-text-sm text-text-tertiary font-mono w-12">8px</span>
              <span class="text-text-sm text-text-primary">spacing-2</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="w-4 bg-primary-green"></div>
              <span class="text-text-sm text-text-tertiary font-mono w-12">16px</span>
              <span class="text-text-sm text-text-primary">spacing-4</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="w-6 bg-primary-green"></div>
              <span class="text-text-sm text-text-tertiary font-mono w-12">24px</span>
              <span class="text-text-sm text-text-primary">spacing-6</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="w-8 bg-primary-green"></div>
              <span class="text-text-sm text-text-tertiary font-mono w-12">32px</span>
              <span class="text-text-sm text-text-primary">spacing-8</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="w-16 bg-primary-green"></div>
              <span class="text-text-sm text-text-tertiary font-mono w-12">64px</span>
              <span class="text-text-sm text-text-primary">spacing-16</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="text-center pt-12 border-t border-border-primary">
        <p class="text-text-sm text-text-tertiary">
          Aetosky Design System • 3D LLM Frontend Project
        </p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import AetosButton from '@/components/ui/AetosButton.vue'
</script>

<style scoped>
/* Additional demo-specific styles */
</style>
