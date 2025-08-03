<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  id: string;
  label?: string;
  type?: string;
  modelValue: string | number;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  autocomplete?: string;
  error?: string; // Để hiển thị lỗi validation
}>();

const emit = defineEmits(['update:modelValue']);

const updateValue = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
};

const inputType = computed(() => props.type || 'text');
</script>

<template>
  <div class="mb-3">
    <label v-if="label" :for="id" class="form-label fw-bold">{{ label }}</label>
    <input
      :id="id"
      :type="inputType"
      :value="modelValue"
      @input="updateValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :autocomplete="autocomplete"
      class="form-control"
      :class="{ 'is-invalid': error }"
    />
    <div v-if="error" class="invalid-feedback">
      {{ error }}
    </div>
  </div>
</template>