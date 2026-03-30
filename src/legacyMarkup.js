const markup = `
  <div class="app landing-mode" id="app">
    <main class="workspace">
      <div class="canvas-shell">
        <section class="canvas" id="canvas">
          <div class="canvas-inner">
            <div class="workspace-tools" id="workspaceTools">
              <div class="workspace-tools-left"></div>
              <div class="workspace-tools-right">
                <button class="tool-btn" id="newThread" type="button">+ <span>New Chat</span></button>
                <button class="tool-btn" id="historyButton" type="button">⧗ <span>History</span></button>
                <button class="tool-btn" id="bookmarksButton" type="button">⊞ <span>Bookmarks</span></button>
                <div class="profile-wrap">
                  <button class="tool-btn profile-btn" id="profileButton" type="button" aria-label="Profile">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="8" r="4"></circle>
                      <path d="M4 20c0-4.2 3.6-7 8-7s8 2.8 8 7"></path>
                    </svg>
                  </button>
                  <div class="profile-menu" id="profileMenu" hidden>
                    <button type="button" data-sign-out>Sign out</button>
                  </div>
                </div>
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

        <aside class="side-sheet" id="historySheet">
          <div class="panel-shell">
            <div class="panel-header">
              <div>
                <div class="panel-title">History</div>
                <div class="panel-meta">Recent chats and their latest update</div>
              </div>
              <button class="close-btn" type="button" data-close="history">×</button>
            </div>
            <div class="panel-body history-list" id="historyList"></div>
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
