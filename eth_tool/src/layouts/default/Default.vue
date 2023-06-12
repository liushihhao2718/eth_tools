<template>
  <v-card>
    <v-layout>
      <v-navigation-drawer
        class="bg-blue-grey-lighten-4"
        theme="dark"
        permanent
      >
        <v-list
          color="transparent"
          :key="link.path"
          v-for="link in this.$router.getRoutes().slice(0, -1)"
        >
          <v-list-item
            :prepend-icon="link.meta.icon"
            :title="link.name"
            @click="this.$router.push(link.path)"
          ></v-list-item>
          <v-divider></v-divider>
        </v-list>

        <template v-slot:append>
          <div class="pa-2">
            <v-btn block> Logout </v-btn>
          </div>
        </template>
      </v-navigation-drawer>
      <v-main
        :style="{ height: '100vh', display: 'flex', flexDirection: 'column', overflowY:'scroll' }"
      >
        <router-view></router-view>
        <v-footer
          :style="{ marginTop: 'auto', flexGrow: 0, backgroundColor: 'black' }"
        >
          <p :style="{ margin: 'auto', color: 'white' }">
            {{ new Date().getFullYear() }} — <strong>Asusmeta</strong>
          </p>
        </v-footer>
      </v-main>
    </v-layout>
  </v-card>
</template>
