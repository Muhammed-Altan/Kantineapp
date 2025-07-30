<template>
  <div class="container">
    <div class="text-center flex gap-8 flex-col">
      <p class="text-7xl">Den Seje Kantine</p>
      <div>
        <p>Vær med i kampen mod madspild!</p>
        <p>I dag har vi reddet {{ foodSaved }} kilo mad gennem {{ orderCount }} bestillinger!</p>
        <p>Læs mere om hvordan <ULink to="/about">her</ULink>.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const foodSaved = ref(0);
const orderCount = ref(0);

// Removed all backend-related fetch functions
</script>