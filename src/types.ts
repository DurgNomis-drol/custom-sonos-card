import { LovelaceCardConfig } from 'custom-card-helpers';
import { MediaPlayer } from './model/media-player';

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    customCards: Array<{ type: string; name: string; description: string; preview: boolean }>;
  }
}

export enum Section {
  MEDIA_BROWSER = 'media browser',
  GROUPS = 'groups',
  PLAYER = 'player',
  GROUPING = 'grouping',
  VOLUMES = 'volumes',
}

export type ConfigPredefinedGroupPlayer = PredefinedGroupPlayer<string>;
export type ConfigPredefinedGroup = PredefinedGroup<string | ConfigPredefinedGroupPlayer>;
export interface CardConfig extends LovelaceCardConfig {
  sections?: Section[];
  showVolumeUpAndDownButtons: boolean;
  showVolumeSlider: boolean;
  entities?: string[];
  excludeItemsInEntitiesList: boolean;
  predefinedGroups?: ConfigPredefinedGroup[];
  title?: string;
  labelWhenNoMediaIsSelected?: string;
  labelForTheAllVolumesSlider: string;
  entityNameRegexToReplace?: string;
  entityNameReplacement?: string;
  artworkHostname?: string;
  widthPercentage?: number;
  heightPercentage?: number;
  hideGroupCurrentTrack: boolean;
  dynamicVolumeSlider: boolean;
  mediaArtworkOverrides?: MediaArtworkOverride[];
  customSources?: CustomSources;
  customThumbnail?: CustomThumbnail;
  customThumbnailIfMissing?: CustomThumbnail;
  mediaBrowserTitlesToIgnore?: string[];
  mediaBrowserItemsPerRow: number;
  mediaBrowserShowTitleForThumbnailIcons?: boolean;
  topFavorites?: string[];
  numberOfFavoritesToShow?: number;
}

export interface MediaArtworkOverride {
  ifMissing?: boolean;
  mediaTitleEquals?: string;
  mediaContentIdEquals?: string;
  imageUrl?: string;
  sizePercentage?: number;
}

export interface CustomSources {
  [name: string]: CustomSource[];
}

export interface CustomSource {
  title: string;
  thumbnail?: string;
}

export interface CustomThumbnail {
  [title: string]: string;
}

export interface MediaPlayerItem {
  title: string;
  thumbnail?: string;
  children?: MediaPlayerItem[];
  children_media_class?: string;
  media_class?: string;
  can_expand?: boolean;
  can_play?: boolean;
  media_content_type?: string;
  media_content_id?: string;
  showFolderIcon?: boolean;
}

export interface PredefinedGroup<T = PredefinedGroupPlayer> {
  name: string;
  entities: T[];
  media?: string;
  volume?: number;
  unmuteWhenGrouped?: boolean;
  excludeItemsInEntitiesList?: boolean;
}

export interface PredefinedGroupPlayer<T = MediaPlayer> {
  player: T;
  volume?: number;
}
export interface TemplateResult {
  result: string[];
}
