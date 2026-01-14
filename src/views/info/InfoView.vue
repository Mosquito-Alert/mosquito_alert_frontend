<template>
  <main class="max-w-3xl mx-auto px-4 py-10 prose prose-lg dark:prose-invert">
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
const ALLOWED_DOCS = ['score'] as const
type InfoDoc = typeof ALLOWED_DOCS[number]

async function loadInfo() {
  const doc = props.doc as InfoDoc
  if (!ALLOWED_DOCS.includes(doc)) {
    html.value = '<h1>404 – Page not found</h1>'
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
        `@/content/info/${doc}/${candidate}.md?raw`
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

watch([toRef(props, 'lang'), toRef(props, 'doc')], loadInfo, {
  immediate: true,
})
</script>
