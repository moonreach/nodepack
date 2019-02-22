const commonCommandOptions = require('../util/commonCommandOptions')

/** @type {import('../../types/ServicePlugin').ServicePlugin} */
module.exports = (api, options) => {
  api.registerCommand('dev', {
    description: 'Build and live-reload the app',
    usage: 'nodepack-service dev [entry]',
    options: {
      '-p, --port [port]': 'Specify a default port for process.env.PORT (it may automatically change if not available)',
      ...commonCommandOptions,
    },
  }, async (args) => {
    const path = require('path')
    const { info, error, chalk, terminate } = require('@nodepack/utils')

    info(chalk.blue('Preparing development pack...'))

    // Entry
    const { getDefaultEntry } = require('../util/defaultEntry.js')
    options.entry = getDefaultEntry(api, options, args)

    const moreEnv = {}

    // Default port
    if (!process.env.PORT || args.port) {
      const { getDefaultPort } = require('../util/defaultPort')
      const port = await getDefaultPort(api, options, args)
      moreEnv.PORT = port
      if (api.service.env === 'development') {
        info(chalk.blue(`\`process.env.PORT\` has been set to ${port}`))
      }
    }

    // Build
    const webpack = require('webpack')
    const webpackConfig = await api.resolveWebpackConfig()
    const execa = require('execa')

    /** @type {import('child_process').ChildProcess} */
    let child
    let terminated = false
    let terminating = null

    const compiler = webpack(webpackConfig)

    // Implement pause to webpack compiler
    // For example, this is useful for error diagnostics
    injectPause(compiler)

    compiler.watch(
      webpackConfig.watchOptions,
      async (err, stats) => {
        if (err) {
          error(err)
        } else {
          // Kill previous process
          if (child && !terminated) {
            try {
              terminating = child
              const result = await terminate(child, api.getCwd())
              if (result.error) {
                error(`Couldn't terminate process ${child.pid}: ${result.error}`)
              }
            } catch (e) {
              console.error(e)
            }
          }

          if (stats.hasErrors()) {
            error(`Build failed with errors.`)
          } else {
            if (child) {
              info(chalk.blue('App restarting...'))
            } else {
              info(chalk.blue('App starting...'))
            }

            terminated = false

            // Built entry file
            const file = api.resolve(path.join(webpackConfig.output.path, 'app.js'))

            // Spawn child process
            child = execa('node', [
              file,
            ], {
              stdio: ['inherit', 'inherit', 'inherit'],
              cwd: api.getCwd(),
              cleanup: true,
              shell: false,
              env: moreEnv,
            })

            child.on('error', err => {
              error(err)
              terminated = true
            })

            child.on('exit', (code, signal) => {
              if (terminating !== child) {
                if (code !== 0) {
                  info(chalk.red(`App exited with error code ${code} and signal '${signal}'.`))
                } else {
                  info(chalk.green('App exited, waiting for changes...'))
                }
              }
              terminated = true
            })
          }
        }
      }
    )
  })
}

function injectPause (compiler) {
  compiler.$_pause = false
  const compile = compiler.compile
  compiler.compile = (...args) => {
    if (compiler.$_pause) return
    return compile.call(compiler, ...args)
  }
}

// @ts-ignore
module.exports.defaultModes = {
  inspect: 'development',
}
