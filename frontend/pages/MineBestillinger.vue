<template>
  <div class="container">
    <h1 class="text-3xl mb-6">Mine Bestillinger</h1>
    <div v-if="orders.length">
      <ul class="flex flex-col gap-4">
        <li v-for="order in orders" :key="order._id" class="border rounded p-4">
          <p><b>Order ID:</b> {{ shortId(order._id) }}</p>
          <p><b>Bruger:</b> {{ getUsername(order._user) }}</p>
          <p><b>Måltid:</b> {{ getMealName(order._meal) }}</p>
          <p><b>Ugedag:</b> {{ getWeekdayAndDate(order._meal) }}</p>
        </li>
      </ul>
    </div>
    <div v-else>
      <p>Ingen bestillinger fundet.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const orders = ref([])
const meals = ref([])
const users = ref([])

function shortId(id) {
  return typeof id === 'string' ? id.slice(-6) : id
}

function getMealName(mealId) {
  const meal = meals.value.find(m => m._id === mealId || m._id?.toString() === mealId?.toString())
  return meal ? meal.name : 'Ukendt måltid'
}

function getUsername(userId) {
  const user = users.value.find(u => u._id === userId || u._id?.toString() === userId?.toString())
  return user ? user.username : 'Ukendt bruger'
}

function getMealDate(mealId) {
  const meal = meals.value.find(m => m._id === mealId || m._id?.toString() === mealId?.toString())
  return meal ? meal.dateTime : null
}

function getWeekdayAndDate(mealId) {
  const dateStr = getMealDate(mealId)
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const weekdays = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag']
  const months = ['Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'December']
  const weekday = weekdays[date.getDay()]
  const day = date.getDate()
  const month = months[date.getMonth()]
  return `${weekday} d. ${day} ${month}`
}

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) return

  const res = await fetch('http://localhost:3001/orders/my', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  if (res.ok) {
    orders.value = await res.json()
  } else {
    orders.value = []
  }

  const mealRes = await fetch('http://localhost:3001/meals')
  if (mealRes.ok) {
    meals.value = await mealRes.json()
  }

  const userRes = await fetch('http://localhost:3001/users')
  if (userRes.ok) {
    users.value = await userRes.json()
  }
})
</script>