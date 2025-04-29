/**
 * Bilibili 视频嵌入组件
 * 使用示例：<bilibili-video bvid="BV1xx411x7xx" autoplay="true" muted="false"></bilibili-video>
 */
class BilibiliEmbed extends HTMLElement {
  // 样式常量，避免重复创建
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
  `;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const bvid = this.getAttribute('bvid');
    if (!bvid) {
      console.error('BVid 属性不能为空');
      return;
    }

    // 使用更安全的布尔值转换
    const autoplay = this.hasAttribute('autoplay') ? '1' : '0';
    const muted = this.hasAttribute('muted') ? '1' : '0';

    this.render(bvid, autoplay, muted);
  }

  /**
   * 渲染视频组件
   * @param bvid - 视频唯一标识
   * @param autoplay - 自动播放（'1' 或 '0'）
   * @param muted - 静音（'1' 或 '0'）
   */
  private render(bvid: string, autoplay: string, muted: string) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('bilibili-video-wrapper');

    // 使用 URLSearchParams 构建更安全的 URL
    const params = new URLSearchParams({
      bvid,
      autoplay,
      ...(muted === '1' && { muted: '1' }) // 条件添加参数
    });

    const iframe = document.createElement('iframe');
    iframe.src = `https://player.bilibili.com/player.html?${params}`;
    iframe.setAttribute('frameborder', '0');
    iframe.allow = 'autoplay; fullscreen; encrypted-media';
    iframe.allowFullscreen = true;

    // 样式元素
    const style = document.createElement('style');
    style.textContent = BilibiliEmbed.STYLES;

    // 批量添加节点
    this.shadowRoot!.append(style, wrapper);
    wrapper.appendChild(iframe);
  }
}

customElements.define('bilibili-video', BilibiliEmbed);

/**
 * 双色链接组件
 * 使用示例：<resource-link left-text="文档" right-text="PDF" href="/file.pdf"></resource-link>
 */
class ResourceLinkElement extends HTMLElement {
  private shadow: ShadowRoot;

  static get observedAttributes() {
    return ['left-text', 'right-text', 'href', 'target'];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.render();
  }

  /**
   * 初始化渲染组件结构
   */
  private render() {
    this.shadow.innerHTML = `
      <style>
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
          font-family: Arial, sans-serif;
        }

        .rl-container {
          display: inline-flex;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          text-decoration: none;
          color: var(--rl-text-color);
          position: relative;
          margin: 10px 0 10px 0;
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
      </style>

      <a class="rl-container" role="link" tabindex="0">
        <div class="rl-left"></div>
        <div class="rl-right"></div>
      </a>
    `;

    // 事件绑定
    const linkElement = this.shadow.querySelector('a')!;
    linkElement.addEventListener('click', this.handleClick.bind(this));
    linkElement.addEventListener('keydown', this.handleKeyPress.bind(this));
  }

  /**
   * 更新组件内容（当属性变化时调用）
   */
  private updateContent() {
    const link = this.shadow.querySelector('a')!;
    link.href = this.getAttribute('href')?.trim() || '#';
    link.target = this.getAttribute('target') || '_self';

    // 获取文本属性值
    const leftText = this.getAttribute('left-text') || '';
    const rightText = this.getAttribute('right-text') || '';

    // 获取左右部分的 DOM 元素
    const left = this.shadow.querySelector('.rl-left') as HTMLElement;
    const right = this.shadow.querySelector('.rl-right') as HTMLElement;

    // 处理左侧内容
    if (leftText.trim() === '') {
      left.style.display = 'none'; // 为空时隐藏
    } else {
      left.style.display = 'flex'; // 不为空时显示
      left.textContent = leftText; // 设置文本内容
    }

    // 处理右侧内容
    if (rightText.trim() === '') {
      right.style.display = 'none'; // 为空时隐藏
    } else {
      right.style.display = 'flex'; // 不为空时显示
      right.textContent = rightText; // 设置文本内容
    }
  }

  // 生命周期方法
  connectedCallback() {
    this.updateContent();
  }

  attributeChangedCallback() {
    this.updateContent();
  }

  /**
   * 处理点击事件，阻止空链接的默认行为
   */
  private handleClick(e: Event) {
    const href = this.getAttribute('href');
    if (!href || href === '#') {
      e.preventDefault();
    }
  }

  /**
   * 处理键盘事件，支持回车键触发
   */
  private handleKeyPress(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.dispatchEvent(new MouseEvent('click'));
    }
  }
}

customElements.define('resource-link', ResourceLinkElement);