// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        meta:{
          icon:"mdi-view-dashboard",
        },
        
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
      },
      {
        path:'/trans_data',
        name:'Transcation Data',
        meta:{
          icon:"mdi-account-box",
        },
        component: () => import('@/views/TranscationData.vue')
      },
      {
        path:'/abi_decoder',
        name:'ABI Decoder',
        meta:{
          icon:"mdi-account-details"
        },
        component: () => import('@/views/AbiDecoder.vue')
      },
      {
        path:'/abi_format',
        name:'ABI Format',
        meta:{
          icon:"mdi-format-list-group"
        },
        component: () => import('@/views/AbiFormat.vue')
      },
      {
        path:'/transcation',
        name:'Tx Hash detail',
        meta:{
          icon:"mdi-file-arrow-left-right"
        },
        component: () => import('@/views/txHashDetail.vue')
      },
      {
        path:'/contract',
        name:'Contract Interaction',
        meta:{
          icon:"mdi-file-document-edit-outline"
        },
        component: () => import('@/views/ContractInteraction.vue')
      }
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
