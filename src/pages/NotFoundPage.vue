<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { MapPinOff } from 'lucide-vue-next'
import AppLogo from '@/components/AppLogo.vue'
import { Button } from '@/components/ui/button'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardDescription from '@/components/ui/card/CardDescription.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background">
    <header class="border-b border-primary/20 bg-primary px-4 py-4 shadow-md sm:px-6">
      <RouterLink
        to="/"
        class="mx-auto flex max-w-lg items-center justify-center gap-3 rounded-lg bg-white px-4 py-2 shadow-sm"
      >
        <AppLogo size="lg" />
      </RouterLink>
    </header>

    <main class="flex flex-1 items-center justify-center px-4 py-12">
      <Card class="w-full max-w-md text-center">
        <CardHeader class="items-center">
          <div class="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <MapPinOff class="h-7 w-7 text-muted-foreground" />
          </div>
          <CardTitle>Page Not Found</CardTitle>
          <CardDescription>
            The page you are looking for does not exist in this prototype.
          </CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button as-child>
            <RouterLink to="/">Upload & Detect</RouterLink>
          </Button>
          <Button as-child variant="outline">
            <RouterLink to="/dashboard">Analytics Dashboard</RouterLink>
          </Button>
        </CardContent>
      </Card>
    </main>
  </div>
</template>
