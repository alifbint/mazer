import { defineConfig, normalizePath, build } from 'vite'
import fs from 'fs'
import path, { resolve } from 'path'
import { fileURLToPath } from 'url';
import nunjucks from './plugins/nunjucks.js'
import { viteStaticCopy } from 'vite-plugin-static-copy';
import rtlcss from 'rtlcss'
import sidebarItems from "./src/sidebar-items.json" with { type: "json" }
import horizontalMenuItems from "./src/horizontal-menu-items.json" with { type: "json" }

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = resolve(__dirname, 'src')

const getFiles = () => {
    let files = {}

    fs.readdirSync(root)
        .filter(filename => filename.endsWith('.html'))
        .forEach(filename => {
            files[filename.slice(0, -5)] = resolve(root, filename)
        })
    return files
}

const files = getFiles()

const getVariables = (mode) => {
    const variables = {}
    Object.keys(files).forEach((filename) => {
        if (filename.includes('layouts')) filename = `layouts/${filename}`
        variables[filename + '.html'] = {
            web_title: "Mazer Admin Dashboard",
            sidebarItems,
            horizontalMenuItems,
            isDev: mode === 'development'
        }
    })
    return variables
}

// Modules and extensions
// If the value is true, then it will copy the files inside the `dist` folders
// But if the value is false, it will copy the entire module files and folders
const modulesToCopy = {
    "@icon/dripicons": false, // With dist folder = false
    "@fortawesome/fontawesome-free": false,
    "@melloware/coloris": true,
    "rater-js": true,
    "bootstrap-icons": false,
    apexcharts: true,
    "perfect-scrollbar": true,
    flatpickr: true,
    filepond: true,
    "filepond-plugin-file-validate-size": true,
    "filepond-plugin-file-validate-type": true, 
    "filepond-plugin-image-crop": true,
    "filepond-plugin-image-exif-orientation": true, 
    "filepond-plugin-image-filter": true,
    "filepond-plugin-image-preview": true,
    "filepond-plugin-image-resize": true,
    "feather-icons": true,
    dragula: true,
    dayjs: false,
    moment: false,
    "moment-timezone": false,
    "chart.js": true,
    "choices.js": false,
    parsleyjs: true,
    sweetalert2: true,
    summernote: true,
    jquery: true,
    quill: true,
    tinymce: false,
    "toastify-js": false,
    "datatables.net": false,
    "datatables.net-bs5": false,
    "simple-datatables": true, 
    jsvectormap: true,
    "vis-network": true,
}

// Copy every file inside `dir` into `dest`, keeping the structure below `dir`.
// Globs are resolved from `root`; stripBase drops the leading dir segments ('..' is not counted).
const copyDir = (dir, dest) => {
    const base = normalizePath(path.relative(root, resolve(__dirname, dir)))
    return {
        src: `${base}/**/*`,
        dest,
        rename: { stripBase: base.split('/').filter(segment => segment !== '..').length },
    }
}

const copyModules = Object.keys(modulesToCopy).map(moduleName => {
    const withDist = modulesToCopy[moduleName]
    return copyDir(`./node_modules/${moduleName}${withDist ? '/dist' : ''}`, `assets/extensions/${moduleName}`)
})

// Run rtlcss only on *-rtl.scss entries (app-rtl.scss, app-dark-rtl.scss), so the RTL layout also works in dev
const rtlcssForRtlFiles = () => ({
    postcssPlugin: 'rtlcss-rtl-files',
    Once(root, { postcss }) {
        const file = root.source?.input.file ?? ''
        if (/-rtl\.scss$/.test(file)) postcss([rtlcss()]).process(root, { from: file }).sync()
    },
})

build({
    configFile: false,
    build: {
        emptyOutDir: false,
        outDir: resolve(__dirname, 'dist/assets/compiled/js'),
        lib: {
            name: 'app',
            formats: ['umd'],
            fileName: 'app',
            entry: './src/assets/js/app.js',
        },
        rolldownOptions: {
            output: {
                entryFileNames: '[name].js'
            }
        }
    },
})



export default defineConfig((env) => ({
    publicDir: 'static',
    base: './',
    root,
    plugins: [
        viteStaticCopy({
            targets: [
                copyDir('./src/assets/static', 'assets/static'),
                copyDir('./dist/assets/compiled/fonts', 'assets/compiled/css/fonts'),
                { src: normalizePath(resolve(__dirname, "./node_modules/bootstrap-icons/bootstrap-icons.svg")), dest: 'assets/static/images', rename: { stripBase: true } },
                ...copyModules
            ],
            watch: {
                reloadPageOnChange: true
            }
        }),
        nunjucks({
            templatesDir: root,
            variables: getVariables(env.mode),
            filters: {
                containString: (str, containStr) => {
                    if (!str.length) return false
                    return str.indexOf(containStr) >= 0
                },
                startsWith: (str, targetStr) => {
                    if (!str.length) return false
                    return str.startsWith(targetStr)
                }
            }
        })
    ],
    css: {
        postcss: {
            plugins: [rtlcssForRtlFiles()],
        },
        preprocessorOptions: {
            scss: {
                // Bootstrap 5.3 is written with @import and global functions; hide warnings from its own files
                quietDeps: true,
                // themes/dark/_bootstrap-components.scss must @import Bootstrap partials (no module API until Bootstrap 6)
                silenceDeprecations: ['import'],
            },
        },
    },
    resolve: {
        alias: {
            '@': normalizePath(resolve(__dirname, 'src')),
            '~bootstrap': resolve(__dirname, 'node_modules/bootstrap'),
            '~bootstrap-icons': resolve(__dirname, 'node_modules/bootstrap-icons'),
            '~perfect-scrollbar': resolve(__dirname, 'node_modules/perfect-scrollbar'),
        }
    },
    build: {
        emptyOutDir: false,
        manifest: true,
        target: "chrome58",
        outDir: resolve(__dirname, 'dist'),
        rolldownOptions: {
            input: files,
            output: {
                entryFileNames: `assets/compiled/js/[name].js`,
                chunkFileNames: `assets/compiled/js/[name].js`,
                // Both RTL stylesheets are used by the same pages, so keep them from being merged into one file
                codeSplitting: {
                    groups: [
                        { name: 'app-rtl', test: /[\\/]app-rtl\.scss/ },
                        { name: 'app-dark-rtl', test: /app-dark-rtl\.scss/ },
                    ],
                },

                assetFileNames: (a) => {
                    const extname = path.extname(a.names[0] ?? '').slice(1)
                    let folder = extname ? `${extname}/` : ''

                    // Put fonts into css folder
                    if (['woff', 'woff2', 'ttf'].includes(extname))
                        folder = 'fonts/'

                    return `assets/compiled/${folder}[name][extname]`
                }
            }
        },
    }
}))