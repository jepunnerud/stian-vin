<template>
  <a class="appearance-none flex justify-center w-1/3" :href="props.href">
    <div
      class="flex bg-transparent items-center justify-center rounded-lg min-h-25 h-fit w-full cursor-pointer p-3 border-2 border-black hover:bg-black hover:text-white focus-in:bg-black focus-in:text-white select-none"
      tabindex="0"
    >
      {{ props.label }}
      <slot></slot>
    </div>
  </a>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  href?: string
}>()
</script>
