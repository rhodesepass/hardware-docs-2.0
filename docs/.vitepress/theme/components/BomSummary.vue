<template>
  <div class="bom-summary">
    <div class="bom-summary-item">
      <span class="bom-summary-label">元件种类</span>
      <span class="bom-summary-value">{{ componentCount }}</span>
    </div>
    <div class="bom-summary-item">
      <span class="bom-summary-label">元件总数</span>
      <span class="bom-summary-value">{{ totalQuantity }}</span>
    </div>
    <div class="bom-summary-item bom-summary-total">
      <span class="bom-summary-label">预估总价</span>
      <span class="bom-summary-value">¥{{ totalPrice.toFixed(2) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Component {
  quantity: number
  supplier: {
    unitPrice: number
  }
}

const props = defineProps<{
  components: Component[]
}>()

const componentCount = computed(() => props.components.length)

const totalQuantity = computed(() =>
  props.components.reduce((sum, c) => sum + c.quantity, 0)
)

const totalPrice = computed(() =>
  props.components.reduce((sum, c) => sum + c.quantity * c.supplier.unitPrice, 0)
)
</script>
