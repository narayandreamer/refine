import { Refine, AuthProvider } from "@pankod/refine";
import { DataProvider, AuthHelper } from "@pankod/refine-strapi-v4";
import routerProvider from "@pankod/refine-react-router";

import axios from "axios";

import "@pankod/refine/dist/styles.min.css";

import { PostList, PostCreate, PostEdit } from "pages/posts";
import { CategoryList, CategoryCreate, CategoryEdit } from "pages/categories";

import { TOKEN_KEY, API_URL } from "./constants";

const App: React.FC = () => {
    const axiosInstance = axios.create();
    const strapiAuthHelper = AuthHelper(API_URL + "/api");

    const authProvider: AuthProvider = {
        login: async ({ username, password }) => {
            const { data, status } = await strapiAuthHelper.login(
                username,
                password,
            );
            if (status === 200) {
                localStorage.setItem(TOKEN_KEY, data.jwt);

                // set header axios instance
                axiosInstance.defaults.headers = {
                    Authorization: `Bearer ${data.jwt}`,
                };

                return Promise.resolve;
            }
            return Promise.reject;
        },
        logout: () => {
            localStorage.removeItem(TOKEN_KEY);
            return Promise.resolve();
        },
        checkError: () => Promise.resolve(),
        checkAuth: () => {
            const token = localStorage.getItem(TOKEN_KEY);
            if (token) {
                axiosInstance.defaults.headers = {
                    Authorization: `Bearer ${token}`,
                };
                return Promise.resolve();
            }

            return Promise.reject();
        },
        getPermissions: () => Promise.resolve(),
        getUserIdentity: async () => {
            const token = localStorage.getItem(TOKEN_KEY);
            if (!token) {
                return Promise.reject();
            }

            const { data, status } = await strapiAuthHelper.me(token);
            if (status === 200) {
                const { id, username, email } = data;
                return Promise.resolve({
                    id,
                    username,
                    email,
                });
            }

            return Promise.reject();
        },
    };

    return (
        <Refine
            authProvider={authProvider}
            dataProvider={DataProvider(API_URL + "/api", axiosInstance)}
            routerProvider={routerProvider}
            resources={[
                {
                    name: "posts",
                    list: PostList,
                    create: PostCreate,
                    edit: PostEdit,
                },
                {
                    name: "categories",
                    list: CategoryList,
                    create: CategoryCreate,
                    edit: CategoryEdit,
                },
            ]}
        />
    );
};

export default App;
