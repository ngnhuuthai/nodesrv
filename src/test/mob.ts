import * as sillyname from "sillyname"
import { newAttributes, newHitroll, newStartingStats, newStartingVitals } from "../attributes/factory"
import { newMob } from "../mob/factory"
import { Mob } from "../mob/model/mob"
import { Race } from "../mob/race/race"
import { Role } from "../mob/role"
import { addMob } from "../mob/table"
import { getTestRoom } from "./room"

export function getTestMob(name: string = null): Mob {
  if (name === null) {
    name = sillyname()
  }
  const mob = newMob(
    name,
    "a test fixture",
    Race.Human,
    newStartingVitals(),
    newAttributes(
      newStartingVitals(),
      newStartingStats(),
      newHitroll(0, 0),
    ))
  mob.room = getTestRoom()
  mob.room.addMob(mob)
  addMob(mob)

  return mob
}

export function getMerchantMob(): Mob {
  const mob = getTestMob()
  mob.role = Role.Merchant

  return mob
}
