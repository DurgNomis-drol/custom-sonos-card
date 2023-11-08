import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import MediaControlService from '../services/media-control-service';
import Store from '../model/store';
import {
  mdiPauseCircle,
  mdiPlayCircle,
  mdiRepeat,
  mdiRepeatOff,
  mdiRepeatOnce,
  mdiShuffleDisabled,
  mdiShuffleVariant,
  mdiSkipNext,
  mdiSkipPrevious,
} from '@mdi/js';
import { iconButton } from './icon-button';
import { MediaPlayer } from '../model/media-player';

class PlayerControls extends LitElement {
  @property() store!: Store;
  private activePlayer!: MediaPlayer;
  private mediaControlService!: MediaControlService;

  render() {
    this.activePlayer = this.store.activePlayer;
    this.mediaControlService = this.store.mediaControlService;

    const playing = this.activePlayer.isPlaying();
    return html`
      <div class="main" id="mediaControls">
        <div class="icons">
          ${iconButton(this.shuffleIcon(), this.shuffle)} ${iconButton(mdiSkipPrevious, this.prev)}
          ${iconButton(playing ? mdiPauseCircle : mdiPlayCircle, playing ? this.pause : this.play, { big: true })}
          ${iconButton(mdiSkipNext, this.next)} ${iconButton(this.repeatIcon(), this.repeat)}
        </div>
        <sonos-volume .store=${this.store} .player=${this.activePlayer}></sonos-volume>
      </div>
    `;
  }
  private prev = async () => await this.mediaControlService.prev(this.activePlayer);
  private play = async () => await this.mediaControlService.play(this.activePlayer);
  private pause = async () => await this.mediaControlService.pause(this.activePlayer);
  private next = async () => await this.mediaControlService.next(this.activePlayer);
  private shuffle = async () => await this.mediaControlService.shuffle(this.activePlayer);
  private repeat = async () => await this.mediaControlService.repeat(this.activePlayer);

  private shuffleIcon() {
    return this.activePlayer?.attributes.shuffle ? mdiShuffleVariant : mdiShuffleDisabled;
  }

  private repeatIcon() {
    const repeatState = this.activePlayer?.attributes.repeat;
    return repeatState === 'all' ? mdiRepeat : repeatState === 'one' ? mdiRepeatOnce : mdiRepeatOff;
  }

  static get styles() {
    return css`
      .main {
        margin: 0.25rem;
        padding: 0.5rem;
        overflow: hidden auto;
      }
      .icons {
        justify-content: center;
        display: flex;
        align-items: center;
      }
    `;
  }
}

customElements.define('sonos-player-controls', PlayerControls);
