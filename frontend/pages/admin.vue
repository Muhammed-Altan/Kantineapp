<script setup lang="ts">
import { ref, computed } from 'vue';

const meals = ref<Array<{ _id: string; name: string; dateTime: string }>>([
  { _id: '1', name: 'Pasta Bolognese', dateTime: '2025-07-30T12:00:00' },
  { _id: '2', name: 'Chicken Salad', dateTime: '2025-07-30T18:00:00' },
  { _id: '3', name: 'Pancakes', dateTime: '2025-07-30T08:00:00' },
]);

const orders = ref<Array<{ _id: string; _meal: string }>>([
  { _id: '1', _meal: '1' },
  { _id: '2', _meal: '1' },
  { _id: '3', _meal: '2' },
]);

function getOrderCountForMeal(mealId: string): number {
  return orders.value.filter(order => order._meal === mealId).length;
}

const sortedMeals = computed(() => {
  return [...meals.value].sort((a, b) =>
    new Date(b.dateTime || b.date).getTime() - new Date(a.dateTime || a.date).getTime()
  );
});

const state = ref({
  customer: '',
  dateTime: '',
});
</script>
<template>
  <div class="container w-2/3 mx-auto">
    <p class="text-4xl text-center mb-8">Nuværende menu</p>
    <UForm
      :state="state"
      :schema="schema"
      class="flex flex-row justify-between items-end mb-8"
      @submit="onSubmit"
    >
      <div class="flex flex-col items-center w-40">
        <label class="mb-1 text-center font-medium">Måltid</label>
        <UInput v-model="state.customer" placeholder="Indsæt måltid navn" class="w-full" />
      </div>
      <div class="flex flex-col items-center w-40 mx-auto">
        <label class="mb-1 text-center font-medium">Dato</label>
        <UInput v-model="state.dateTime" type="date" class="w-full" />
      </div>
      <UButton type="submit" class="cursor-pointer h-10 flex-none">Opret</UButton>
    </UForm>
    <div v-if="meals" class="flex flex-col gap-2">
      <div
        v-for="meal in sortedMeals"
        :key="meal._id"
        class="flex flex-row items-center gap-4 border-b py-2"
      >
        <span class="flex-1">{{ meal.name }}</span>
        <span class="flex-1">
          {{ meal.dateTime && !isNaN(new Date(meal.dateTime).getTime())
            ? new Date(meal.dateTime).toLocaleDateString()
            : 'Ingen dato' }}
        </span>
        <span class="flex-1 text-center text-sm text-gray-600">
          Bestilt: {{ getOrderCountForMeal(meal._id) }} gange
        </span>
        <UButton color="neutral" class="cursor-pointer" @click="openEditModal(meal)">Rediger</UButton>
        <UButton color="error" class="cursor-pointer" @click="deleteMeal(meal._id)">Slet</UButton>
      </div>
    </div>
    <div v-if="showEditModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 z-50">
      <div class="bg-white p-6 rounded shadow-lg w-80">
        <h2 class="text-xl font-bold mb-4 text-black">Rediger måltid</h2>
        <UInput v-model="editMealName" placeholder="Nyt navn på måltid" class="mb-4" />
        <div class="flex gap-2 justify-end">
          <UButton color="gray" class="cursor-pointer text-black" @click="closeEditModal">Annuller</UButton>
          <UButton color="primary" class="cursor-pointer" @click="saveMealEdit">Gem</UButton>
        </div>
      </div>
    </div>
  </div>
</template>