export enum AuthorizationLevel {
  None,
  Mortal,
  Admin,
  Judge,
  Immortal,
}

export function isSpecialAuthorizationLevel(authorizationLevel: AuthorizationLevel): boolean {
  return authorizationLevel > AuthorizationLevel.Mortal
}

/* istanbul ignore next */
export function getAuthorizationLevelName(authorizationLevel: AuthorizationLevel): string {
  switch (authorizationLevel) {
    case AuthorizationLevel.None:
      return "none"
    case AuthorizationLevel.Mortal:
      return "mortal"
    case AuthorizationLevel.Admin:
      return "admin"
    case AuthorizationLevel.Judge:
      return "judge"
    case AuthorizationLevel.Immortal:
      return "immortal"
  }
}