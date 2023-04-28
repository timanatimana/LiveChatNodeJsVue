import { createWebHistory, createRouter, RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/store";

import Home from "@/components/Home.vue";
import Login from "@/components/Login.vue";
import Register from "@/components/Register.vue";
import { Roles } from "@/enums/roles.enums";
import { storeToRefs } from "pinia";
import authenticationService from "@/services/authentication.service";

// lazy-loaded
const Chat = () => import("@/components/Chat.vue");
const Profile = () => import("@/components/Profile.vue");
const AdminBoard = () => import("@/components/AdminBoard.vue");
const Message = () => import("@/components/Message.vue");
const PasswordReset = () => import("@/components/PasswordReset.vue");
const VerifyAccount = () => import("@/components/VerifyAccount.vue");

const routes: Readonly<RouteRecordRaw[]> = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
  {
    path: "/home",
    component: Home,
  },
  {
    path: "/logout",
    component: Message,
  },
  {
    path: "/message",
    component: Message,
  },
  {
    path: "/forgotpassword",
    component: Message,
  },
  {
    path: "/resetpassword",
    component: Message,
  },
  {
    path: "/passwordreset",
    component: PasswordReset,
  },
  {
    path: "/verifyaccount",
    component: VerifyAccount,
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/register",
    component: Register,
  },
  {
    path: "/postregister",
    component: Message,
  },
  {
    path: "/profile",
    name: "profile",
    component: Profile,
  },
  {
    path: "/chat",
    component: Chat,
  },
  {
    path: "/admin",
    name: "admin",
    component: AdminBoard,
    meta: { authorize: [Roles.Admin] },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: [...routes],
});

router.beforeEach(async (to, _, next) => {
  const publicPages = [
    "/login",
    "/register",
    "/logout",
    "/forgotpassword",
    "/passwordreset",
    "/resetpassword",
    "/verifyaccount",
    "/postregister",
    "/message",
  ];
  const authRequired = !publicPages.includes(to.path);

  const authStore = useAuthStore();
  const { getUser: authUser } = storeToRefs(authStore);
  const { authorize } = to.meta;

  // check if authentication needed
  if (authRequired && !authStore.isAuthenticated) {
    authStore.returnUrl = to.fullPath;

    const userId = localStorage.getItem("userId");
    if (userId) {
      authenticationService.logout(userId);
      localStorage.removeItem("userId");
    }
    next({ path: "/login" });
  }
  // next check if route is restricted by role
  else if (authorize) {
    if (!authUser.value) {
      // role not authorised so redirect to home page
      return next({ path: "/home" });
    }
    next();
  } else next();
});

export default router;
