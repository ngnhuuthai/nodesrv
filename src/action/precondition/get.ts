import Check from "../../check/check"
import CheckBuilder from "../../check/checkBuilder"
import { CheckType } from "../../check/checkType"
import Maybe from "../../support/functional/maybe"
import GameService from "../../gameService/gameService"
import ItemTable from "../../item/itemTable"
import { Request } from "../../request/request"
import { MESSAGE_FAIL_ITEM_NOT_TRANSFERABLE, Messages } from "./constants"

export default function(request: Request, service: GameService): Promise<Check> {
  return new Maybe(request.getContextAsInput().component)
    .do(() => getFromInventory(request, service.itemTable))
    .or(() => getFromRoom(request, service.itemTable))
    .get()
}

function getFromInventory(request: Request, itemTable: ItemTable) {
  const container = itemTable.findItemByInventory(request.mob.inventory, request.getContextAsInput().component)

  return new CheckBuilder()
    .require(container, Messages.All.Item.NotFound, CheckType.ContainerPresent)
    .require(() => itemTable.findItemByInventory(container.container, request.getSubject()),
      Messages.All.Item.NotFound, CheckType.ItemPresent)
    .capture()
    .create()
}

function getFromRoom(request: Request, itemTable: ItemTable) {
  const item = itemTable.findItemByInventory(request.getRoom().inventory, request.getSubject())
  return new CheckBuilder()
    .require(item, Messages.All.Item.NotFound, CheckType.ItemPresent)
    .capture()
    .require(() => item.isTransferable, MESSAGE_FAIL_ITEM_NOT_TRANSFERABLE)
    .create()
}
