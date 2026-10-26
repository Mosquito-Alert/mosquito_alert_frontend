<template>
  <main class="px-4 py-10">
    <h1>Forbidden</h1>
    <p>You do not have permission to access this page.</p>
    <p>
      Return to the
      <router-link :style="{ color: 'blue' }" :to="{ name: 'home' }">home page</router-link>.
    </p>
  </main>
</template>
