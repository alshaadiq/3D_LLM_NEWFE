<template>
  <div class="markdown-content" v-html="renderedContent"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'

const props = defineProps<{
  content: string
}>()

// Configure marked options
marked.setOptions({
  breaks: true, // Convert line breaks to <br>
  gfm: true,    // GitHub Flavored Markdown
})

const renderedContent = computed(() => {
  if (!props.content) return ''
  
  try {
    return marked.parse(props.content)
  } catch (error) {
    console.error('Error parsing markdown:', error)
    return props.content // Fallback to plain text
  }
})
</script>

<style scoped>
.markdown-content {
  color: inherit;
}

/* Bold text */
.markdown-content :deep(strong) {
  font-weight: bold;
  color: inherit;
}

/* Italic text */
.markdown-content :deep(em) {
  font-style: italic;
  color: inherit;
}

/* Code spans */
.markdown-content :deep(code) {
  background-color: #1a1a1a;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
  color: #BEF975;
}

/* Code blocks */
.markdown-content :deep(pre) {
  background-color: #1a1a1a;
  padding: 0.75rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 0.5rem 0;
}

.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: #ffffff;
}

/* Headings */
.markdown-content :deep(h1) {
  font-size: 1.25rem;
  font-weight: bold;
  color: inherit;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.markdown-content :deep(h2) {
  font-size: 1.125rem;
  font-weight: bold;
  color: inherit;
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
}

.markdown-content :deep(h3) {
  font-size: 1rem;
  font-weight: bold;
  color: inherit;
  margin-top: 0.5rem;
  margin-bottom: 0.25rem;
}

/* Lists */
.markdown-content :deep(ul) {
  list-style-type: disc;
  list-style-position: inside;
  margin: 0.5rem 0;
}

.markdown-content :deep(ul li) {
  margin-bottom: 0.25rem;
}

.markdown-content :deep(ol) {
  list-style-type: decimal;
  list-style-position: inside;
  margin: 0.5rem 0;
}

.markdown-content :deep(ol li) {
  margin-bottom: 0.25rem;
}

.markdown-content :deep(li) {
  color: inherit;
}

/* Links */
.markdown-content :deep(a) {
  color: #BEF975;
  text-decoration: underline;
}

.markdown-content :deep(a:hover) {
  color: #a3e635;
}

/* Blockquotes */
.markdown-content :deep(blockquote) {
  border-left: 4px solid #BEF975;
  padding-left: 1rem;
  margin: 0.5rem 0;
  color: #8E8E93;
  font-style: italic;
}

/* Tables */
.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #2A2A2A;
  margin: 0.5rem 0;
}

.markdown-content :deep(th) {
  border: 1px solid #2A2A2A;
  padding: 0.5rem;
  background-color: #1E1E1E;
  color: #ffffff;
  font-weight: 500;
}

.markdown-content :deep(td) {
  border: 1px solid #2A2A2A;
  padding: 0.5rem;
  color: inherit;
}

/* Horizontal rules */
.markdown-content :deep(hr) {
  border-color: #2A2A2A;
  margin: 1rem 0;
}

/* Paragraphs */
.markdown-content :deep(p) {
  color: inherit;
  margin-bottom: 0.5rem;
}

.markdown-content :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
