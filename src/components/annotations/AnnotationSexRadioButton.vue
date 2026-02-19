<template>
  <div class="flex justify-center gap-4">
    <div v-for="(option, index) in options" :key="index">
      <RadioButton :modelValue="modelValue" name="species-characteristics-sex"
        @update:modelValue="emit('update:modelValue', $event)" :inputId="`species-characteristics-sex-${index}`"
        :value="option.value" class="hidden" unstyled />
      <label :for="`species-characteristics-sex-${index}`"
        class=" w-20 h-20 flex flex-col items-center justify-center border rounded-lg cursor-pointer transition-all"
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
import { SpeciesCharacteristicsSex } from 'mosquito-alert';

defineProps<{
  modelValue?: SpeciesCharacteristicsSex | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: SpeciesCharacteristicsSex | null): void
}>()

const options: { value: SpeciesCharacteristicsSex | null; label: string; icon: string }[] = [
  { value: null, label: 'Unknown', icon: 'pi pi-question' },
  { value: SpeciesCharacteristicsSex.Male, label: 'Male', icon: 'pi pi-mars' },
  { value: SpeciesCharacteristicsSex.Female, label: 'Female', icon: 'pi pi-venus' },
]
</script>
