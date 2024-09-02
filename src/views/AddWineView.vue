<script setup lang="ts">
import { createSupabaseClient } from "../utils/supabase/client.ts";
import { ref, reactive } from "vue";

interface Country {
  id: number;
  name: string;
}

interface Region {
  id: number;
  name: string;
  country_id: number;
}

const supabase = createSupabaseClient();
const loading = ref(false);
const imageUploadRef = ref<HTMLFormElement | null>(null);
const countrySuggestions = ref<Country[]>([]);
const regionSuggestions = ref<Region[]>([]);

// Form state
const formData = reactive({
  wineName: "",
  year: null as number | null,
  grape: "",
  countryId: null as number | null,
  countryName: "",
  regionId: null as number | null,
  regionName: "",
  price: null as number | null,
});

const handleCountrySearch = async (e: Event) => {
  formData.countryId = null;
  const query = (e.target as HTMLInputElement).value;
  if (query.length >= 2) {
    // Only search if the query is longer than 2 characters
    const { data, error } = await supabase
      .from("countries")
      .select("id, name")
      .ilike("name", `%${query}%`)
      .limit(10);
    if (error) {
      console.error(error);
    } else if (data.length > 0) {
      countrySuggestions.value = data;
    } else {
      formData.countryName = query;
    }
  } else {
    countrySuggestions.value = [];
    formData.countryName = query;
  }
};

const handleCountrySelect = (e: Event) => {
  formData.countryId = (e.target as HTMLLIElement).value;
  formData.countryName = (e.target as HTMLLIElement).innerText;
  countrySuggestions.value = [];
};

const handleRegionSearch = async (e: Event) => {
  const query = (e.target as HTMLInputElement).value;
  if (query.length >= 2) {
    // Only search if the query is longer than 2 characters
    const { data, error } = await supabase
      .from("regions")
      .select("id, name, country_id")
      .eq("country_id", formData.countryId)
      .ilike("name", `%${query}%`)
      .limit(10);
    if (error) {
      console.error(error);
    } else if (data.length > 0) {
      regionSuggestions.value = data;
    } else {
      formData.regionName = query;
    }
  } else {
    regionSuggestions.value = [];
    formData.regionName = query;
  }
};

const handleRegionSelect = (e: Event) => {
  formData.regionId = (e.target as HTMLLIElement).value;
  formData.regionName = (e.target as HTMLLIElement).innerText;
  regionSuggestions.value = [];
};

const handleSubmit = async (e: Event) => {
  e.preventDefault();

  loading.value = true;

  const {
    wineName,
    year,
    grape,
    countryId,
    countryName,
    regionId,
    regionName,
    price,
  } = formData;

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

  const { error: newWineError } = await supabase.rpc("add_wine", {
    wine_name: wineName,
    year: year,
    grape: grape,
    country_id: countryId,
    country_name: countryName,
    region_id: regionId,
    region_name: regionName,
    price: price,
    image_url: imageUrlData?.publicUrl,
  });

  if (newWineError) {
    console.error(newWineError);
    loading.value = false;
    return;
  }
  alert("Wine submitted successfully!");
  loading.value = false;
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
          class="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div class="mb-4">
        <label
          htmlFor="country"
          class="block text-sm font-medium text-gray-700"
        >
          Country:
        </label>
        <input
          type="text"
          id="country"
          name="country"
          @change="handleCountrySearch"
          :value="formData.countryName"
          class="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />

        <ul
          v-if="countrySuggestions.length > 0"
          className="border border-gray-300 rounded-md mt-2 bg-white max-h-48 overflow-y-auto"
        >
          <li
            v-for="country in countrySuggestions"
            key="{country.id}"
            @click="handleCountrySelect"
            className="p-2 cursor-pointer hover:bg-indigo-100"
            :value="country.id"
          >
            {{ country.name }}
          </li>
        </ul>
      </div>
      <div class="mb-4">
        <label htmlFor="region" class="block text-sm font-medium text-gray-700">
          Region:
        </label>
        <input
          type="text"
          id="region"
          name="region"
          @change="handleRegionSearch"
          :value="formData.regionName"
          class="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
        <ul
          v-if="regionSuggestions.length > 0"
          className="border border-gray-300 rounded-md mt-2 bg-white max-h-48 overflow-y-auto"
        >
          <li
            v-for="region in regionSuggestions"
            key="{region.id}"
            @click="handleRegionSelect"
            className="p-2 cursor-pointer hover:bg-indigo-100"
            :value="region.id"
          >
            {{ region.name }}
          </li>
        </ul>
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
