import { newRoom } from "../../room/factory/roomFactory"
import { Room } from "../../room/model/room"

export function getTestRoom(): Room {
  return newRoom("Test room 1", "This is a test room.")
}
