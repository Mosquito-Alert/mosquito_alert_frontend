<template>
  <div class="users-target flex flex-row w-full items-center gap-2">
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
    <CreateFormLanguageSelector
      v-if="messagesStore.showMessageCreationDetails && messagesStore.availableLanguages.length > 0"
    />
  </div>
</template>
<script setup lang="ts">
import UserAutocomplete from '../../users/UserAutocomplete.vue'
import CreateFormLanguageSelector from './MessageCreateFormLanguageSelector.vue'

import type { DynamicDialogInstance } from 'primevue/dynamicdialogoptions'
import { onMounted, ref } from 'vue'
import { useMessagesStore } from '../../../stores/messagesStore.ts'

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
</script>
