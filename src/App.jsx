import { useState } from "react";
import "./App.css";
import { MusicList } from "./components/MusicList";
import { Monitor } from "./components/Monitor";
import music from "./data/music.json";

function App() {
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const selectTrack = (track) => {
    setSelectedTrack(track);
  };

  const selectRelativeTrack = (offset) => {
    const currentIndex = music.findIndex(
      (track) => track._id === selectedTrack?._id,
    );
    const nextIndex =
      currentIndex < 0
        ? 0
        : (currentIndex + offset + music.length) % music.length;

    setSelectedTrack(music[nextIndex]);
  };

  return (
    <main className="artwork" aria-label="Centered portrait artwork">
      <div className="artwork__glow" aria-hidden="true" />
      <div className="artwork__composition">
        <img
          className="artwork__head"
          src="/images/head.png"
          alt="Green-toned portrait with closed eyes"
        />
        <div className="monitor">
          <img
            className="artwork__forehead"
            src="/images/forehead.png"
            alt=""
          />
          <div className="monitor__view">
            <Monitor
              track={selectedTrack}
              onPrevious={() => selectRelativeTrack(-1)}
              onNext={() => selectRelativeTrack(1)}
              onPlaybackStateChange={setIsPlaying}
            />
          </div>
        </div>
        <div className="left-panel">
          <div className="panel-wrap panel-wrap__left">
            <div className="panel-speaker">
              <button
                className="panel-button__arrow-left"
                type="button"
                aria-expanded={isLeftPanelOpen}
                aria-controls="left-panel-content"
                onClick={() => setIsLeftPanelOpen((isOpen) => !isOpen)}
              >
                <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                  <path d="M338.752 104.704a64 64 0 000 90.496l316.8 316.8-316.8 316.8a64 64 0 0090.496 90.496l362.048-362.048a64 64 0 000-90.496L429.248 104.704a64 64 0 00-90.496 0z" />
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
              <div className="music-list">
                <MusicList
                  onTrackSelect={selectTrack}
                  selectedTrackId={selectedTrack?._id}
                  isPlaying={isPlaying}
                />
              </div>
            </div>
          </div>
        </div>
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
                type="button"
                aria-expanded={isRightPanelOpen}
                aria-controls="right-panel-content"
                onClick={() => setIsRightPanelOpen((isOpen) => !isOpen)}
              >
                <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                  <path d="M685.248 104.704a64 64 0 010 90.496L368.448 512l316.8 316.8a64 64 0 01-90.496 90.496L232.704 557.248a64 64 0 010-90.496l362.048-362.048a64 64 0 0190.496 0z" />
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
}

export default App;
