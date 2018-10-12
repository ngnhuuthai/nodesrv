import { clericModifier, largeModifier, thiefModifier, tinyModifier, warriorModifier, wizardModifier } from "./modifier"
import { Race } from "./race"

export const allRaces = [
  Race.Human,
  Race.Dwarf,
  Race.Elf,
  Race.Drow,
  Race.Kender,
  Race.Halfling,
  Race.Gnome,
  Race.Faerie,
  Race.HalfOrc,
  Race.Giant,
]
export const modifiers = [
  warriorModifier,
  thiefModifier,
  wizardModifier,
  clericModifier,
  tinyModifier,
  largeModifier,
]

export const Messages = {
  Arm: {
    Description: "an arm of {0} is lying here.",
    Name: "an arm of {0}",
  },
  Brains: {
    Description: "the brain of {0} sits here.",
    Name: "the brain of {0}",
  },
  Guts: {
    Description: "the guts of {0} are here.",
    Name: "the guts of {0}",
  },
  Head: {
    Description: "the head of {0} sits here, staring at you.",
    Name: "the head of {0}",
  },
  Heart: {
    Description: "the heart of {0} is here.",
    Name: "the heart of {0}",
  },
  Leg: {
    Description: "a leg of {0} lays here.",
    Name: "a leg of {0}",
  },
  Trash: {
    Description: "the {0} of {1} is here.",
    Name: "the {0} of {1}",
  },
}
