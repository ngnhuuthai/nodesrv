import CheckedRequest from "../../check/checkedRequest"
import { CheckType } from "../../check/checkType"
import { Mob } from "../../mob/model/mob"
import roll from "../../random/dice"
import Response from "../../request/response"
import { Skill } from "../model/skill"
import { Messages, Thresholds } from "./constants"

export default async function(checkedRequest: CheckedRequest): Promise<Response> {
  const skill = checkedRequest.getCheckTypeResult(CheckType.HasSkill)
  const mob = checkedRequest.mob
  const target = checkedRequest.getCheckTypeResult(CheckType.IsFighting)
  const responseBuilder = checkedRequest.respondWith()

  if (!isSuccessfulBackstab(skill, mob, target)) {
    return responseBuilder.fail(
      Messages.Backstab.Failure,
      { target, requestCreator: "your" },
      { target, requestCreator: `${mob.name}'s`})
  }

  return responseBuilder.success(
    Messages.Backstab.Success,
    { target, verb: "backstab" },
    { target, verb: "backstabs" })
}

function isSuccessfulBackstab(skill: Skill, mob: Mob, target: Mob): boolean {
  return roll(3, skill.level / 3) + roll(2, Math.max(1, mob.level - target.level))
   > Thresholds.Backstab
}