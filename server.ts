import Fastify from 'fastify'
import { getEnv } from './libs.js';

const fastify = Fastify({
    logger: true
})

fastify.get('/healthcheck', async function handler(request, reply) {
    return "Ok"
})

fastify.get('/ping', async function handler(request, reply) {
    return "Pong!"
})

fastify.get('/secret', async function handler(request, reply) {
    const secret = getEnv()
    return secret;
})

try {
    await fastify.listen({ host: '0.0.0.0', port: 3000 })
} catch (err) {
    fastify.log.error(err)
    process.exit(1)
}