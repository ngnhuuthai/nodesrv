import {inject, injectable} from "inversify"
import {allStats} from "../../../attributes/constants"
import {Stat} from "../../../attributes/enum/stat"
import {Vital} from "../../../attributes/enum/vital"
import Check from "../../../check/check"
import Cost from "../../../check/cost/cost"
import {CostType} from "../../../check/cost/costType"
import {CheckType} from "../../../check/enum/checkType"
import CheckBuilderFactory from "../../../check/factory/checkBuilderFactory"
import ResponseBuilder from "../../../messageExchange/builder/responseBuilder"
import {RequestType} from "../../../messageExchange/enum/requestType"
import Request from "../../../messageExchange/request"
import Response from "../../../messageExchange/response"
import RequestService from "../../../messageExchange/service/requestService"
import {MobEntity} from "../../../mob/entity/mobEntity"
import LocationService from "../../../mob/service/locationService"
import {format} from "../../../support/string"
import {Types} from "../../../support/types"
import {ConditionMessages, MAX_TRAINABLE_STATS, Messages} from "../../constants"
import {ActionPart} from "../../enum/actionPart"
import Action from "../action"

export const VITAL_INCREMENT = 10

function canTrain(stat: number): boolean {
  return stat < MAX_TRAINABLE_STATS
}

function trainStat(mob: MobEntity, responseBuilder: ResponseBuilder, message: string, stat: Stat): Promise<Response> {
  const attributes = mob.playerMob.trainedAttributes
  if (!canTrain(attributes[stat])) {
    return responseBuilder.fail(ConditionMessages.Train.CannotTrainMore)
  }
  attributes[stat] += 1
  return responseBuilder.success(message)
}

function trainVital(
  mob: MobEntity, responseBuilder: ResponseBuilder, message: string, vital: Vital): Promise<Response> {
  if (vital === Vital.Hp) {
    mob.playerMob.trainedAttributes.hp += VITAL_INCREMENT
  } else if (vital === Vital.Mana) {
    mob.playerMob.trainedAttributes.mana += VITAL_INCREMENT
  } else if (vital === Vital.Mv) {
    mob.playerMob.trainedAttributes.mv += VITAL_INCREMENT
  }
  mob.playerMob.trains--
  return responseBuilder.success(message)
}

function newTrainMapEntry(method: any, train: Stat | Vital, message: string) {
  return { method, train, message }
}

const trainMap = [
  newTrainMapEntry(trainStat, Stat.Str, Messages.Train.Str),
  newTrainMapEntry(trainStat, Stat.Int, Messages.Train.Int),
  newTrainMapEntry(trainStat, Stat.Wis, Messages.Train.Wis),
  newTrainMapEntry(trainStat, Stat.Dex, Messages.Train.Dex),
  newTrainMapEntry(trainStat, Stat.Con, Messages.Train.Con),
  newTrainMapEntry(trainStat, Stat.Sta, Messages.Train.Sta),
  newTrainMapEntry(trainVital, Vital.Hp, Messages.Train.Hp),
  newTrainMapEntry(trainVital, Vital.Mana, Messages.Train.Mana),
  newTrainMapEntry(trainVital, Vital.Mv, Messages.Train.Mv),
]

@injectable()
export default class TrainAction extends Action {
  constructor(
    @inject(Types.CheckBuilderFactory) private readonly checkBuilderFactory: CheckBuilderFactory,
    @inject(Types.LocationService) private readonly locationService: LocationService) {
    super()
  }

  public check(request: Request): Promise<Check> {
    const subject = request.getSubject()
    return this.checkBuilderFactory.createCheckBuilder(request)
      .require(
        !subject || trainMap.find(t => t.train === subject),
        ConditionMessages.Train.CannotTrainMore,
        CheckType.ValidSubject)
      .require(
        this.locationService.getMobsInRoomWithMob(request.mob).find(m => m.isTrainer()),
        ConditionMessages.Train.NoTrainer,
        CheckType.HasTarget)
      .capture()
      .addCost(new Cost(CostType.Train, 1, ConditionMessages.Train.LackingTrains))
      .create()
  }

  public invoke(requestService: RequestService): Promise<Response> {
    const mob = requestService.getMob()
    const responseBuilder = requestService.respondWith()
    const subject = requestService.getResult<any>(CheckType.ValidSubject)

    if (subject === true) {
      const attributes = mob.playerMob.trainedAttributes
      return responseBuilder.info(
        format(Messages.Train.Info, allStats.reduce((previous: string, current: Stat) =>
          previous + (canTrain(attributes[current]) ? `${current} ` : ""), "")))
    }

    return subject.method(mob, responseBuilder, subject.message, subject.train)
  }

  /* istanbul ignore next */
  public getActionParts(): ActionPart[] {
    return [ ActionPart.Action, ActionPart.Thing ]
  }

  public getRequestType(): RequestType {
    return RequestType.Train
  }

  /* istanbul ignore next */
  public getHelpText(): string {
    return Messages.Help.NoActionHelpTextProvided
  }
}
