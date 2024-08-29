<script setup lang="ts">
import { createSupabaseClient } from "../utils/supabase/client.ts";
import { ref, reactive } from "vue";

const supabase = createSupabaseClient();
const loading = ref(false);
const selectedWine = ref<any>(null);
const isNewWine = ref(false);
const imageUploadRef = ref<HTMLFormElement | null>(null);

// Form state
const formData = reactive({
  wineName: "",
  year: null,
  grape: "",
  price: null,
});

const handleSubmit = async (e: Event) => {
  e.preventDefault();

  loading.value = true;

  const { wineName, year, grape, price } = formData;

  const imageFile = imageUploadRef.value!.files[0] as File;
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

  let wineId: number = selectedWine ? selectedWine.id : null;

  if (!wineId && isNewWine) {
    const { error: newWineError } = await supabase.from("wines").insert({
      wine_name: wineName,
      year: parseInt(year!),
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
        <label htmlFor="grape" class="block text-sm font-medium text-gray-700">
          Country:
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
        <label htmlFor="grape" class="block text-sm font-medium text-gray-700">
          Region:
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
          ref="imageUploadRef"
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
