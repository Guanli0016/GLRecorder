import path from 'path';
import ts from 'rollup-plugin-typescript2';
import terser from '@rollup/plugin-terser';
import babel from '@rollup/plugin-babel';

export default [
    {
        input: './src/core/Recorder.ts',
        output: {
            file: path.resolve(__dirname, './dist/GLRecorder.min.js'),
            format: 'umd',
            name: 'GLRecorder'
        },
        plugins: [
            ts(),
            terser(),
            babel({ babelHelpers: 'bundled' }),
        ]
    }, {
        input: './src/core/Recorder.ts',
        output: {
            file: path.resolve(__dirname, './dist/GLRecorder.esm.js'),
            format: 'es',
        },
        plugins: [
            ts(),
            terser(),
            babel({ babelHelpers: 'bundled' }),
        ]
    }, {
        input: './src/workers/RecorderWorker.ts',
        output: {
            file: path.resolve(__dirname, './dist/recorder-worker.js'),
            format: 'es',
        },
        plugins: [
            ts(),
            terser(),
            babel({ babelHelpers: 'bundled' }),
        ]
    }, {
        input: './node_modules/lamejs/lame.min.js',
        output: {
            file: path.resolve(__dirname, './dist/lame.min.js'),
            format: 'es',
        },
        plugins: [ ]
    }
]