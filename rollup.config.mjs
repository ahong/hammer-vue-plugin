import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

export default {
    input: 'src/main.js',
    output: {
        format: 'umd',
        file: 'hammer-vue-plugin.js',
        name: 'HammerVuePlugin',
        globals: {
            hammerjs: 'Hammer'
        }
    },
    plugins: [babel({ babelHelpers: 'bundled' }), terser()],
    external: ['hammerjs']
};
