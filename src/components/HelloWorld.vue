<script setup lang="ts">
import { createSupabaseClient } from "../utils/supabase/client.ts";
import { ref, reactive } from "vue";

const supabase = createSupabaseClient();
const loading = ref(false);
const user = ref<any>(null);
const wineSearch = ref("");
const wineSuggestions = ref<any[]>([]);
const selectedWine = ref<any>(null);
const isNewWine = ref(false);

// Form state
const formData = reactive({
  wineName: "",
  year: null,
  grape: "",
  price: null,
});

// const handleWineSearch = async (e: Event) => {
//   const query = e.target.value;
//   wineSearch.value = query;

//   if (query.length > 2) {
//     // Only search if the query is longer than 2 characters
//     const { data, error } = await supabase
//       .from("wines")
//       .select("*")
//       .ilike("wine_name", `%${query}%`)
//       .limit(10);

//     if (error) {
//       console.error(error);
//     } else {
//       wineSuggestions.value = data;
//     }
//   } else {
//     wineSuggestions.value = ["No wines matched your query"];
//   }
// };

// const handleWineSelect = (wine: any) => {
//   selectedWine.value = wine;
//   Object.assign(formData, {
//     wineName: wine.wine_name,
//     year: wine.year,
//     grape: wine.grape,
//     price: wine.price,
//   });
//   wineSearch.value = wine.wine_name;
//   wineSuggestions.value = [];
//   isNewWine.value = false;
// };

// const handleNewWineToggle = (e: Event) => {
//   selectedWine.value = null;
//   Object.assign(formData, {
//     wineName: "",
//     year: null,
//     grape: "",
//     price: null,
//   });
//   wineSearch.value = "";

//   isNewWine.value = e.target.checked;
// };

const handleSubmit = async (e: Event) => {
  e.preventDefault();

  loading.value = true;

  const form = new FormData(e.currentTarget);

  const { wineName, year, grape, price } = formData;
  const imageFile = form.get("image") as File;

  const imageFileName = `${wineName}-${Date.now()}`;

  const { error: uploadDataError } = await supabase.storage
    .from("wine-images")
    .upload(imageFileName, imageFile);

  if (uploadDataError) {
    console.error(uploadDataError);
    loading.value = false;
    return;
  }

  const { data: imageUrlData } = await supabase.storage
    .from("wine-images")
    .getPublicUrl(imageFileName);

  if (!imageUrlData?.publicUrl) {
    console.error("Error getting image URL");
    loading.value = false;
    return;
  }

  let wineId = selectedWine ? selectedWine.id : null;

  if (!wineId && isNewWine) {
    const { error: newWineError } = await supabase.from("wines").insert({
      wine_name: wineName,
      year: parseInt(year),
      grape: grape,
      price: price,
      image_url: imageUrlData?.publicUrl,
    });

    if (newWineError) {
      console.error(newWineError);
      loading.value = false;
      return;
    }
  }
  loading.value = false;
  alert("Wine submitted successfully!");
};
</script>

<template>
  <div class="flex flex-col">
    <h1 class="text-2xl m-4">Legg til en vin</h1>
    <form
      @submit="handleSubmit"
      class="max-w-lg mx-6 p-4 bg-white shadow-md rounded-lg"
    >
      <!-- <div v-if="!isNewWine" class="mb-4">
        <label
          htmlFor="wineSearch"
          class="block text-sm font-medium text-gray-700"
        >
          Search Wine:
        </label>
        <input
          type="text"
          id="wineSearch"
          name="wineSearch"
          :value="wineSearch"
          @change="handleWineSearch"
          class="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />

        <ul
          v-if="wineSuggestions.length > 0"
          class="border border-gray-300 rounded-md mt-2 bg-white max-h-48 overflow-y-auto"
        >
          <li
            v-for="wine in wineSuggestions"
            :key="wine.id"
            @click="() => handleWineSelect(wine)"
            class="p-2 cursor-pointer hover:bg-indigo-100 truncate"
          >
            {{ wine.wine_name }} ({{ wine.year }})
          </li>
        </ul>
      </div> -->

      <!-- <div class="mb-4">
        <label class="flex items-center">
          <input
            type="checkbox"
            :checked="isNewWine"
            @change="handleNewWineToggle"
            class="form-checkbox"
          />
          <span class="ml-2 text-sm font-medium text-gray-700"
            >Add New Wine</span
          >
        </label>
      </div> -->

      <div class="mb-4">
        <label
          htmlFor="wineName"
          class="block text-sm font-medium text-gray-700"
        >
          Wine Name:
        </label>
        <input
          type="text"
          id="wineName"
          name="wineName"
          v-model.lazy.trim="formData.wineName"
          :disabled="!isNewWine && selectedWine"
          class="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div class="mb-4">
        <label htmlFor="year" class="block text-sm font-medium text-gray-700">
          Year:
        </label>
        <input
          type="number"
          id="year"
          name="year"
          min="1920"
          :max="new Date().getFullYear()"
          v-model.number.lazy="formData.year"
          :disabled="!isNewWine && selectedWine"
          class="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div class="mb-4">
        <label htmlFor="grape" class="block text-sm font-medium text-gray-700">
          Grape:
        </label>
        <input
          type="text"
          id="grape"
          name="grape"
          v-model.lazy="formData.grape"
          :disabled="!isNewWine && selectedWine"
          class="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div class="mb-4">
        <label htmlFor="year" class="block text-sm font-medium text-gray-700">
          Price:
        </label>
        <input
          type="number"
          id="price"
          name="price"
          min="0"
          step="0.01"
          v-model.number.lazy="formData.price"
          :disabled="!isNewWine && selectedWine"
          class="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div class="mb-4">
        <label htmlFor="image" class="block text-sm font-medium text-gray-700">
          Wine Image:
        </label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/*"
          class="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {{ loading ? "Submitting..." : "Submit" }}
        </button>
      </div>
    </form>
  </div>
</template>
