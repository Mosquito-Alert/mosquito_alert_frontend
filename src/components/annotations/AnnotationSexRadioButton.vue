<template>
  <div class="flex justify-center gap-4">
    <div v-for="(option, index) in options" :key="index">
      <RadioButton :modelValue="modelValue" @update:modelValue="updateValue" :inputId="String(option.value)"
        :value="option.value" class="hidden" unstyled />
      <label :for="String(option.value)"
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
import { SpeciesCharacteristicsSex } from 'mosquito-alert';

defineProps({
  modelValue: {
    type: String as PropType<SpeciesCharacteristicsSex | null>,
    required: false,
  },
})
const emit = defineEmits<{
  (e: 'update:modelValue', value: SpeciesCharacteristicsSex | null): void
}>()

const updateValue = (value: SpeciesCharacteristicsSex | null) => {
  emit('update:modelValue', value)
}

const options: { value: SpeciesCharacteristicsSex | null; label: string; icon: string }[] = [
  { value: null, label: 'Unknown', icon: 'pi pi-question' },
  { value: SpeciesCharacteristicsSex.Male, label: 'Male', icon: 'pi pi-mars' },
  { value: SpeciesCharacteristicsSex.Female, label: 'Female', icon: 'pi pi-venus' },
]
</script>
