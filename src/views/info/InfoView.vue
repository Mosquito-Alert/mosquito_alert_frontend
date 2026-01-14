<template>
  <main class="max-w-3xl mx-auto px-4 py-10 prose prose-lg dark:prose-invert">
    <article v-html="html" />
  </main>
</template>

<script setup lang="ts">
import { useMarkdownLoader } from '@/composables/useMarkdownLoader'

const props = withDefaults(
  defineProps<{
    lang?: string
    doc: string
  }>(),
  { lang: 'en' }
)

const ALLOWED_DOCS = ['score'] as const

const { html } = useMarkdownLoader(props, { folder: 'info', allowedDocs: ALLOWED_DOCS, fallbackLang: 'en' })
</script>
