<template>
  <div class="flex justify-center gap-4">
    <div v-for="option in options" :key="option.value">
      <RadioButton :modelValue="modelValue" @update:modelValue="updateValue" :inputId="option.value"
        :value="option.value" class="hidden" unstyled />
      <label :for="option.value"
        class="w-20 h-20 flex flex-col items-center justify-center border rounded-lg cursor-pointer transition-all"
        :class="{
          'bg-primary-500 text-white border-primary-500': modelValue === option.value,
          'bg-white text-gray-800 border-gray-300': modelValue !== option.value,
        }">
        <i :class="option.icon" class="text-xl! mb-1"></i>
        <span class="text-sm">{{ option.label }}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

export type Sex = 'male' | 'female' | 'unknown'

defineProps({
  modelValue: {
    type: String as PropType<Sex>,
    required: false,
  },
})
const emit = defineEmits<{
  (e: 'update:modelValue', value: Sex): void
}>()

const updateValue = (value: Sex) => {
  emit('update:modelValue', value)
}

const options: { value: Sex; label: string; icon: string }[] = [
  { value: 'unknown', label: 'Unknown', icon: 'pi pi-question' },
  { value: 'male', label: 'Male', icon: 'pi pi-mars' },
  { value: 'female', label: 'Female', icon: 'pi pi-venus' },
]
</script>
