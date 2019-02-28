import Action from "../action/action"
import HelpAction from "../action/impl/info/helpAction"
import Skill from "../action/skill"
import Spell from "../action/spell"

export default class ActionService {
  constructor(
    public readonly actions: Action[],
    public readonly skills: Skill[],
    public readonly spells: Spell[]) {
    const helpAction = this.actions.find(action => action instanceof HelpAction) as HelpAction
    if (helpAction) {
      helpAction.setActions(this.actions)
    }
  }
}