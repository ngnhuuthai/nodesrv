import * as assert from "assert"
import { findOneRoom } from "../src/room/repository/room"
import newServer from "../src/server/factory"

/**
 * Obtain the start room ID and port from arguments passed in
 */
const startRoomID = +process.argv[2]
const port = +process.argv[3]

assert.ok(startRoomID > 0, "start room ID is required to be a number")
console.log("starting up", { port, startRoomID })
findOneRoom(startRoomID).then((startRoom) => newServer(startRoom, port).start())
