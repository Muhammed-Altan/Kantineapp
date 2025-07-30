<template>
  <div class="container">
    <p class="text-4xl text-center mb-8">Menu</p>
    <div class="flex gap-4 mb-4">
      <select
        v-model="selectedTag"
        @change="fetchMeals"
        class="border rounded text-neutral-100 rounded px-2 py-1"
      >
        <option class="bg-secondary" value="">Alle</option>
        <option class="bg-secondary" value="morgenmad">Morgenmad</option>
        <option class="bg-secondary" value="middagsmad">Middagsmad</option>
        <option class="bg-secondary" value="aftensmad">Aftensmad</option>
      </select>
      <select
        v-model="sortOrder"
        @change="fetchMeals"
        class="border rounded text-neutral-100 rounded px-2 py-1"
      >
        <option class="bg-secondary" value="asc">Dato stigende</option>
        <option class="bg-secondary" value="desc">Dato faldende</option>
      </select>
    </div>
    <div v-if="meals" class="flex flex-col gap-4">
      <div v-for="meal in sortedMeals" :key="meal._id" class="border rounded p-4 flex flex-col gap-2">
        <div class="flex gap-2 mb-2">
          <span
            v-for="tag in meal.tags"
            :key="tag"
            class="inline-block bg-white text-black text-xs px-2 py-1 rounded"
          >
            {{ tag.charAt(0).toUpperCase() + tag.slice(1) }}
          </span>
        </div>
        <p class="font-bold">{{ new Date(meal.dateTime).toLocaleString() }}</p>
        <p class="mb-2">{{ meal.name }}</p>

        <div class="flex gap-2 mb-2">
          <UButton
            v-if="!userHasOrderedMeal(meal._id)"
            @click="orderMeal(meal._id)"
            color="primary"
          >
            Bestil
          </UButton>
          <template v-else>
            <UButton color="success" disabled>
              Allerede bestilt
            </UButton>
            <UButton color="error" @click="removeOrder(meal._id)">
              Fjern bestilling
            </UButton>
          </template>
        </div>

        <div class="mt-4">
          <UCollapsible class="flex flex-col gap-2 w-full">
            <UButton
              :label="`Kommentarer (${mealComments(meal._id).length})`"
              color="neutral"
              variant="subtle"
              trailing-icon="i-lucide-chevron-down"
              block
            />
            <template #content>
              <div v-if="mealComments(meal._id).length" class="flex flex-col gap-2">
                <UCard
                  v-for="comment in mealComments(meal._id)"
                  :key="comment._id"
                  class="p-1 border-1 border-neutral rounded-lg"
                >
                  <template #header>
                    <span class="font-semibold">{{ getUsername(comment._user) }}</span>
                  </template>
                  <div class="flex justify-between">
                    <div class="text-xs">{{ comment.text }}</div>
                    <UButton
                      color="error"
                      v-if="decoded?.role === 'admin' || decoded?.userId === comment._user"
                      @click="deleteComment(comment._id)"
                    >
                      Fjern
                    </UButton>
                  </div>
                </UCard>
              </div>
              <div v-else class="text-gray-400 mb-2">Ingen kommentarer endnu.</div>
              <div class="flex gap-2 mt-2">
                <UInput
                  v-model="commentInputs[meal._id]"
                  placeholder="Skriv en kommentar..."
                  @keyup.enter="submitComment(meal._id)"
                  class="flex-1"
                />
                <UButton @click="submitComment(meal._id)" :disabled="!commentInputs[meal._id] || !commentInputs[meal._id].trim()">
                  Send
                </UButton>
              </div>
            </template>
          </UCollapsible>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { jwtDecode } from 'jwt-decode'

const toast = useToast()
const meals = ref([
  { _id: '1', name: 'Pasta Bolognese', dateTime: '2025-07-30T12:00:00', tags: ['middagsmad'] },
  { _id: '2', name: 'Chicken Salad', dateTime: '2025-07-30T18:00:00', tags: ['aftensmad'] },
  { _id: '3', name: 'Pancakes', dateTime: '2025-07-30T08:00:00', tags: ['morgenmad'] },
])
const comments = ref([])
const users = ref([])
const commentInputs = reactive({})
const decoded = ref(null)
const orders = ref([])
const selectedTag = ref(''); // '' means all
const sortOrder = ref('asc'); // or 'desc'

async function fetchMeals() {
  let url = 'http://localhost:3001/meals?';
  if (selectedTag.value) url += `tag=${selectedTag.value}&`;
  if (sortOrder.value) url += `sort=${sortOrder.value}`;
  const res = await fetch(url);
  meals.value = await res.json();
}

async function fetchComments() {
  const res = await fetch('http://localhost:3001/comments')
  comments.value = await res.json()
}

async function fetchUsers() {
  const res = await fetch('http://localhost:3001/users')
  users.value = await res.json()
}

function getUsername(userId) {
  const user = users.value.find(u => u._id === userId)
  return user ? user.username : 'Anonymous'
}

function mealComments(mealId) {
  return comments.value.filter(c => c._meal === mealId)
}

async function submitComment(mealId) {
  const text = commentInputs[mealId]
  if (!text || !text.trim()) return

  const token = localStorage.getItem('token')
  let userId = null
  if (token) {
    decoded.value = jwtDecode(token)
    userId = decoded.value.userId
  }

  const comment = {
    text,
    _meal: mealId,
    _user: userId,
  }

  await fetch('http://localhost:3001/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(comment)
  })
  commentInputs[mealId] = ''
  await fetchComments()
}

async function deleteComment(id) {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:3001/comments/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Failed to delete comment: ${errorText}`)
    }
    await fetchComments()
  } catch (error) {
    console.error('Error deleting comment:', error)
    alert('Error deleting comment: ' + error.message)
  }
}

async function fetchOrders() {
  const token = localStorage.getItem('token')
  if (!token) return
  const res = await fetch('http://localhost:3001/orders/my', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (res.ok) {
    orders.value = await res.json()
  } else {
    orders.value = []
  }
}

function checkAuth() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      decoded.value = jwtDecode(token)
    } else {
      decoded.value = null
    }
  }
}

onMounted(checkAuth)

const sortedMeals = computed(() => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return meals.value.filter(meal => {
    const mealDate = new Date(meal.dateTime)
    mealDate.setHours(0, 0, 0, 0)
    return mealDate >= now
  })
})

onMounted(async () => {
  await Promise.all([
    fetchMeals(),
    fetchComments(),
    fetchUsers(),
    fetchOrders()
  ])
})

function userHasOrderedMeal(mealId) {
  return orders.value.some(order => order._meal === mealId)
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

function getOrderIdForMeal(mealId) {
  const order = orders.value.find(order => order._meal === mealId)
  return order ? order._id : null
}

async function removeOrder(mealId) {
  const token = localStorage.getItem('token')
  if (!token) return
  const orderId = getOrderIdForMeal(mealId)
  if (!orderId) return
  const res = await fetch(`http://localhost:3001/orders/${orderId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (res.ok) {
    await fetchOrders()
    toast.add({ title: 'Success', description: 'Bestilling fjernet!', color: 'success' })
  } else {
    toast.add({ title: 'Fejl', description: 'Kunne ikke fjerne bestilling.', color: 'error' })
  }
}
</script>
