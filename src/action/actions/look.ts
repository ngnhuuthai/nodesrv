import Maybe from "../../functional/maybe"
import { Item } from "../../item/model/item"
import { onlyLiving } from "../../mob/disposition"
import { Mob } from "../../mob/model/mob"
import getSight from "../../mob/race/sight"
import { Request } from "../../request/request"
import Response from "../../request/response"
import ResponseBuilder from "../../request/responseBuilder"

export const NOT_FOUND = "You don't see that anywhere."

function lookAtSubject(request, builder) {
  const mob = request.findMobInRoom()
  if (mob) {
    return builder.info(mob.description)
  }

  let item = request.findItemInRoomInventory()
  if (item) {
    return builder.info(item.describe())
  }

  item = request.findItemInSessionMobInventory()
  if (item) {
    return builder.info(item.describe())
  }

  return builder.error(NOT_FOUND)
}

export default function(request: Request): Promise<Response> {
  const builder = new ResponseBuilder(request)
  if (request.subject) {
    return lookAtSubject(request, builder)
  }

  const room = request.getRoom()
  const roomDescription = new Maybe(room.region)
    .do((region) =>
      getSight(request.mob.race).isAbleToSee(0, region.terrain, region.weather)
        ? room.toString() : "You can't see anything!")
    .or(() => room.toString())
    .get()

  return builder.info(roomDescription
    + room.mobs.filter(onlyLiving).reduce((previous: string, current: Mob) =>
        previous + (current !== request.mob ? `\n${current.name} is here.` : ""), "")
    + room.inventory.items.reduce((previous: string, current: Item) =>
`${previous}
${current.name} is here.`, "")
    + `
${request.getPrompt()}`)
}
