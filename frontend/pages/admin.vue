<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { ref, onMounted, computed } from 'vue'

const schema = z.object({
  customer: z.string().min(2),
  dateTime: z.string().min(1) 
})

type Schema = z.output<typeof schema>
type Item = { description?: string; price?: number }

const state = reactive<Partial<Schema> & { items: Item[] }>({
  dateTime: '', 
  items: []
})

function addItem() {
  if (!state.items) state.items = []
  state.items.push({})
}
function removeItem() {
  if (state.items) state.items.pop()
}

const toast = useToast()
const meals = ref<any[]>([
  { _id: '1', name: 'Pasta Bolognese', dateTime: '2025-07-30T12:00:00' },
  { _id: '2', name: 'Chicken Salad', dateTime: '2025-07-30T18:00:00' },
  { _id: '3', name: 'Pancakes', dateTime: '2025-07-30T08:00:00' },
])
const orders = ref<any[]>([])
const showEditModal = ref(false)
const editMealId = ref<string | null>(null)
const editMealName = ref('')

const sortedMeals = computed(() => {
  return [...meals.value].sort((a, b) =>
    new Date(b.dateTime || b.date).getTime() - new Date(a.dateTime || a.date).getTime()
  )
})

async function fetchMeals() {
  try {
    const res = await fetch('http://localhost:3001/meals')
    meals.value = await res.json()
  } catch (err) {
    console.error('Error fetching meals:', err)
  }
}

async function fetchOrders() {
  try {
    const res = await fetch('http://localhost:3001/orders')
    orders.value = await res.json()
  } catch (err) {
    console.error('Error fetching orders:', err)
  }
}

let token = ''
if (typeof window !== 'undefined') {
  token = localStorage.getItem('token') || ''
}

async function deleteMeal(id: string) {
  try {
    const res = await fetch(`http://localhost:3001/meals/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!res.ok) throw new Error('Failed to delete meal')
    toast.add({ title: 'Deleted', description: 'Meal removed from database.', color: 'success' })
    await fetchMeals()
  } catch (err) {
    toast.add({ title: 'Error', description: 'Could not delete meal.', color: 'error' })
  }
}

function openEditModal(meal: any) {
  editMealId.value = meal._id
  editMealName.value = meal.name
  showEditModal.value = true
}
function closeEditModal() {
  showEditModal.value = false
  editMealId.value = null
  editMealName.value = ''
}
async function saveMealEdit() {
  if (!editMealName.value.trim() || !editMealId.value) return
  const meal = meals.value.find(m => m._id === editMealId.value)
  if (!meal) return
  try {
    const res = await fetch(`http://localhost:3001/meals/${editMealId.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: editMealName.value,
        dateTime: meal.dateTime
      })
    })
    if (!res.ok) throw new Error('Failed to update meal')
    toast.add({ title: 'Success', description: 'Meal updated.', color: 'success' })
    await fetchMeals()
    closeEditModal()
  } catch (err) {
    toast.add({ title: 'Error', description: 'Could not update meal.', color: 'error' })
  }
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const meal = {
    name: state.customer,
    dateTime: state.dateTime, 
  }
  try {
    const res = await fetch('http://localhost:3001/meals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(meal)
    })
    if (!res.ok) throw new Error('Failed to add meal')
    toast.add({ title: 'Success', description: 'Meal added to database.', color: 'success' })
    await fetchMeals() 
  } catch (err) {
    toast.add({ title: 'Error', description: 'Could not add meal.', color: 'error' })
  }
}

function getOrderCountForMeal(mealId: string) {
  return orders.value.filter(order => order._meal === mealId || order._meal?.toString() === mealId?.toString()).length
}

async function orderMeal(mealId) {
  const token = localStorage.getItem('token')
  if (!token) {
    toast.add({ title: 'Fejl', description: 'Du skal være logget ind for at bestille.', color: 'error' })
    return
  }
  const res = await fetch('http://localhost:3001/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ _meal: mealId })
  })
  if (res.ok) {
    await fetchOrders()
    toast.add({ title: 'Success', description: 'Bestilling oprettet!', color: 'success' })
  } else {
    toast.add({ title: 'Fejl', description: 'Kunne ikke oprette bestilling.', color: 'error' })
  }
}

onMounted(() => {
  fetchMeals()
  fetchOrders()
})
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