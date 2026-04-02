export function WorkspaceShell() {
  return (
    <div className="app landing-mode" id="app">
      <main className="workspace">
        <div className="canvas-shell">
          <section className="canvas" id="canvas">
            <div className="canvas-inner">
              <div className="workspace-tools" id="workspaceTools">
                <div className="workspace-tools-left">
                  <div className="workspace-brand">Enterprise Brain</div>
                </div>
                <div className="workspace-tools-right">
                  <button className="tool-btn" id="newThread" type="button">
                    + <span>New Chat</span>
                  </button>
                  <button className="tool-btn" id="historyButton" type="button">
                    ⧗ <span>History</span>
                  </button>
                  <button className="tool-btn" id="bookmarksButton" type="button">
                    ⊞ <span>Bookmarks</span>
                  </button>
                  <button className="tool-btn" id="questionsButton" type="button">
                    ? <span>Questions</span>
                  </button>
                  <div className="profile-wrap">
                    <button className="tool-btn profile-btn" id="profileButton" type="button" aria-label="Profile">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4.2 3.6-7 8-7s8 2.8 8 7" />
                      </svg>
                    </button>
                    <div className="profile-menu" id="profileMenu" hidden>
                      <button type="button" data-sign-out>
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="workspace-main" id="workspaceMain">
                <section className="landing" id="landing" />
                <section className="empty-thread" id="emptyThread" />
                <section className="thread" id="thread" />
              </div>
            </div>
          </section>

          <div className="landing-floater" id="landingFloater">
            <button className="landing-floater-btn" id="starterButton" type="button">
              <span className="floater-plus">+</span>
              <span>Start your own conversation</span>
            </button>
          </div>

          <div className="timeline-rail" id="timelineRail">
            <div className="timeline-tooltip" id="timelineTooltip" />
            <div className="timeline-stack">
              <button className="chevron" id="scrollUp" type="button">
                ▲
              </button>
              <div className="timeline-segments" id="timelineSegments" />
              <button className="chevron" id="scrollDown" type="button">
                ▼
              </button>
            </div>
          </div>

          <div className="input-zone" id="inputZone">
            <div>
              <form className="input-shell" id="composer">
                <input id="composerInput" type="text" autoComplete="off" placeholder="ask a follow-up..." />
                <button className="send-btn" type="submit">
                  →
                </button>
              </form>
              <div className="composer-starters" id="composerStarters" />
            </div>
          </div>

          <aside className="panel" id="drillPanel">
            <div className="panel-shell">
              <div className="panel-header">
                <div>
                  <div className="panel-title" id="panelTitle">
                    Vendor Insights
                  </div>
                  <div className="panel-meta" id="panelMeta">
                    Drill-down
                  </div>
                </div>
                <button className="close-btn" type="button" data-close="panel">
                  ×
                </button>
              </div>
              <div className="panel-body" id="panelBody" />
            </div>
          </aside>

          <aside className="side-sheet" id="bookmarksSheet">
            <div className="panel-shell">
              <div className="panel-header">
                <div>
                  <div className="panel-title">Bookmarks</div>
                  <div className="panel-meta">Bookmarked items from this workspace</div>
                </div>
                <button className="close-btn" type="button" data-close="bookmarks">
                  ×
                </button>
              </div>
              <div className="panel-body" id="bookmarksList" />
            </div>
          </aside>

          <aside className="side-sheet" id="historySheet">
            <div className="panel-shell">
              <div className="panel-header">
                <div>
                  <div className="panel-title">History</div>
                  <div className="panel-meta">Recent chats and their latest update</div>
                </div>
                <button className="close-btn" type="button" data-close="history">
                  ×
                </button>
              </div>
              <div className="panel-body history-list" id="historyList" />
            </div>
          </aside>

          <aside className="side-sheet" id="questionsSheet">
            <div className="panel-shell">
              <div className="panel-header">
                <div>
                  <div className="panel-title">Questions</div>
                  <div className="panel-meta">Browse all available prompts for this workspace</div>
                </div>
                <button className="close-btn" type="button" data-close="questions">
                  ×
                </button>
              </div>
              <div className="panel-body history-list" id="questionsList" />
            </div>
          </aside>

          <aside className="side-sheet" id="artifactsSheet">
            <div className="panel-shell">
              <div className="panel-header">
                <div>
                  <div className="panel-title">Artifacts</div>
                  <div className="panel-meta">Generated outputs from this workspace</div>
                </div>
                <button className="close-btn" type="button" data-close="artifacts">
                  ×
                </button>
              </div>
              <div className="panel-body" id="artifactsList" />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
