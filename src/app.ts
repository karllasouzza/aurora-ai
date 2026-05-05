import { join } from 'node:path'
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload'
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify'
import { ZodError } from 'zod'

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {

}
const options: AppOptions = {
}

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  // Global error handler
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error)

    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: 'Validation error',
        statusCode: 400,
        details: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }

    const err = error as any
    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal Server Error'

    return reply.status(statusCode).send({
      error: message,
      statusCode,
      ...(statusCode === 500 && { details: err.stack }),
    })
  })

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  // eslint-disable-next-line no-void
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  // eslint-disable-next-line no-void
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts
  })
}

export default app
export { app, options }
