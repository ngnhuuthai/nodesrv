import * as assert from "assert"
import { Server as WebSocketServer } from "ws"
import { Room } from "../room/model/room"
import addObservers from "./observerDecorator"
import { GameServer } from "./server"

const PORT_MIN = 1080
const PORT_MAX = 65535

export default function newServer(startRoom: Room, port: number): GameServer {
  assert.ok(port > PORT_MIN && port < PORT_MAX, `port must be between ${PORT_MIN} and ${PORT_MAX}`)
  assert.ok(startRoom !== null, "Start room cannot be null")
  return addObservers(new GameServer(new WebSocketServer({ port }), startRoom))
}
