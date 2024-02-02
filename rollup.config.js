import path from 'path';
import ts from 'rollup-plugin-typescript2';
import { dts } from 'rollup-plugin-dts';
import terser from '@rollup/plugin-terser';

export default [
    {
        input: './src/core/recorder.ts',
        output: {
            file: path.resolve(__dirname, './dist/GLRecorder.min.js'),
            format: 'umd',
            name: 'GLRecorder'
        },
        plugins: [
            ts(),
            terser(),
        ]
    }, {
        input: './src/workers/recorder-worker.ts',
        output: {
            file: path.resolve(__dirname, './dist/recorder-worker.js'),
            format: 'es',
        },
        plugins: [
            ts(),
            terser(),
        ]
    }, {
        input: './node_modules/lamejs/lame.min.js',
        output: {
            file: path.resolve(__dirname, './dist/lame.min.js'),
            format: 'es',
        },
        plugins: [ ]
    }, {
        input: './src/core/recorder.ts',
        output: {
            file: path.resolve(__dirname, './dist/GLRecorder.d.ts'),
            format: 'es',
        },
        plugins: [
            dts()
        ]
    }
]