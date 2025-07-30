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


</script>