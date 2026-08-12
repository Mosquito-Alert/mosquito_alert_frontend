<template>
  <InputGroup class="w-64!">
    <InputGroupAddon>
      <i class="pi pi-language" />
    </InputGroupAddon>
    <Select :options="availableLanguagesSorted" v-model="messagesStore.selectedLanguage">
      <template #value="slotProps">
        <div v-if="slotProps.value" class="flex gap-2 items-center">
          <span :class="messagesStore.isLanguageRequired(slotProps.value) ? 'font-bold' : ''">{{
            getLanguageName(slotProps.value) ?? slotProps.value
          }}</span>
          <div v-if="messagesStore.isLanguageRequired(slotProps.value)">
            <i
              v-if="!messagesStore.isLanguageComplete(slotProps.value)"
              class="pi pi-times-circle text-red-500"
            />
            <i v-else class="pi pi-check-circle text-green-500" />
          </div>
        </div>
        <span v-else>
          {{ slotProps.placeholder }}
        </span>
      </template>
      <template #option="slotProps">
        <div class="flex gap-2 items-center">
          <span :class="messagesStore.isLanguageRequired(slotProps.option) ? 'font-bold' : ''">
            {{ getLanguageName(slotProps.option) }}
          </span>
          <div v-if="messagesStore.isLanguageRequired(slotProps.option)">
            <i
              v-if="!messagesStore.isLanguageComplete(slotProps.option)"
              class="pi pi-times-circle text-red-500"
            />
            <i v-else class="pi pi-check-circle text-green-500" />
          </div>
        </div>
      </template>
    </Select>
    <InputGroupAddon
      v-if="!messagesStore.isEveryLanguageComplete()"
      v-tooltip.right="{
        value:
          'Some required languages are incomplete. Please complete all required languages before sending the message.',
        class: 'text-sm rounded py-1 px-2',
      }"
    >
      <i class="pi pi-exclamation-triangle text-yellow-500" />
    </InputGroupAddon>
  </InputGroup>
</template>
<script setup lang="ts">
import { getLanguageName } from '@/utils/Utils'
import { computed } from 'vue'
import { useMessagesStore } from '../../../stores/messagesStore.ts'

const messagesStore = useMessagesStore()

// Sort available languages: required languages first, then optional languages, both sorted alphabetically by language name
const availableLanguagesSorted = computed(() => {
  return messagesStore.availableLanguages.slice().sort((a, b) => {
    const reqA = messagesStore.isLanguageRequired(a) ? 0 : 1
    const reqB = messagesStore.isLanguageRequired(b) ? 0 : 1
    return reqA - reqB || getLanguageName(a).localeCompare(getLanguageName(b))
  })
})
</script>
