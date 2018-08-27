import * as assert from "assert"
import { getMobRepository } from "../src/mob/repository/mob"
import Table from "../src/mob/table"
import { Room } from "../src/room/model/room"
import { getRoomRepository } from "../src/room/repository/room"
import Service from "../src/room/service"
import { default as RoomTable } from "../src/room/table"
import newServer from "../src/server/factory"

/**
 * Obtain the start room ID and port from arguments passed in
 */
const startRoomID = process.argv[2]
const port = +process.argv[3]

assert.ok(startRoomID, "start room ID is required to be defined")
console.info("loading start room", { startRoomID })

async function startServer(service: Service, startRoom: Room) {
  console.info("starting up server", { port })
  return newServer(service, port, startRoom).start()
}

export async function newMobTable() {
  const mobRepository = await getMobRepository()
  const models = await mobRepository.findAll()
  console.debug(`mob table initialized with ${models.length} mobs`)
  return new Table(models)
}

async function newRoomTable(): Promise<RoomTable> {
  const roomRepository = await getRoomRepository()
  const models = await roomRepository.findAll()
  console.debug(`room table initialized with ${models.length} rooms`)
  return RoomTable.new(models)
}

Promise.all([
  newRoomTable(),
  newMobTable(),
]).then(async ([roomTable, mobTable]) =>
  startServer(await Service.new(roomTable, mobTable), roomTable.get(startRoomID)))
