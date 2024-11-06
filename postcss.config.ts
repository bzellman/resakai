import { Plugin } from 'postcss';

const config: {
    plugins: {
        [key: string]: Plugin | {};
    };
} = {
    plugins: {
        tailwindcss: {},
        autoprefixer: {}
    }
};

export default config;
