<template>
  <div class="bom-category-filter">
    <button
      v-for="cat in options"
      :key="cat.id"
      @click="toggle(cat.id)"
      :class="['bom-category-tag', { active: modelValue.includes(cat.id) }]"
      :style="{ '--cat-color': cat.color }"
      type="button"
    >
      <span class="bom-category-dot"></span>
      {{ cat.name }}
    </button>
  </div>
</template>

<script setup lang="ts">
interface Category {
  id: string
  name: string
  color: string
}

const props = defineProps<{
  modelValue: string[]
  options: Category[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

function toggle(id: string) {
  const current = [...props.modelValue]
  const idx = current.indexOf(id)
  if (idx >= 0) {
    current.splice(idx, 1)
  } else {
    current.push(id)
  }
  emit('update:modelValue', current)
}
</script>
