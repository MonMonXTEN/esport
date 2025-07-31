import { createServer } from "node:http"
import next from "next"
import { Server } from "socket.io"

const dev = process.env.NODE_ENV !== "production"
const hostname = process.env.HOSTNAME || "localhost"
const port = Number(process.env.PORT) || 3000
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port, turbopack: true })
const handler = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(handler)
  const io = new Server(httpServer)
  global.io = io

  io.on("connection", (socket) => {
    console.log(`👌 User connected: ${socket.id}`)

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`)
    })
  })

  httpServer
    .once("error", (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})