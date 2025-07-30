<template>
  <div class="container">
    <p class="text-4xl text-center mb-8">Om os</p>
    <div>
      <p>I kantinen har vi et par måder hvorpå vi reducerer madspild:</p>
      <ul class="list-disc ml-8">
        <li>Vi forudbestiller maden, så vi kun laver det, der er bestilt.</li>
        <li>Vi ser på feedback fra tidligere retter, så vi kun laver mad der bliver spist.</li>
      </ul>
      <br>
      <p>Disse metoder hjælper os med at reducere madspild gevaldigt.</p>
      <p>Vi beregner madspild ud fra at vi for hvert 10. bestilte måltid sparer 0,8 kilo mad fra at blive smidt ud.</p>
      <p class="text-3xl mt-10">Statistikker</p>
      <div class="flex flex-col gap-5 mt-10">
        <UCard>
          <p class="text-2xl">Estimeret madspilsreduktion pr. dag</p>
          <p>{{ foodSaved }}</p>
        </UCard>
        <UCard>
          <p class="text-2xl">Gennemsnittelige bestillinger pr. dag</p>
          <p>{{ orderCount }}</p>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const foodSaved = ref(0);
const orderCount = ref(0);
</script>