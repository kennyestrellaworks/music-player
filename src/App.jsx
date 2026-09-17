import { useState } from "react";
import "./App.css";

export const App = () => {
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  return (
    <main className="artwork" aria-label="Centered portrait artwork">
      <div className="artwork__glow" aria-hidden="true" />
      <div className="artwork__composition">
        <img
          className="artwork__head"
          src="/images/head.png"
          alt="Green-toned portrait with closed eyes"
        />
        {/* Left panel */}
        <div className="left-panel">
          <div className="panel-wrap panel-wrap__left">
            <div className="panel-speaker">
              <button
                className="panel-button__arrow-left"
                aria-expanded={isLeftPanelOpen}
                type="button"
                aria-controls="left-panel-content"
                onClick={() => setIsLeftPanelOpen((isOpen) => !isOpen)}
              >
                <svg
                  viewBox="-0.5 0 7 7"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g transform="translate(-347.000000, -3766.000000)">
                    <g id="icons" transform="translate(56.000000, 160.000000)">
                      <path
                        d="M296.494737,3608.57322 L292.500752,3606.14219 C291.83208,3605.73542 291,3606.25002 291,3607.06891 L291,3611.93095 C291,3612.7509 291.83208,3613.26444 292.500752,3612.85767 L296.494737,3610.42771 C297.168421,3610.01774 297.168421,3608.98319 296.494737,3608.57322"
                        id="play-[#1003]"
                      ></path>
                    </g>
                  </g>
                </svg>
              </button>
              <img
                className="panel-button panel-button__left"
                src="/images/left-panel-button-area.png"
                alt=""
              />
              <img
                className="artwork__panel artwork__panel--left"
                src="/images/left-panel.png"
                alt=""
              />
            </div>
            <div
              id="left-panel-content"
              className={`left-panel__content ${isLeftPanelOpen ? "" : "is-collapsed"}`}
            >
              <img
                className="panel-open__left"
                src="/images/panel-open-bg.png"
                alt=""
                aria-hidden="true"
              />
              <div className="music-list">THIS</div>
            </div>
          </div>
        </div>
        {/* Right panel */}
        <div className="right-panel">
          <div className="panel-wrap panel-wrap__right">
            <div
              id="right-panel-content"
              className={`right-panel__content ${isRightPanelOpen ? "" : "is-collapsed"}`}
            >
              <img
                className="panel-open__right"
                src="/images/panel-open-bg.png"
                alt=""
                aria-hidden="true"
              />
            </div>
            <div className="panel-speaker">
              <button
                className="panel-button__arrow-right"
                aria-expanded={isRightPanelOpen}
                type="button"
                aria-controls="right-panel-content"
                onClick={() => setIsRightPanelOpen((isOpen) => !isOpen)}
              >
                <svg
                  viewBox="-0.5 0 7 7"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g transform="translate(-347.000000, -3766.000000)">
                    <g id="icons" transform="translate(56.000000, 160.000000)">
                      <path
                        d="M296.494737,3608.57322 L292.500752,3606.14219 C291.83208,3605.73542 291,3606.25002 291,3607.06891 L291,3611.93095 C291,3612.7509 291.83208,3613.26444 292.500752,3612.85767 L296.494737,3610.42771 C297.168421,3610.01774 297.168421,3608.98319 296.494737,3608.57322"
                        id="play-[#1003]"
                      ></path>
                    </g>
                  </g>
                </svg>
              </button>
              <img
                className="panel-button panel-button__right"
                src="/images/right-panel-button-area.png"
                alt=""
              />
              <img
                className="artwork__panel artwork__panel--right"
                src="/images/right-panel.png"
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
