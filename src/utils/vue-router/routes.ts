import { createRouter, createWebHistory } from "vue-router";
import HomeView from "./../../components/HomeView.vue";
import AddWineView from "./../../components/AddWineView.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/add-wine", component: AddWineView },
];

export const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});
