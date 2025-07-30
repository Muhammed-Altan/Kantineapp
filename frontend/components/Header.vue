<template>
  <div class="flex justify-between p-2">
    <ULink raw to="/" class="text-2xl">Kantine</ULink>
    <div class="flex items-center gap-4">
      <ULink to="/menu">Menu</ULink>
      <ULink to="/about">Om os</ULink>
      <ULink to="/admin">Admin</ULink>
      <ULink to="/MineBestillinger">Mine Bestillinger</ULink>
    </div>
    <UButton
      v-if="!isLoggedIn" icon="i-lucide-log-in" size="md" color="primary" variant="solid" to="/login"
    >Login</UButton>
    <UButton
      v-else icon="i-lucide-log-out" size="md" color="neutral" variant="solid" @click="handleLogout" to='/login'
    >Logout</UButton>
  </div>
  <USeparator class="mb-10" />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { jwtDecode } from 'jwt-decode'

const toast = useToast()
const isLoggedIn = ref(false)
const decoded = ref(null)
const router = useRouter()
const route = useRoute()

function checkAuth() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      isLoggedIn.value = true
      decoded.value = jwtDecode(token)
    } else {
      isLoggedIn.value = false
      decoded.value = null
    }
  }
}

onMounted(checkAuth)
watch(route, checkAuth)

const handleLogout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
    isLoggedIn.value = false
    toast.add({ title: 'Success', description: 'You have succesfully logged out.', color: 'Succes' })
    router.push('/login')
  }
}
</script>