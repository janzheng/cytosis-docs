import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import globals from 'rollup-plugin-node-globals';
import commonjs from 'rollup-plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';
import {config} from 'dotenv';
import replace from '@rollup/plugin-replace';
// import autoPreprocess from 'svelte-preprocess';
import { scss } from 'svelte-preprocess';
import sass from 'rollup-plugin-sass';

const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/bundle.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/bundle.js'
	},
	plugins: [
    json(),
    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      runtimeHelpers: true,
      presets: [
      	// 'react', 'es2015-rollup', 'stage-0',
	      ['@babel/preset-env', {
	        // debug: true,
	        // useBuiltIns: 'usage',
	        targets: {
	          "browsers": ["> 1%", "ie >= 11", "not ie <= 8"]
	          // "browsers": ["> 1%", "last 2 versions", "ie >= 11", "not ie <= 8"]
	        }
	      }]
      ],
      // plugins: ['@babel/plugin-transform-runtime'],

      plugins: [
      	'@babel/plugin-transform-arrow-functions', 
      	'@babel/plugin-syntax-dynamic-import', 
      	'@babel/plugin-transform-typeof-symbol', 
      	'@babel/plugin-transform-runtime'
      ],
    }),
		svelte({
			// enable run-time checks when not in production
			dev: !production,
			// we'll extract any component CSS out into
			// a separate file — better for performance
			// preprocess: autoPreprocess(),
			preprocess: [
				scss(),
			],
			// css: css => {
			// 	css.write('public/bundle.css');
			// }
		}),

		sass({
			// this is translates coeur straight into the css file
			output: true,
		}),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration —
		// consult the documentation for details:
		// https://github.com/rollup/rollup-plugin-commonjs
		resolve({
			browser: true,
			dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
		}),
		commonjs(),
		globals(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: true
	}
};
