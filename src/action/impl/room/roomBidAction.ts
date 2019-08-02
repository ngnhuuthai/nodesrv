import Check from "../../../check/check"
import {CheckType} from "../../../check/enum/checkType"
import CheckBuilderFactory from "../../../check/factory/checkBuilderFactory"
import {MobEntity} from "../../../mob/entity/mobEntity"
import {RequestType} from "../../../request/enum/requestType"
import Request from "../../../request/request"
import Response from "../../../request/response"
import RequestService from "../../../request/service/requestService"
import {RealEstateBidEntity} from "../../../room/entity/realEstateBidEntity"
import {RealEstateListingEntity} from "../../../room/entity/realEstateListingEntity"
import RealEstateService from "../../../room/service/realEstateService"
import {ConditionMessages, Messages} from "../../constants"
import {ActionPart} from "../../enum/actionPart"
import Action from "../action"

export default class RoomBidAction extends Action {
  constructor(
    private readonly checkBuilderFactory: CheckBuilderFactory,
    private readonly realEstateService: RealEstateService) {
    super()
  }

  public getRequestType(): RequestType {
    return RequestType.RoomBid
  }

  public getActionParts(): ActionPart[] {
    return [ ActionPart.Action, ActionPart.Directive, ActionPart.Amount ]
  }

  public getHelpText(): string {
    return Messages.Help.NoActionHelpTextProvided
  }

  public check(request: Request): Promise<Check> {
    const room = request.getRoom()
    const existingBid = this.realEstateService.getBidsForRoom(room).find(bid => bid.bidder.is(request.mob))
    return this.checkBuilderFactory.createCheckBuilder(request)
      .requireFromActionParts(request, this.getActionParts())
      .not().requireFight(ConditionMessages.All.Mob.Fighting)
      .require(room.isOwnable, Messages.Room.Bid.CannotBid)
      .not().require(() => room.owner.is(request.mob), Messages.Room.Bid.AlreadyOwn)
      .require(parseInt(request.getComponent(), 10), Messages.Room.Bid.AmountIsRequired, CheckType.Amount)
      .capture()
      .require((amount: number) =>
        request.mob.gold + (existingBid ? existingBid.amount : 0) >= amount, Messages.Room.Bid.NotEnoughGold)
      .require(this.realEstateService.getListing(room), Messages.Room.Bid.NotBeingSold, CheckType.ValidSubject)
      .optional(CheckType.Bid, existingBid)
      .create()
  }

  public async invoke(requestService: RequestService): Promise<Response> {
    const mob = requestService.getMob()
    const room = requestService.getRoom()
    const amount = requestService.getResult<number>(CheckType.Amount)
    const bid = requestService.getResult<RealEstateBidEntity>(CheckType.Bid)
    if (bid) {
      await this.updateBid(mob, bid, amount)
    } else {
      const listing = requestService.getResult<RealEstateListingEntity>(CheckType.ValidSubject)
      await this.createBid(mob, listing, amount)
    }
    return requestService.respondWith().success(Messages.Room.Bid.Success, { room: room.name, amount })
  }

  private async updateBid(mob: MobEntity, bid: RealEstateBidEntity, amount: number) {
    // refund
    mob.gold += bid.amount
    // apply new bid
    bid.amount = amount
    mob.gold -= amount
    await this.realEstateService.saveBid(bid)
  }

  private async createBid(mob: MobEntity, listing: RealEstateListingEntity, amount: number) {
    mob.gold -= amount
    const realEstateBid = new RealEstateBidEntity()
    realEstateBid.bidder = mob
    realEstateBid.listing = listing
    realEstateBid.amount = amount
    await this.realEstateService.createBid(realEstateBid)
  }
}