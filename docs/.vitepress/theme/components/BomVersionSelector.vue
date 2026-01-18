<template>
  <div class="bom-version-selector">
    <label class="bom-version-label">版本</label>
    <select
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      class="bom-version-select"
    >
      <option v-for="v in versions" :key="v" :value="v">{{ v }}</option>
    </select>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  versions: string[]
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>
