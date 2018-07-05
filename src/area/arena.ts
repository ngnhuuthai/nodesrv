import roll, { getRandomInt } from "../dice/dice"
import { Mob } from "../mob/model/mob"
import { cardinalDirections, Direction } from "../room/constants"
import { getFreeReciprocalDirection, isCardinalDirection } from "../room/direction"
import { newReciprocalExit, newRoom } from "../room/factory"
import { Exit } from "../room/model/exit"
import { Room } from "../room/model/room"
import { persistExit, persistRoom } from "../room/service"

export class Arena {
  public connectingRoom: Room
  public exitRoom: Room
  public readonly matrix = []
  public readonly rooms: Room[] = []
  public readonly exits: Exit[] = []
  private readonly mobFactory: () => Mob
  private built = false

  constructor(
    public readonly root: Room,
    public readonly width: number,
    public readonly height: number, mobFactory: () => Mob) {
    this.mobFactory = mobFactory
  }

  public async buildMatrix() {
    if (this.built) {
      return
    }
    await this.createMatrix(this.root)
    const connectingRooms = this.getConnectingRooms(this.root)
    this.connectingRoom = connectingRooms[0]
    this.exitRoom = connectingRooms[1]
    this.built = true
  }

  private getConnectingRooms(root): Room[] {
    if (this.hasNoAvailableConnections(root)) {
      throw new Error("root has no available connections")
    }

    const connectingRoom = this.getRandomEdge()
    const exitRoom = this.getRandomEdge()

    if (!getFreeReciprocalDirection(root, connectingRoom)) {
      return this.getConnectingRooms(root)
    }

    return [connectingRoom, exitRoom]
  }

  private async createMatrix(root: Room) {
    for (let y = 0; y < this.height; y++) {
      this.matrix[y] = []
      for (let x = 0; x < this.width; x++) {
        this.matrix[y][x] = await persistRoom(newRoom(root.name, root.description))
        if (roll(1, 2) === 1) {
          this.matrix[y][x].mobs.push(this.mobFactory())
        }
        await this.connectRoomAtCoords(x, y)
      }
    }
  }

  private getRandomEdge(): Room {
    const sideOfMatrix = roll(1, 4)
    if (sideOfMatrix === 1) {
      return this.matrix[0][getRandomInt(this.width - 1)]
    } else if (sideOfMatrix === 2) {
      return this.matrix[getRandomInt(this.height - 1)][this.width - 1]
    } else if (sideOfMatrix === 3) {
      return this.matrix[this.height - 1][getRandomInt(this.width - 1)]
    } else if (sideOfMatrix === 4) {
      return this.matrix[getRandomInt(this.height - 1)][0]
    }
  }

  private async connectRoomAtCoords(x: number, y: number) {
    const current = this.matrix[y][x]

    if (x > 0) {
      await this.addReciprocalExitToArena(Direction.West, current, this.matrix[y][x - 1])
    }

    if (y > 0) {
      await this.addReciprocalExitToArena(Direction.North, current, this.matrix[y - 1][x])
    }

    this.rooms.push(current)
  }

  private async addReciprocalExitToArena(direction: Direction, room1: Room, room2: Room) {
    const exits = newReciprocalExit(direction, room1, room2)
    await persistExit(exits)
    this.exits.push(...exits)
  }

  private hasNoAvailableConnections(room: Room) {
    return room.exits.filter((e) => isCardinalDirection(e.direction)).length === cardinalDirections.length
  }
}
