<template>
  <div class="flex pt-2 gap-2">
    <div class="flex flex-col w-full items-center gap-2">
      <!-- * USERS -->
      <div
        v-if="messagesStore.target === MessageTarget.Users"
        class="users-target flex flex-row w-full items-center gap-2"
      >
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-user" />
          </InputGroupAddon>
          <FloatLabel variant="on">
            <!-- TODO: Make as well the option to copy a list of UUIDS, and a button to validate them -->
            <!-- TODO: For example, we could check the length, if the length is the same as an UUID, do not Autocomplete it. -->
            <UserAutocomplete
              v-model="messagesStore.userRecipients"
              :disabled="disableRecipientSelect"
              multiple
              class="[&>*]:rounded-l-none!"
            />
            <label> Recipients </label>
          </FloatLabel>
        </InputGroup>

        <!-- Language selector -->
        <InputGroup
          v-if="
            messagesStore.showMessageCreationDetails && messagesStore.availableLanguages.length > 0
          "
          class="w-64!"
        >
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
                <span :class="languageIsRequired(slotProps.value) ? 'font-bold' : ''">{{
                  getLanguageName(slotProps.value) ?? slotProps.value
                }}</span>
                <div v-if="languageIsRequired(slotProps.value)">
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
                <span :class="languageIsRequired(slotProps.option) ? 'font-bold' : ''">
                  {{ getLanguageName(slotProps.option) }}
                </span>
                <div v-if="languageIsRequired(slotProps.option)">
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
      </div>
      <!-- * AUDIENCE -->
      <div
        v-else-if="messagesStore.target === MessageTarget.Audience"
        class="audience-target flex flex-row w-full items-center gap-2"
      >
        <!-- TODO: -->
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { getLanguageName } from '@/utils/Utils'
import { MessageTarget } from 'mosquito-alert'
import { onMounted, ref } from 'vue'

import type { DynamicDialogInstance } from 'primevue/dynamicdialogoptions'
import { useMessagesStore } from '../../../stores/messagesStore.ts'
import type { LanguageKey } from '../../../types/types.ts'
import UserAutocomplete from '../../users/UserAutocomplete.vue'

const messagesStore = useMessagesStore()

// * Props */
const props = defineProps<{
  dialogRef: DynamicDialogInstance | undefined
}>()

// * Refs */
const disableRecipientSelect = ref<boolean>(false) // Disable the recipient select in the form (if we want to force the user to select only one recipient, for example)

onMounted(() => {
  const params = props.dialogRef?.data
  if (params?.initialRecipients) {
    messagesStore.setRecipients(params.initialRecipients)
  }
  if (params?.disableRecipientSelect) {
    disableRecipientSelect.value = true
  }
})

const languageIsRequired = (lang: LanguageKey | string) => {
  return messagesStore.requiredLanguages.includes(lang as LanguageKey)
}
</script>
