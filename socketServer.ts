import { createServer } from "http"
import { Server } from "socket.io"

console.log("Starting Socket.IO server...")

const httpServer = createServer()
const io = new Server(httpServer, {
  path: "/api/socket",
  cors: {
    origin: "*",
  },
})

io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`)

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`)
  })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO server is running on port http://localhost:${PORT}`)
})