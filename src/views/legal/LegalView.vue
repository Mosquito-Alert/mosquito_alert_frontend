<template>
  <main class="max-w-4xl mx-auto px-4 py-12 prose prose-lg dark:prose-invert">
    <article v-html="html" />
  </main>
</template>

<script setup lang="ts">
import { ref, watch, toRef } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const DEFAULT_LANG = 'en'

const props = withDefaults(
  defineProps<{
    lang?: string
    doc: string
  }>(),
  {
    lang: DEFAULT_LANG
  }
)

const html = ref('')
const ALLOWED_DOCS = ['privacy', 'terms', 'license'] as const

type LegalDoc = typeof ALLOWED_DOCS[number]

async function loadLegal() {
  const doc = props.doc as LegalDoc
  if (!ALLOWED_DOCS.includes(doc)) {
    html.value = '<h1>404 – Document not found</h1>'
    return
  }

  // normalize lang to lowercase
  const lang = props.lang.toLowerCase()
  // possible fallbacks: full locale, language only, default
  const candidates = [lang, lang.split('-')[0], DEFAULT_LANG]

  let found = false
  for (const candidate of candidates) {
    try {
      const file = await import(
        `@/content/legal/${doc}/${candidate}.md?raw`
      )
      html.value = DOMPurify.sanitize(await marked(file.default))
      found = true
      break
    } catch {
      // continue to next candidate
    }
  }

  if (!found) {
    html.value = '<h1>404 – Page not found</h1>'
  }
}

watch([toRef(props, 'lang'), toRef(props, 'doc')], loadLegal, {
  immediate: true,
})
</script>
