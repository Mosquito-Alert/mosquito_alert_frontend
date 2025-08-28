<template>
  <Button v-if="$can('add', 'Notification')" label="Compose" icon="pi pi-pencil" iconPos="right"
    @click="$router.push({ name: 'send_notifications' })" />
</template>

<script setup lang="ts">

</script>
