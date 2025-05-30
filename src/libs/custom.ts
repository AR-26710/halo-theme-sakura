/**
 * Bilibili 视频嵌入组件
 * 使用示例：<bilibili-video bvid="BV1xx411x7xx" autoplay muted></bilibili-video>
 */
class BilibiliEmbed extends HTMLElement {
  private static readonly STYLES = `
    .bilibili-video-wrapper {
      position: relative;
      width: 100%;
      height: 0;
      padding-bottom: 56.25%; /* 16:9 宽高比 */
    }
    .bilibili-video-wrapper iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    .error-message {
      color: red;
      padding: 10px;
      font-family: Arial, sans-serif;
    }
  `;

  static get observedAttributes() {
    return ['bvid', 'autoplay', 'muted'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  disconnectedCallback() {
    // 清理资源（如事件监听器）
    const iframe = this.shadowRoot?.querySelector('iframe');
    if (iframe) {
      iframe.src = ''; // 停止视频加载
    }
  }

  private render() {
    if (!this.shadowRoot) return;

    const bvid = this.getAttribute('bvid');
    if (!bvid) {
      this.shadowRoot.innerHTML = `
        <style>${BilibiliEmbed.STYLES}</style>
        <div class="error-message">错误：缺少 bvid 属性</div>
      `;
      return;
    }

    // 默认不自动播放，默认不静音
    const autoplay = this.hasAttribute('autoplay') ? '1' : '0';
    const muted = this.hasAttribute('muted') ? '1' : '0';

    const params = new URLSearchParams({ bvid, autoplay });
    if (muted === '1') params.append('muted', '1');

    const iframeSrc = `https://player.bilibili.com/player.html?${params.toString()}`;

    this.shadowRoot.innerHTML = `
      <style>${BilibiliEmbed.STYLES}</style>
      <div class="bilibili-video-wrapper">
        <iframe src="${iframeSrc}" frameborder="0" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>
      </div>
    `;
  }
}

customElements.define('bilibili-video', BilibiliEmbed);

/**
 * 双色链接组件
 * 使用示例：<resource-link left-text="文档" right-text="PDF" href="/file.pdf" target="_blank"></resource-link>
 */
class ResourceLinkElement extends HTMLElement {
  static get observedAttributes() {
    return ['left-text', 'right-text', 'href', 'target'];
  }

  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.render();
  }

  connectedCallback() {
    this.updateContent();
    this.bindEvents();
  }

  disconnectedCallback() {
    const linkElement = this.shadow.querySelector('a');
    if (linkElement) {
      linkElement.removeEventListener('click', this.handleClick);
      linkElement.removeEventListener('keydown', this.handleKeyPress);
    }
  }

  attributeChangedCallback() {
    this.updateContent();
  }

  private render() {
    const style = document.createElement('style');
    style.textContent = `
      :host {
        --rl-left-color: #2c3e50;
        --rl-right-color: #3498db;
        --rl-left-hover: #34495e;
        --rl-right-hover: #2980b9;
        --rl-divider-color: #95a5a6;
        --rl-text-color: #ecf0f1;
        display: inline-block;
        width: fit-content;
        min-width: 120px;
        font-family: inherit;
      }
      .rl-container {
        display: inline-flex;
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.3s ease;
        text-decoration: none;
        color: var(--rl-text-color);
        position: relative;
        margin: 10px 0;
      }
      .rl-container:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }
      .rl-left, .rl-right {
        padding: 12px 20px;
        flex: 0 1 auto;
        display: flex;
        align-items: center;
        transition: background 0.3s ease;
      }
      .rl-left {
        background: var(--rl-left-color);
        border-right: 2px solid var(--rl-divider-color);
      }
      .rl-right {
        background: var(--rl-right-color);
      }
      .rl-container:hover .rl-left {
        background: var(--rl-left-hover);
      }
      .rl-container:hover .rl-right {
        background: var(--rl-right-hover);
      }
    `;

    const link = document.createElement('a');
    link.className = 'rl-container';
    link.setAttribute('role', 'link');
    link.tabIndex = 0;

    const left = document.createElement('div');
    left.className = 'rl-left';

    const right = document.createElement('div');
    right.className = 'rl-right';

    link.append(left, right);
    this.shadow.append(style, link);
  }

  private updateContent() {
    const link = this.shadow.querySelector('a')!;
    const href = this.getAttribute('href')?.trim() || '#';
    const target = this.getAttribute('target') || '_self';
    link.setAttribute('href', href);
    link.setAttribute('target', target);

    const leftText = this.getAttribute('left-text') || '';
    const rightText = this.getAttribute('right-text') || '';

    const left = this.shadow.querySelector('.rl-left') as HTMLElement;
    const right = this.shadow.querySelector('.rl-right') as HTMLElement;

    left.style.display = leftText.trim() ? 'flex' : 'none';
    left.textContent = leftText;

    right.style.display = rightText.trim() ? 'flex' : 'none';
    right.textContent = rightText;
  }

  private bindEvents() {
    const linkElement = this.shadow.querySelector('a')!;
    linkElement.addEventListener('click', this.handleClick.bind(this));
    linkElement.addEventListener('keydown', this.handleKeyPress.bind(this));
  }

  private handleClick(e: Event) {
    const href = this.getAttribute('href');
    if (!href || href === '#') {
      e.preventDefault();
    }
  }

  private handleKeyPress(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.dispatchEvent(new MouseEvent('click'));
    }
  }
}

customElements.define('resource-link', ResourceLinkElement);

