import { Server } from "ws"
import { PORT, TICK } from "./../src/constants"
import { getConnection } from "./../src/db/connection"
import { DiceRoller } from "./../src/dice/dice"
import { Equipment } from "./../src/item/equipment"
import { Item } from "./../src/item/model/item"
import { Mob } from "./../src/mob/model/mob"
import { Player } from "./../src/player/model/player"
import { Room } from "./../src/room/model/room"
import { findOneRoom } from "./../src/room/repository/room"
import { PersistMobs } from "./../src/server/observers/persistMobs"
import { PersistPlayers } from "./../src/server/observers/persistPlayers"
import { SocialBroadcaster } from "./../src/server/observers/socialBroadcaster"
import { Tick } from "./../src/server/observers/tick"
import { GameServer } from "./../src/server/server"
import { MinuteTimer } from "./../src/server/timer/minuteTimer"
import { RandomTickTimer } from "./../src/server/timer/randomTickTimer"
import { ShortIntervalTimer } from "./../src/server/timer/shortIntervalTimer"

const startRoomID = +process.argv[2]

function addObservers(gameServer: GameServer): GameServer {
  gameServer.addObserver(
    new Tick(),
    new RandomTickTimer(
      new DiceRoller(TICK.DICE.SIDES, TICK.DICE.ROLLS, TICK.DICE.MODIFIER)))
  gameServer.addObserver(new PersistPlayers(), new MinuteTimer())
  gameServer.addObserver(new PersistMobs(), new MinuteTimer())
  gameServer.addObserver(new SocialBroadcaster(), new ShortIntervalTimer())

  return gameServer
}

function getPlayerProvider(startRoom: Room) {
  return (name: string): Player => {
    const mob = new Mob()
    mob.name = "pat"
    mob.description = "a description for Pat."
    mob.room = startRoom
    const item = new Item()
    item.name = "a wooden practice sword"
    item.description = "A small wooden practice sword has been left here."
    item.equipment = Equipment.Weapon
    item.inventory = mob.inventory
    mob.inventory.items.push(item)
    const player = new Player()
    player.name = "pat"
    player.mobs.push(mob)
    player.sessionMob = mob

    return player
  }
}

console.log("starting up", { port: PORT, startRoomID })

findOneRoom(startRoomID).then((startRoom) =>
  addObservers(
    new GameServer(
      new Server({ port: PORT }),
      getPlayerProvider(startRoom))).start())
