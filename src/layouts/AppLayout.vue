<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { LayoutDashboard, Upload } from "lucide-vue-next";
import ApiModeBadge from "@/components/ApiModeBadge.vue";
import AppLogo from "@/components/AppLogo.vue";
import { cn } from "@/lib/utils";

const route = useRoute();

const navItems = [
  {
    label: "Upload & Detect",
    to: "/",
    icon: Upload,
    match: (path: string) => path === "/",
  },
  {
    label: "Analytics Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    match: (path: string) => path.startsWith("/dashboard"),
  },
];

const pageTitle = computed(
  () => (route.meta.title as string | undefined) ?? "Road Damage Detection",
);
const pageDescription = computed(
  () =>
    (route.meta.description as string | undefined) ??
    "AI-powered highway monitoring for Davao City",
);

function isActive(item: (typeof navItems)[number]) {
  return item.match(route.path);
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background">
    <header
      class="sticky top-0 z-[1000] border-b border-primary/20 bg-primary shadow-md"
    >
      <div
        class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        <RouterLink
          to="/"
          class="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div
            class="flex shrink-0 items-center rounded-lg bg-white px-2.5 py-1.5 shadow-sm ring-1 ring-white/30"
          >
            <AppLogo size="md" />
          </div>
          <div class="min-w-0 hidden md:block">
            <p
              class="truncate text-[11px] font-medium uppercase tracking-widest text-white/70"
            >
              Davao City Highways
            </p>
            <p class="truncate text-sm font-semibold leading-tight text-white">
              Road Damage Detection &amp; Reporting
            </p>
          </div>
        </RouterLink>

        <nav
          class="flex items-center gap-1 rounded-lg bg-black/15 p-1 ring-1 ring-white/10"
        >
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :class="
              cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all',
                isActive(item)
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-white/85 hover:bg-white/10 hover:text-white',
              )
            "
          >
            <component :is="item.icon" class="h-4 w-4 shrink-0" />
            <span class="hidden sm:inline">{{ item.label }}</span>
            <span class="sm:hidden">{{ item.label.split(" ")[0] }}</span>
          </RouterLink>
        </nav>

        <ApiModeBadge class="hidden shrink-0 md:inline-flex" />
      </div>
    </header>

    <div
      class="sticky top-16 z-[990] border-b border-border bg-card shadow-sm"
    >
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">
          {{ pageTitle }}
        </h1>
        <p class="mt-1 max-w-3xl text-sm text-muted-foreground">
          {{ pageDescription }}
        </p>
      </div>
    </div>

    <main class="relative z-0 flex-1 isolate">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <RouterView />
      </div>
    </main>

    <footer class="border-t border-border bg-card">
      <div
        class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-center text-xs text-muted-foreground sm:flex-row sm:px-6 sm:text-left lg:px-8"
      >
        <p>
          AI-Powered Road Damage Detection and Reporting System for Davao City
          Highways
        </p>
        <p>Davao City · Prototype v0.1</p>
      </div>
    </footer>
  </div>
</template>
