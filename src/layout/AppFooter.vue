<template>
  <div class="flex items-center justify-center h-8 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
    <a href="https://www.mosquitoalert.com" target="_blank" rel="noopener noreferrer"
      class="text-primary font-bold hover:underline">Mosquito Alert</a>
    <span class="mx-2">© {{ currentYear }}</span>
  </div>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>
