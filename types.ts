export interface SocialProfile {
  platform: string;
  url: string;
}

export interface ApplicantProfile {
  name: string;
  location: string;
  bio: string;
  reasoning: string;
  socialProfiles: SocialProfile[];
  profileImageUrl: string;
  primarySourceUrl: string;
  sourceTitle: string;
}

export interface SearchFilters {
  location: string;
  sourceTypes: string[];
  accomplishmentAreas: string[];
}

export enum SearchStatus {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
}
