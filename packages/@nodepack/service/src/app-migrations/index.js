/** @type {import('@nodepack/service').MigrationPlugin} */
module.exports = api => {
  api.register({
    id: 'defaultTemplate',
    title: 'Template: Render default template',
    up: async (api, options) => {
      api.render('./templates/default')

      // Add scripts
      api.extendPackage({
        scripts: {
          'dev': 'nodepack-service dev',
          'build': 'nodepack-service build',
          'start': 'node ./dist/app.js',
        },
        dependencies: {
          '@nodepack/app': '^0.6.0',
          '@nodepack/app-context': '^0.6.0',
        },
      })
    },
    down: (api, options) => {
      api.unrender('./templates/default')

      // Remove scripts
      api.modifyFile('package.json', content => {
        // @ts-ignore
        const data = JSON.parse(content)
        const scripts = data.scripts
        if (scripts) {
          for (const key in scripts) {
            if (scripts[key].match(/nodepack-service (dev|build)/)) {
              scripts[key] = undefined
            }
          }
        }
        return JSON.stringify(data, null, 2)
      })
    },
  })
}
