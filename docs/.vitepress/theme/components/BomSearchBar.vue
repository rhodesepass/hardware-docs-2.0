<template>
  <div class="bom-search-bar">
    <svg class="bom-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
    <input
      type="text"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      placeholder="搜索元器件..."
      class="bom-search-input"
    />
    <button
      v-if="modelValue"
      @click="$emit('update:modelValue', '')"
      class="bom-search-clear"
      type="button"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6 6 18M6 6l12 12"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>
