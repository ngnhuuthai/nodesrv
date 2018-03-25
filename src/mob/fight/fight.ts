import { Mob } from "../model/mob"
import { Attack, AttackResult } from "./attack"
import { Round } from "./round"

enum Status {
  InProgress,
  Done,
}

let fights: Fight[] = []

export function addFight(fight: Fight): void {
  fights.push(fight)
}

export function getFights() {
  return fights
}

export function filterCompleteFights() {
  fights = fights.filter((fight) => fight.isInProgress())
}

export class Fight {
  private readonly aggressor: Mob
  private readonly target: Mob
  private status: Status = Status.InProgress
  private winner: Mob

  constructor(aggressor: Mob, target: Mob) {
    this.aggressor = aggressor
    this.target = target
  }

  public round(): Round {
    return new Round(
      this.turnFor(this.aggressor, this.target),
      this.status === Status.InProgress ? this.turnFor(this.target, this.aggressor) : null,
    )
  }

  public isInProgress(): boolean {
    return this.status === Status.InProgress
  }

  public getWinner() {
    return this.winner
  }

  private turnFor(x: Mob, y: Mob): Attack {
    const attack = this.attack(x, y)
    if (y.vitals.hp < 0) {
      this.status = Status.Done
      this.winner = x
    }

    return attack
  }

  private attack(x: Mob, y: Mob): Attack {
    const attributes = x.getCombinedAttributes()
    const damage = Math.random() * Math.pow(attributes.hitroll.dam, attributes.hitroll.hit)
    y.vitals.hp -= damage

    return new Attack(x, y, AttackResult.Hit, damage)
  }
}