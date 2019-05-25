import dodgeAction from "../action/impl/skill/event/dodgeAction"
import enhancedDamageAction from "../action/impl/skill/event/enhancedDamageAction"
import fastHealingAction from "../action/impl/skill/event/fastHealingAction"
import parryAction from "../action/impl/skill/event/parryAction"
import secondAttackAction from "../action/impl/skill/event/secondAttackAction"
import shieldBlockAction from "../action/impl/skill/event/shieldBlockAction"
import thirdAttackAction from "../action/impl/skill/event/thirdAttackAction"
import backstabAction from "../action/impl/skill/ranger/backstabAction"
import detectTouchAction from "../action/impl/skill/ranger/detectTouchAction"
import dirtKickAction from "../action/impl/skill/ranger/dirtKickAction"
import envenomAction from "../action/impl/skill/ranger/envenomAction"
import eyeGougeAction from "../action/impl/skill/ranger/eyeGougeAction"
import garotteAction from "../action/impl/skill/ranger/garotteAction"
import hamstringAction from "../action/impl/skill/ranger/hamstringAction"
import peekAction from "../action/impl/skill/ranger/peekAction"
import sharpenAction from "../action/impl/skill/ranger/sharpenAction"
import sneakAction from "../action/impl/skill/ranger/sneakAction"
import stealAction from "../action/impl/skill/ranger/stealAction"
import bashAction from "../action/impl/skill/warrior/bashAction"
import berserkAction from "../action/impl/skill/warrior/berserkAction"
import disarmAction from "../action/impl/skill/warrior/disarmAction"
import shieldBashAction from "../action/impl/skill/warrior/shieldBashAction"
import tripAction from "../action/impl/skill/warrior/tripAction"
import weaponAction from "../action/impl/skill/weaponAction"
import CheckBuilderFactory from "../check/factory/checkBuilderFactory"
import AbilityService from "../check/service/abilityService"
import EventService from "../event/service/eventService"
import MobService from "../mob/service/mobService"
import {SkillType} from "./skillType"

export function getSkillTable(mobService: MobService, eventService: EventService) {
  const checkBuilderFactory = new CheckBuilderFactory(mobService)
  const abilityService = new AbilityService(checkBuilderFactory, eventService)
  return [
    dodgeAction(abilityService),
    secondAttackAction(abilityService),
    thirdAttackAction(abilityService),
    enhancedDamageAction(abilityService),
    fastHealingAction(abilityService),
    shieldBlockAction(abilityService),
    parryAction(abilityService),

    backstabAction(abilityService),
    dirtKickAction(abilityService),
    envenomAction(abilityService),
    hamstringAction(abilityService),
    sharpenAction(abilityService),
    sneakAction(abilityService),
    stealAction(abilityService),
    peekAction(abilityService),
    garotteAction(abilityService),
    detectTouchAction(abilityService),
    eyeGougeAction(abilityService),
    bashAction(abilityService),
    berserkAction(abilityService),
    disarmAction(abilityService),
    shieldBashAction(abilityService),
    tripAction(abilityService),

    weaponAction(abilityService, SkillType.Sword),
    weaponAction(abilityService, SkillType.Mace),
    weaponAction(abilityService, SkillType.Wand),
    weaponAction(abilityService, SkillType.Dagger),
    weaponAction(abilityService, SkillType.Stave),
    weaponAction(abilityService, SkillType.Whip),
    weaponAction(abilityService, SkillType.Spear),
    weaponAction(abilityService, SkillType.Axe),
    weaponAction(abilityService, SkillType.Flail),
    weaponAction(abilityService, SkillType.Polearm),
  ]
}
