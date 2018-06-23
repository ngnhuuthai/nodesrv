import { Item } from "../../item/model/item"
import { Request } from "../../request/request"
import { doWithItemOrElse } from "../actionHelpers"

export default function(request: Request): Promise<any> {
  return doWithItemOrElse(
    request,
    request.findItemInSessionMobInventory(),
    (item: Item) => {
      request.getRoom().inventory.getItemFrom(item, request.player.getInventory())

      return { message: "You drop " + item.name + "." }
    },
    "You don't have that.")
}
