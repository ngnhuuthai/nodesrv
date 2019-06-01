import { Room } from "../model/room"

export default class RoomTable {
  public static new(rooms: Room[]) {
    const roomsById = {}
    rooms.forEach(room => roomsById[room.uuid] = room)
    return new RoomTable(roomsById)
  }

  constructor(private readonly roomsById: object = {}) {}

  public getRooms(): Room[] {
    return Object.values(this.roomsById)
  }

  public get(uuid: string): Room {
    return this.roomsById[uuid]
  }

  public add(room: Room) {
    this.roomsById[room.uuid] = room
  }

  public count() {
    return Object.keys(this.roomsById).length
  }
}