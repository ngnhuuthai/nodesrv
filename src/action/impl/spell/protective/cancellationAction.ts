import {AffectEntity} from "../../../../affect/entity/affectEntity"
import DelayCost from "../../../../check/cost/delayCost"
import ManaCost from "../../../../check/cost/manaCost"
import AbilityService from "../../../../check/service/abilityService"
import {MobEntity} from "../../../../mob/entity/mobEntity"
import {SpecializationType} from "../../../../mob/specialization/enum/specializationType"
import {SpellMessages} from "../../../../mob/spell/constants"
import {SpellType} from "../../../../mob/spell/spellType"
import {percentRoll} from "../../../../support/random/helpers"
import SpellBuilder from "../../../builder/spellBuilder"
import {ActionType} from "../../../enum/actionType"
import Spell from "../../spell"

const CHANCE_THRESHOLD = 80

export default function(abilityService: AbilityService): Spell {
  return new SpellBuilder(abilityService)
    .setSpellType(SpellType.Cancellation)
    .setActionType(ActionType.Defensive)
    .setCosts([
      new ManaCost(10),
      new DelayCost(1),
    ])
    .setApplySpell(async requestService => {
      const target = requestService.getTarget<MobEntity>()
      target.affects.forEach((affect: AffectEntity) => {
        if (percentRoll() < CHANCE_THRESHOLD) {
          target.affect().remove(affect.affectType)
        }
      })
    })
    .setSuccessMessage(requestService =>
      requestService.createResponseMessage(SpellMessages.Cancel.Success)
        .setVerbToRequestCreator("feels")
        .setVerbToTarget("feel")
        .setVerbToObservers("feels")
        .create())
    .setSpecializationType(SpecializationType.Cleric)
    .create()
}
