import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';

import postcss from "rollup-plugin-postcss";

// ...

import babel from '@rollup/plugin-babel';




import alias from '@rollup/plugin-alias'
import path from 'path'

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;
	
	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js'
	},
	plugins: [
		alias({
			entries: [
				{
					find: "@",
					replacement: path.resolve(__dirname, "src/")
				}
			]
		}),

	
	
		svelte({
			// enable run-time checks when not in production
			dev: !production,
			// we'll extract any component CSS out into
			// a separate file - better for performance
			css: css => {
				css.write('bundle2.css');
			}
		}),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		
	
		
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),

		babel({
		  extensions: ['.js', '.mjs', '.html', '.svelte'],
		  //runtimeHelpers: true,
		  exclude: ['node_modules/@babel/**'],
		  presets: [ ['@babel/preset-env', { targets: '> 0.25%, not dead' }] ],
		  babelHelpers: 'runtime',
		  plugins: [
			'@babel/plugin-syntax-dynamic-import',
			'@babel/plugin-syntax-import-meta',
			['@babel/plugin-transform-runtime', { useESModules: true }]
		  ]
		  
		}),
		
		postcss({
		  extract: true,
		  minimize: true,
		  use: [
			['sass', {
			  includePaths: [
				'./src/theme',
				'./node_modules'
			  ]
			}]
		  ]
		}),


		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};
