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
import { ref, computed } from 'vue';

const meals = ref([
  { _id: '1', name: 'Pasta Bolognese', dateTime: '2025-07-30T12:00:00', tags: ['middagsmad'] },
  { _id: '2', name: 'Chicken Salad', dateTime: '2025-07-30T18:00:00', tags: ['aftensmad'] },
  { _id: '3', name: 'Pancakes', dateTime: '2025-07-30T08:00:00', tags: ['morgenmad'] },
]);

const comments = ref([
  { _id: '1', text: 'Delicious!', _meal: '1', _user: '1' },
  { _id: '2', text: 'Could use more salt.', _meal: '2', _user: '2' },
]);

const users = ref([
  { _id: '1', username: 'User1' },
  { _id: '2', username: 'User2' },
]);

const commentInputs = ref({});
const orders = ref([]);
const selectedTag = ref('');
const sortOrder = ref('asc');

function getUsername(userId) {
  const user = users.value.find(u => u._id === userId);
  return user ? user.username : 'Anonymous';
}

function mealComments(mealId) {
  return comments.value.filter(c => c._meal === mealId);
}

const sortedMeals = computed(() => {
  return meals.value;
});
</script>
