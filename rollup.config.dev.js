import path from 'path';
import ts from 'rollup-plugin-typescript2';
import terser from '@rollup/plugin-terser';
import babel from '@rollup/plugin-babel';
import serve from 'rollup-plugin-serve';

export default [
    {
        input: './src/core/Recorder.ts',
        output: {
            file: path.resolve(__dirname, './test/GLRecorder.min.js'),
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
            file: path.resolve(__dirname, './test/GLRecorder.js'),
            format: 'umd',
            name: 'GLRecorder'
        },
        plugins: [
            ts(),
            babel({ babelHelpers: 'bundled' }),
            serve({
                contentBase: ['test'],
                port: 6600
            }),
        ]
    }, {
        input: './src/workers/RecorderWorker.ts',
        output: {
            file: path.resolve(__dirname, './test/recorder-worker.js'),
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
            file: path.resolve(__dirname, './test/lame.min.js'),
            format: 'es',
        },
        plugins: [ ]
    }
]