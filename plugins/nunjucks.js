import path from 'path'
import nunjucks from 'nunjucks'

// Renders every HTML entry through Nunjucks before Vite processes it.
// Replaces vite-plugin-nunjucks, which only supports Vite 5.
// Template paths resolve from the project root (e.g. `src/layouts/master.html`).
export default function nunjucksPlugin({ templatesDir, variables = {}, filters = {} } = {}) {
    const env = nunjucks.configure({ noCache: true })
    Object.entries(filters).forEach(([name, filter]) => env.addFilter(name, filter))

    return {
        name: 'mazer-nunjucks',
        enforce: 'pre',
        transformIndexHtml: {
            order: 'pre',
            handler(html, ctx) {
                const pageVariables = variables[path.basename(ctx.path)] || {}
                return new Promise((resolve, reject) => {
                    env.renderString(html, pageVariables, (err, res) => (err ? reject(err) : resolve(res)))
                })
            },
        },
        handleHotUpdate({ file, server }) {
            if (!path.resolve(file).startsWith(templatesDir) || !file.endsWith('.html')) return
            server.ws.send({ type: 'full-reload' })
            return []
        },
    }
}
