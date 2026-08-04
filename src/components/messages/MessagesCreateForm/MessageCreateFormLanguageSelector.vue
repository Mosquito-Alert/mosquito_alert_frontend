<template>
  <InputGroup class="w-64!">
    <InputGroupAddon>
      <i class="pi pi-language" />
    </InputGroupAddon>
    <Select
      :options="
        messagesStore.availableLanguages.sort((a, b) =>
          getLanguageName(a).localeCompare(getLanguageName(b)),
        )
      "
      v-model="messagesStore.selectedLanguage"
    >
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
  </InputGroup>
</template>
<script setup lang="ts">
import { getLanguageName } from '@/utils/Utils'
import { useMessagesStore } from '../../../stores/messagesStore.ts'

const messagesStore = useMessagesStore()
</script>
