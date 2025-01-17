import { MediaPlayerItem, PredefinedGroup } from '../types';
import HassService from './hass-service';
import { dispatchActivePlayerId } from '../utils/utils';
import { MediaPlayer } from '../model/media-player';

export default class MediaControlService {
  private hassService: HassService;

  constructor(hassService: HassService) {
    this.hassService = hassService;
  }

  async join(main: string, memberIds: string[]) {
    await this.hassService.callMediaService('join', {
      entity_id: main,
      group_members: memberIds,
    });
  }

  private async joinPredefinedGroup(player: MediaPlayer, pg: PredefinedGroup) {
    const ids = pg.entities.map(({ player }) => player.id);
    await this.join(player.id, ids);
  }

  async unJoin(playerIds: string[]) {
    await this.hassService.callMediaService('unjoin', {
      entity_id: playerIds,
    });
  }

  async createGroup(predefinedGroup: PredefinedGroup, currentGroups: MediaPlayer[]) {
    let candidateGroup!: MediaPlayer;
    for (const group of currentGroups) {
      if (predefinedGroup.entities.some((item) => item.player.id === group.id)) {
        if (group.isPlaying()) {
          await this.modifyExistingGroup(group, predefinedGroup);
          return;
        }
        candidateGroup = candidateGroup || group;
      }
    }
    if (candidateGroup) {
      await this.modifyExistingGroup(candidateGroup, predefinedGroup);
    } else {
      const { player } = predefinedGroup.entities[0];
      dispatchActivePlayerId(player.id);
      await this.joinPredefinedGroup(player, predefinedGroup);
    }
  }

  private async modifyExistingGroup(group: MediaPlayer, pg: PredefinedGroup) {
    const members = group.members;
    const membersNotToBeGrouped = members.filter((member) => !pg.entities.some((item) => item.player.id === member.id));
    if (membersNotToBeGrouped?.length) {
      await this.unJoin(membersNotToBeGrouped.map((member) => member.id));
    }
    dispatchActivePlayerId(group.id);
    await this.joinPredefinedGroup(group, pg);
    for (const pgp of pg.entities) {
      const volume = pgp.volume ?? pg.volume;
      if (volume) {
        await this.volumeSet(pgp.player, volume, false);
      }
      if (pg.unmuteWhenGrouped) {
        await this.setVolumeMute(pgp.player, false, false);
      }
    }
    if (pg.media) {
      await this.setSource(pg.entities[0].player, pg.media);
    }
  }

  async pause(mediaPlayer: MediaPlayer) {
    await this.hassService.callMediaService('media_pause', { entity_id: mediaPlayer.id });
  }

  async prev(mediaPlayer: MediaPlayer) {
    await this.hassService.callMediaService('media_previous_track', {
      entity_id: mediaPlayer.id,
    });
  }

  async next(mediaPlayer: MediaPlayer) {
    await this.hassService.callMediaService('media_next_track', { entity_id: mediaPlayer.id });
  }

  async play(mediaPlayer: MediaPlayer) {
    await this.hassService.callMediaService('media_play', { entity_id: mediaPlayer.id });
  }

  async shuffle(mediaPlayer: MediaPlayer) {
    await this.hassService.callMediaService('shuffle_set', {
      entity_id: mediaPlayer.id,
      shuffle: !mediaPlayer.attributes.shuffle,
    });
  }

  async repeat(mediaPlayer: MediaPlayer) {
    const currentState = mediaPlayer.attributes.repeat;
    const repeat = currentState === 'all' ? 'one' : currentState === 'one' ? 'off' : 'all';
    await this.hassService.callMediaService('repeat_set', { entity_id: mediaPlayer.id, repeat });
  }

  async volumeDown(mediaPlayer: MediaPlayer, updateMembers = true) {
    await this.hassService.callMediaService('volume_down', { entity_id: mediaPlayer.id });
    if (updateMembers) {
      for (const member of mediaPlayer.members) {
        await this.hassService.callMediaService('volume_down', { entity_id: member.id });
      }
    }
  }

  async volumeUp(mediaPlayer: MediaPlayer, updateMembers = true) {
    await this.hassService.callMediaService('volume_up', { entity_id: mediaPlayer.id });
    if (updateMembers) {
      for (const member of mediaPlayer.members) {
        await this.hassService.callMediaService('volume_up', { entity_id: member.id });
      }
    }
  }

  async volumeSet(mediaPlayer: MediaPlayer, volume: number, updateMembers = true) {
    const volume_level = volume / 100;

    await this.hassService.callMediaService('volume_set', { entity_id: mediaPlayer.id, volume_level: volume_level });
    if (updateMembers) {
      for (const member of mediaPlayer.members) {
        await this.hassService.callMediaService('volume_set', { entity_id: member.id, volume_level });
      }
    }
  }

  async toggleMute(mediaPlayer: MediaPlayer, updateMembers = true) {
    const muteVolume = !mediaPlayer.isMuted(updateMembers);
    await this.setVolumeMute(mediaPlayer, muteVolume, updateMembers);
  }

  async setVolumeMute(mediaPlayer: MediaPlayer, muteVolume: boolean, updateMembers = true) {
    await this.hassService.callMediaService('volume_mute', { entity_id: mediaPlayer.id, is_volume_muted: muteVolume });
    if (updateMembers) {
      for (const member of mediaPlayer.members) {
        await this.hassService.callMediaService('volume_mute', { entity_id: member.id, is_volume_muted: muteVolume });
      }
    }
  }

  async setSource(mediaPlayer: MediaPlayer, source: string) {
    await this.hassService.callMediaService('select_source', { source: source, entity_id: mediaPlayer.id });
  }

  async playMedia(mediaPlayer: MediaPlayer, item: MediaPlayerItem) {
    await this.hassService.callMediaService('play_media', {
      entity_id: mediaPlayer.id,
      media_content_id: item.media_content_id,
      media_content_type: item.media_content_type,
    });
  }
}
