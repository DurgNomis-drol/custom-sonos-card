import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import {
  listenForActivePlayer,
  listenForPlayerRequest,
  stopListeningForActivePlayer,
  stopListeningForPlayerRequest,
  stylable,
} from '../utils';
import { ACTIVE_PLAYER_EVENT, CardConfig, PlayerGroup } from '../types';
import { styleMap } from 'lit-html/directives/style-map.js';
import { when } from 'lit/directives/when.js';
import { HomeAssistant } from 'custom-card-helpers';

class Group extends LitElement {
  @property() hass!: HomeAssistant;
  @property() config!: CardConfig;
  @property() group!: PlayerGroup;
  @property() activePlayer!: string;

  connectedCallback() {
    super.connectedCallback();
    listenForActivePlayer(this.activePlayerListener);
    listenForPlayerRequest(this.dispatchActivePlayerEvent);
  }

  disconnectedCallback() {
    stopListeningForActivePlayer(this.activePlayerListener);
    stopListeningForPlayerRequest(this.dispatchActivePlayerEvent);
    super.disconnectedCallback();
  }

  activePlayerListener = (event: Event) => {
    this.activePlayer = (event as CustomEvent).detail.player;
  };

  dispatchActivePlayerEvent = () => {
    if (this.activePlayer) {
      const event = new CustomEvent(ACTIVE_PLAYER_EVENT, {
        bubbles: true,
        composed: true,
        detail: { player: this.activePlayer },
      });
      window.dispatchEvent(event);
    }
  };

  render() {
    const stateObj = this.hass.states[this.group.entity];
    const currentTrack = `${stateObj.attributes.media_artist || ''} - ${stateObj.attributes.media_title || ''}`.replace(
      /^ - /g,
      '',
    );
    const speakerList = [this.group.roomName, ...Object.values(this.group.members)].join(' + ');
    this.dispatchActivePlayerEvent();
    return html`
      <div @click="${() => this.handleGroupClicked()}" style="${this.groupStyle()}">
        <ul style="${this.speakersStyle()}">
          <span style="${this.speakerStyle()}">${speakerList}</span>
        </ul>
        <div style="${this.infoStyle()}">
          ${currentTrack
            ? html` <div style="flex: 1"><span style="${this.currentTrackStyle()}">${currentTrack}</span></div>
                ${when(
                  this.group.state === 'playing',
                  () => html`
                    <div style="width: 0.55rem; position: relative;">
                      <div style="${Group.barStyle(1)}"></div>
                      <div style="${Group.barStyle(2)}"></div>
                      <div style="${Group.barStyle(3)}"></div>
                    </div>
                  `,
                )}`
            : ''}
        </div>
      </div>
    `;
  }

  private groupStyle() {
    const style = {
      borderRadius: 'var(--sonos-int-border-radius)',
      margin: '0.5rem 0',
      padding: '0.8rem',
      border: 'var(--sonos-int-border-width) solid var(--sonos-int-color)',
      backgroundColor: 'var(--sonos-int-background-color)',
      ...(this.activePlayer === this.group.entity && {
        border: 'var(--sonos-int-border-width) solid var(--sonos-int-accent-color)',
        color: 'var(--sonos-int-accent-color)',
        fontWeight: 'bold',
      }),
    };
    return stylable('group', this.config, style);
  }

  private speakersStyle() {
    return stylable('group-speakers', this.config, {
      margin: '0',
      padding: '0',
    });
  }

  private speakerStyle() {
    return stylable('group-speaker', this.config, {
      marginRight: '0.3rem',
      fontSize: '1rem',
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    });
  }

  private infoStyle() {
    return stylable('group-info', this.config, {
      display: 'flex',
      flexDirection: 'row',
      clear: 'both',
    });
  }

  private currentTrackStyle() {
    return styleMap({
      display: this.config.hideGroupCurrentTrack ? 'none' : 'inline',
      fontSize: '0.8rem',
    });
  }

  private static barStyle(order: number) {
    return styleMap({
      background: 'var(--sonos-int-color)',
      bottom: '0.05rem',
      height: '0.15rem',
      position: 'absolute',
      width: '0.15rem',
      animation: 'sound 0ms -800ms linear infinite alternate',
      display: 'block',
      left: order == 1 ? '0.05rem' : order == 2 ? '0.25rem' : '0.45rem',
      animationDuration: order == 1 ? '474ms' : order == 2 ? '433ms' : '407ms',
    });
  }

  private handleGroupClicked() {
    if (this.activePlayer !== this.group.entity) {
      this.activePlayer = this.group.entity;
      const newUrl = window.location.href.replace(/#.*/g, '');
      window.location.href = `${newUrl}#${this.group.entity}`;
      this.dispatchActivePlayerEvent();
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
    `;
  }
}

customElements.define('sonos-group', Group);
