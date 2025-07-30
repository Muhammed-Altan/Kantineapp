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
import { ref, onMounted } from 'vue';

const foodSaved = ref(0);
const orderCount = ref(0);

onMounted(async () => {
  const orderRes = await fetch('http://localhost:3001/orders');
  const orders = await orderRes.json();
  orderCount.value = orders.length;
  
  const savedRes = await fetch(`http://localhost:3001/foodsaved?orders=${orderCount.value}`);
  const saved = await savedRes.json();
  foodSaved.value = saved.foodSaved;
});
</script>