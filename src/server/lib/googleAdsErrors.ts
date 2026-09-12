export class GoogleAdsApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: string,
  ) {
    super(message);
    this.name = "GoogleAdsApiError";
  }
}

export class GoogleAdsTokenError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "GoogleAdsTokenError";
  }
}

export class GoogleAdsNotConnectedError extends Error {
  constructor(public readonly projectId: string) {
    super("Google Ads is not connected for this project");
    this.name = "GoogleAdsNotConnectedError";
  }
}
