<template>
  <AutoComplete :model-value="modelValue" :optionLabel="(value) => value.description || value.code" showClear
    :suggestions="topicSearchResults" forceSelection :disabled="disabled" :loading="loading" @complete="topicSearch"
    @option-select="onUpdate">
    <template #option="slotProps">
      <div class="flex flex-col">
        <span>{{ slotProps.option.code }}</span>
        <span class="text-surface-500 dark:text-surface-300 text-sm">
          {{ slotProps.option.description }}
        </span>
      </div>
    </template>
  </AutoComplete>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { AutoCompleteCompleteEvent, AutoCompleteOptionSelectEvent } from 'primevue/autocomplete';

import { messagesApi } from '@/services/apiService';
import type { MessageTopic } from 'mosquito-alert';

withDefaults(defineProps<{
  modelValue: MessageTopic | MessageTopic[] | null;
  disabled?: boolean,
}>(), {
  modelValue: null,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: MessageTopic[] | null): void;
}>();

const onUpdate = (event: AutoCompleteOptionSelectEvent) => {
  emit('update:modelValue', event.value ?? null);
};

const loading = ref(false);
const topicSearchResults = ref<MessageTopic[]>([]);

const topicSearch = async (event: AutoCompleteCompleteEvent) => {
  const topicSearch = event.query;
  loading.value = true;

  try {
    await messagesApi.topicsList({ search: topicSearch }).then((response) => {
      topicSearchResults.value = response.data.results;
    });
  } catch (error) {
    console.error('Error fetching topic details:', error);
  } finally {
    loading.value = false;
  }
};
</script>
