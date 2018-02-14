import * as fs from "fs"
import { db, generateName } from "./../src/db"
import Player from "./../src/player/model"
import { Direction } from "./../src/room/constants"
import { Exit } from "./../src/room/exit"
import { saveRooms } from "./../src/room/model"
import { Room } from "./../src/room/room"

const room1 = generateName()
const room2 = generateName()
const room3 = generateName()
const player = generateName()

db.query("MATCH (n) DETACH DELETE n", () => {
  saveRooms([
    new Room(
      room1,
      "Inn at the lodge",
      "Flickering torches provide the only light in the large main mess hall. "
      + "The room is filled with the chatter of travellers preparing for the journey ahead.",
      [
        new Exit(room2, Direction.North),
        new Exit(room3, Direction.South),
      ],
    ),
    new Room(
      room2,
      "A cozy room at the Inn",
      "Something about a room in the inn.",
      [
        new Exit(room1, Direction.South),
      ],
    ),
    new Room(
      room3,
      "At the crossroads",
      "Something about crossroads.",
      [
        new Exit(room1, Direction.North),
      ],
    ),
  ])

  Player.save({
    name: player,
    room: room1,
  })

  function getModelJSON() {
    return JSON.stringify({
      player,
      room1,
      room2,
      room3,
    }, null, 2)
  }

  const modelJSON = getModelJSON()

  fs.writeFile(
    `${process.argv[2]}/fixture-ids.txt`,
    modelJSON,
    () => console.log(modelJSON),
  )
})