const markup = `
  <div class="app landing-mode" id="app">
    <aside class="sidebar">
      <button class="rail-btn" id="toggleHistory" type="button">
        <span class="rail-icon" id="toggleHistoryIcon">▸</span>
        <span class="rail-label" id="toggleHistoryLabel">Expand</span>
      </button>
      <button class="rail-btn" id="newThread" type="button">
        <span class="rail-icon">+</span>
        <span class="rail-label">New Thread</span>
      </button>
      <button class="rail-btn" id="historyButton" type="button">
        <span class="rail-icon">⧗</span>
        <span class="rail-label">History</span>
      </button>
      <div class="history-panel">
        <div class="history-divider" id="historyDivider"></div>
        <div class="history-list" id="historyList"></div>
      </div>
    </aside>

    <main class="workspace">
      <div class="canvas-shell">
        <section class="canvas" id="canvas">
          <div class="canvas-inner">
            <div class="workspace-tools" id="workspaceTools">
              <div class="workspace-tools-left">
                <button class="back-btn" id="backToLanding" type="button">← <span>Back to Landing</span></button>
              </div>
              <div class="workspace-tools-right">
                <button class="tool-btn" id="bookmarksButton" type="button">⊞ <span>Bookmarks</span></button>
                <button class="tool-btn" id="artifactsButton" type="button">◇ <span>Artifacts</span></button>
              </div>
            </div>

            <div class="workspace-main" id="workspaceMain">
              <section class="landing" id="landing"></section>
              <section class="empty-thread" id="emptyThread"></section>
              <section class="thread" id="thread"></section>
            </div>
          </div>
        </section>

        <div class="landing-floater" id="landingFloater">
          <button class="landing-floater-btn" id="starterButton" type="button">
            <span class="floater-plus">+</span>
            <span>Start your own conversation</span>
          </button>
        </div>

        <div class="timeline-rail" id="timelineRail">
          <div class="timeline-tooltip" id="timelineTooltip"></div>
          <div class="timeline-stack">
            <button class="chevron" id="scrollUp" type="button">▲</button>
            <div class="timeline-segments" id="timelineSegments"></div>
            <button class="chevron" id="scrollDown" type="button">▼</button>
          </div>
        </div>

        <div class="input-zone" id="inputZone">
          <div>
            <form class="input-shell" id="composer">
              <input id="composerInput" type="text" autocomplete="off" placeholder="ask a follow-up..." />
              <button class="send-btn" type="submit">→</button>
            </form>
            <div class="composer-starters" id="composerStarters"></div>
          </div>
        </div>

        <aside class="panel" id="drillPanel">
          <div class="panel-shell">
            <div class="panel-header">
              <div>
                <div class="panel-title" id="panelTitle">Vendor Insights</div>
                <div class="panel-meta" id="panelMeta">Drill-down</div>
              </div>
              <button class="close-btn" type="button" data-close="panel">×</button>
            </div>
            <div class="panel-body" id="panelBody"></div>
          </div>
        </aside>

        <aside class="side-sheet" id="bookmarksSheet">
          <div class="panel-shell">
            <div class="panel-header">
              <div>
                <div class="panel-title">Bookmarks</div>
                <div class="panel-meta">Bookmarked items from this workspace</div>
              </div>
              <button class="close-btn" type="button" data-close="bookmarks">×</button>
            </div>
            <div class="panel-body" id="bookmarksList"></div>
          </div>
        </aside>

        <aside class="side-sheet" id="artifactsSheet">
          <div class="panel-shell">
            <div class="panel-header">
              <div>
                <div class="panel-title">Artifacts</div>
                <div class="panel-meta">Generated outputs from this workspace</div>
              </div>
              <button class="close-btn" type="button" data-close="artifacts">×</button>
            </div>
            <div class="panel-body" id="artifactsList"></div>
          </div>
        </aside>
      </div>
    </main>
  </div>

`;

export default markup;
