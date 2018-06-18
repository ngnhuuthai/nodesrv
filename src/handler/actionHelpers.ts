import { Item } from "../item/model/item"
import { Request } from "../request/request"
import { RequestType } from "../request/requestType"
import Attempt from "../skill/attempt"
import { CheckResult } from "../skill/checkResult"
import Outcome from "../skill/outcome"
import { OutcomeType } from "../skill/outcomeType"
import { skillCollection } from "../skill/skillCollection"
import { SkillType } from "../skill/skillType"
import { HandlerDefinition } from "./handlerDefinition"

export const PRECONDITION_FAILED = "You don't have enough energy."

export function doWithItemOrElse(item: Item, ifItem: (item: Item) => {}, ifNotItemMessage: string): Promise<any> {
  return new Promise((resolve) => {
    if (!item) {
      return resolve({message: ifNotItemMessage})
    }

    return resolve(ifItem(item))
  })
}

export function createHandler(requestType: RequestType, cb) {
  return new HandlerDefinition(requestType, cb)
}

export async function doSkill(request: Request, skillType: SkillType): Promise<Outcome> {
  const mob = request.player.sessionMob
  const skillModel = mob.skills.find((s) => s.skillType === skillType)
  const skillDefinition = skillCollection.find((skillDef) => skillDef.isSkillTypeMatch(skillType))
  const attempt = new Attempt(mob, request.getTarget(), skillModel)
  if (skillDefinition.preconditions) {
    const check = await skillDefinition.preconditions(attempt)
    if (check.checkResult === CheckResult.Unable) {
      return failPrecondition(attempt)
    }
    check.cost(request.player)
  }
  return skillDefinition.action(attempt)
}

export function failPrecondition(attempt): Outcome {
  return new Outcome(attempt, OutcomeType.CheckFail, PRECONDITION_FAILED)
}
