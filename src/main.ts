import { createApp } from "vue";
import App from "@/App.vue";
import router from "@/helpers/router";
import { createPinia } from "pinia";
import "@/styles/style.css";
// import "./styles/bootstrap.styles.scss";
// import "bootstrap";
import "mdb-ui-kit";
import "mdb-ui-kit/css/mdb.min.css";
import { FontAwesomeIcon } from "./libs/font-awesome";
import NavBar from "@/components/NavBar.vue";

const pinia = createPinia();

const app = createApp(App).use(router).use(pinia).component("font-awesome-icon", FontAwesomeIcon);

app.component(NavBar.name, NavBar);

app.mount("#app");
