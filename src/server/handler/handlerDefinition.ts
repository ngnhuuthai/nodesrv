import { RequestType } from "./constants"
import { RequestTypeMismatch } from "./exceptions"
import { Request } from "./../request/request"

export class HandlerDefinition {
  private readonly requestType: RequestType
  private readonly callback: (request: Request) => void

  constructor(requestType: RequestType, callback) {
    this.requestType = requestType
    this.callback = callback
  }

  public isAbleToHandleRequestType(requestType: RequestType): boolean {
    return this.requestType.startsWith(requestType) || this.requestType === RequestType.Any
  }

  public handle(request: Request): Promise<any> {
    if (!this.isAbleToHandleRequestType(request.requestType)) {
      throw new RequestTypeMismatch()
    }

    return new Promise((resolve, reject) => {
      try {
        resolve(this.callback(request))
      } catch (exception) {
        reject(request)
      }
    })
  }
}
