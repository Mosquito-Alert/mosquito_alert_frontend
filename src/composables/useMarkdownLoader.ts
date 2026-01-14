import { ref, watch, toRef } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

export function useMarkdownLoader(
  props: { lang?: string; doc: string },
  options: { folder: string; allowedDocs: readonly string[]; fallbackLang: string },
) {
  const html = ref('')

  const loadDoc = async () => {
    const { folder, allowedDocs, fallbackLang } = options
    const doc = props.doc

    if (!allowedDocs.includes(doc)) {
      html.value = '<h1>404 – Page not found</h1>'
      return
    }

    const lang = (props.lang ?? fallbackLang).toLowerCase()
    const candidates = [lang, lang.split('-')[0], fallbackLang]

    let found = false
    for (const candidate of candidates) {
      try {
        const file = await import(`@/content/${folder}/${doc}/${candidate}.md?raw`)
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

  watch([toRef(props, 'lang'), toRef(props, 'doc')], loadDoc, { immediate: true })

  return { html }
}
