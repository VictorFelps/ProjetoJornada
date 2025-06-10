export interface RawTouchpoint {
  utm_source: string;
  utm_campaign: string | null;
  utm_medium: string | null;
  utm_content: string | null;
  sessionId: string;
  createdAt: string;
}

export interface Touchpoint {
  channel: string;
  campaign: string | null;
  medium: string | null;
  content: string | null;
  sessionId: string;
  created_at: Date;
}

export interface ProcessedJourney {
  sessionId: string;
  journey: string[];
  touchpoints: Touchpoint[];
  touchpointCount: number;
  firstTouchpoint: Touchpoint;
  lastTouchpoint: Touchpoint;
}

