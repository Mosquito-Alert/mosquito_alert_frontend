<template>
  <AutoComplete :model-value="modelValue" optionLabel="uuid" :multiple="multiple" :suggestions="userSearchResults"
    :disabled="disabled" :loading="loading" forceSelection @complete="userSearch" @update:model-value="onUpdate">
    <template #chip="{ value, removeCallback }">
      <Chip class="p-chip p-component p-autocomplete-chip" removable @remove="removeCallback($event)">
        <template #default>
          <span>{{ value.uuid }}</span>
          <span class="text-surface-500 dark:text-surface-300">
            ({{ getLanguageName(value.locale) }})
          </span>
        </template>
      </Chip>
    </template>
  </AutoComplete>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';

import { getLanguageName } from '@/utils/Utils';
import { userApi } from '@/services/apiService';
import type { User } from 'mosquito-alert';

withDefaults(defineProps<{
  modelValue: User[] | null;
  disabled?: boolean,
  multiple?: boolean,
}>(), {
  modelValue: null,
  multiple: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: User[] | null): void;
}>();

const onUpdate = (value: User[] | null) => {
  emit('update:modelValue', value ?? null);
};

const loading = ref(false);
const userSearchResults = ref<User[]>([]);

const userSearch = async (event: AutoCompleteCompleteEvent) => {
  const userUuid = event.query;
  loading.value = true;

  try {
    await userApi.list({ search: userUuid }).then((response) => {
      userSearchResults.value = response.data.results;
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
  } finally {
    loading.value = false;
  }
};
</script>
