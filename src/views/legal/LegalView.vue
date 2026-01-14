<template>
  <main class="max-w-4xl mx-auto px-4 py-12 prose prose-lg dark:prose-invert">
    <article v-html="html" />
  </main>
</template>

<script setup lang="ts">
import { useMarkdownLoader } from '@/composables/useMarkdownLoader';

const props = withDefaults(
  defineProps<{
    lang?: string
    doc: string
  }>(),
  { lang: 'en' }
)

const ALLOWED_DOCS = ['privacy', 'terms', 'license'] as const

const { html } = useMarkdownLoader(props, { folder: 'legal', allowedDocs: ALLOWED_DOCS, fallbackLang: 'en' })
</script>
