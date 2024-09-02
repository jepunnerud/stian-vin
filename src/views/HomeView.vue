<script setup lang="ts">
import StandardButton from "../components/StandardButton.vue"
</script>
<template>
  <div class="bg-white min-h-screen flex justify-center content-center">
    <div class="flex flex-col justify-center items-center fit-content py-8">
      <h1 class="text-3xl font-bold mb-4">Velkommen til Stians vindatabase!</h1>
      <p class="text-lg mb-8">Utforsk og ranger dine favorittviner.</p>
      <div class="flex gap-5 w-full justify-center">
        <StandardButton label="Se viner" />
        <StandardButton href="/add-wine" label="Legg til ny vin" />
      </div>
    </div>
  </div>
</template>
