import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import Store from '../model/store';
import { CardConfig, Section } from '../types';
import { dispatchActivePlayerId, dispatchShowSection, getSpeakerList } from '../utils/utils';
import { REQUEST_PLAYER_EVENT } from '../constants';
import { MediaPlayer } from '../model/media-player';

class Group extends LitElement {
  @property() store!: Store;
  private config!: CardConfig;
  @property() player!: MediaPlayer;
  @property() selected = false;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener(REQUEST_PLAYER_EVENT, this.dispatchEntityIdEvent);
  }

  disconnectedCallback() {
    window.removeEventListener(REQUEST_PLAYER_EVENT, this.dispatchEntityIdEvent);
    super.disconnectedCallback();
  }

  dispatchEntityIdEvent = () => {
    if (this.selected) {
      const entityId = this.player.id;
      dispatchActivePlayerId(entityId);
    }
  };

  render() {
    this.config = this.store.config;
    const currentTrack = this.config.hideGroupCurrentTrack ? '' : this.player.getCurrentTrack();
    const speakerList = getSpeakerList(this.player, this.store.predefinedGroups);
    this.dispatchEntityIdEvent();
    const icon = this.player.attributes.icon;
    return html`
      <mwc-list-item
        hasMeta
        ?selected="${this.selected}"
        ?activated="${this.selected}"
        @click="${() => this.handleGroupClicked()}"
      >
        <div class="row">
          <ha-icon .icon=${icon} ?hidden=${!icon}></ha-icon>
          <div class="text">
            <span class="speakers">${speakerList}</span>
            <span class="song-title">${currentTrack}</span>
          </div>
        </div>

        ${when(
          this.player.isPlaying(),
          () => html`
            <div class="bars" slot="meta">
              <div></div>
              <div></div>
              <div></div>
            </div>
          `,
        )}
      </mwc-list-item>
    `;
  }

  private handleGroupClicked() {
    if (!this.selected) {
      this.selected = true;
      const newUrl = window.location.href.replace(/#.*/g, '');
      window.location.replace(`${newUrl}#${this.player.id}`);
      this.dispatchEntityIdEvent();
      dispatchShowSection(Section.PLAYER);
    }
  }

  static get styles() {
    return css`
      @keyframes sound {
        0% {
          opacity: 0.35;
          height: 0.15rem;
        }
        100% {
          opacity: 1;
          height: 1rem;
        }
      }

      mwc-list-item {
        height: fit-content;
        margin: 1rem;
        border-radius: 1rem;
        background: var(--secondary-background-color);
      }

      .row {
        display: flex;
        margin: 1rem 0;
      }

      .text {
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .speakers {
        white-space: initial;
        font-size: 1.1rem;
        font-weight: bold;
        color: var(--secondary-text-color);
      }

      .song-title {
        font-size: 0.9rem;
        font-weight: bold;
      }

      ha-icon {
        --mdc-icon-size: 3rem;
        margin-right: 1rem;
      }

      .bars {
        width: 0.55rem;
        position: relative;
        margin-left: 1rem;
      }

      .bars > div {
        background: var(--secondary-text-color);
        bottom: 0.05rem;
        height: 0.15rem;
        position: absolute;
        width: 0.15rem;
        animation: sound 0ms -800ms linear infinite alternate;
        display: block;
      }

      .bars > div:first-child {
        left: 0.05rem;
        animation-duration: 474ms;
      }

      .bars > div:nth-child(2) {
        left: 0.25rem;
        animation-duration: 433ms;
      }

      .bars > div:last-child {
        left: 0.45rem;
        animation-duration: 407ms;
      }
    `;
  }
}

customElements.define('sonos-group', Group);
