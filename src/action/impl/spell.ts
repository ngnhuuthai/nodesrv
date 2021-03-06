import AffectBuilder from "../../affect/builder/affectBuilder"
import {AffectType} from "../../affect/enum/affectType"
import Check from "../../check/check"
import Cost from "../../check/cost/cost"
import {CheckType} from "../../check/enum/checkType"
import AbilityService from "../../check/service/abilityService"
import {createCastEvent, createSkillEvent} from "../../event/factory/eventFactory"
import {RequestType} from "../../messageExchange/enum/requestType"
import {ResponseStatus} from "../../messageExchange/enum/responseStatus"
import Request from "../../messageExchange/request"
import Response from "../../messageExchange/response"
import ResponseMessage from "../../messageExchange/responseMessage"
import RequestService from "../../messageExchange/service/requestService"
import {MobEntity} from "../../mob/entity/mobEntity"
import CastEvent from "../../mob/event/castEvent"
import {SpecializationType} from "../../mob/specialization/enum/specializationType"
import {SpellEntity} from "../../mob/spell/entity/spellEntity"
import {SpellType} from "../../mob/spell/spellType"
import roll from "../../support/random/dice"
import {Messages} from "../constants"
import {ActionPart} from "../enum/actionPart"
import {ActionType} from "../enum/actionType"
import {ApplyAbility} from "../type/applyAbility"
import {CheckComponentAdder} from "../type/checkComponentAdder"
import Action from "./action"

export default class Spell extends Action {
  constructor(
    protected readonly abilityService: AbilityService,
    protected readonly spellType: SpellType,
    protected readonly affectType: AffectType,
    protected readonly actionType: ActionType,
    protected readonly costs: Cost[],
    protected readonly successMessage: (requestService: RequestService) => ResponseMessage,
    protected readonly applySpell: ApplyAbility,
    protected readonly checkComponents: CheckComponentAdder,
    protected readonly specializationType: SpecializationType,
    protected readonly helpText: string) {
    super()
  }

  public async invoke(requestService: RequestService): Promise<Response> {
    const spell = requestService.getResult<SpellEntity>(CheckType.HasSpell)
    const eventResponse = await this.abilityService.publishEvent(createCastEvent(
      requestService.getMob(), spell, requestService.getTarget(), this.roll(spell.level)))
    if (!this.rollSucceeds((eventResponse.event as CastEvent).roll)) {
      await this.abilityService.publishEvent(
        createSkillEvent(spell, requestService.getMob(), false))
      return requestService.respondWith().response(
        ResponseStatus.ActionFailed,
        this.getFailureMessage(requestService.getMob()))
    }
    const affectType = this.getAffectType()
    const applyResponse = await this.applySpell(
      requestService, new AffectBuilder(affectType ? affectType : AffectType.Noop))
    if (applyResponse) {
      requestService.applyAbilityResponse = applyResponse
      const affect = applyResponse.affect
      if (affect && affect.affectType !== AffectType.Noop) {
        requestService.getResult<MobEntity>(CheckType.HasTarget).affect().add(affect)
      }
    }
    await this.abilityService.publishEvent(
      createSkillEvent(spell, requestService.getMob(), true))
    return requestService.respondWith().response(
      ResponseStatus.Success,
      this.getSuccessMessage(requestService))
  }

  public roll(spellLevel: number): number {
    return roll(4, spellLevel) / 2
  }

  public rollSucceeds(spellRoll: number): boolean {
    return spellRoll > 50
  }

  public check(request: Request): Promise<Check> {
    const checkBuilder = this.abilityService.createCheckTemplate(request)
      .cast(this)
      .capture(this)
    if (this.checkComponents) {
      this.checkComponents(request, checkBuilder)
    }
    return checkBuilder.create()
  }

  public getFailureMessage(mob: MobEntity): ResponseMessage {
    return new ResponseMessage(mob, Messages.Cast.Fail)
  }

  public getActionType(): ActionType {
    return this.actionType
  }

  public getAffectType(): AffectType | undefined {
    return this.affectType
  }

  public getCosts(): Cost[] {
    return this.costs
  }

  /* istanbul ignore next */
  public getHelpText(): string {
    return this.helpText
  }

  public getSpellType(): SpellType {
    return this.spellType
  }

  public getRequestType(): RequestType {
    return RequestType.Cast
  }

  public getSuccessMessage(requestService: RequestService): ResponseMessage {
    return this.successMessage(requestService)
  }

  /* istanbul ignore next */
  public getActionParts(): ActionPart[] {
    return [ActionPart.Action, ActionPart.Spell, ActionPart.Target]
  }

  public getSpecializationType(): SpecializationType | undefined {
    return this.specializationType
  }
}
