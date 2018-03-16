import { Server } from "ws"
import { PORT, TICK } from "./../src/constants"
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
    const item1 = new Item()
    item1.name = "a wooden practice sword"
    item1.description = "A small wooden practice sword has been left here."
    item1.equipment = Equipment.Weapon
    item1.inventory = mob.inventory
    mob.inventory.items.push(item1)
    const item2 = new Item()
    item2.name = "a wooden practice mace"
    item2.description = "A small wooden practice mace has been left here."
    item2.equipment = Equipment.Weapon
    item2.inventory = mob.inventory
    mob.inventory.items.push(item2)
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
