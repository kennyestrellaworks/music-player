import { useMemo, useRef, useState } from "react";
import { MusicList } from "./components/MusicList/MusicList";
import music from "./data/music-local.json";
import "./App.css";
import { MainView } from "./components/MainView/MainView";
import { Equalizer } from "./components/Monitor/Equalizer";
import {
  getFilteredPlaylist,
  getNextSong,
  sortPlaylistByReleasedYear,
} from "./utils/playback";

const normalizePlaylist = (songs = []) => {
  const seen = new Set();

  const normalizedPlaylist = songs.filter((song) => {
    if (!song || typeof song !== "object") {
      return false;
    }

    const key =
      (song._id && String(song._id).trim()) ||
      (song.url && String(song.url).trim()) ||
      `${song.title ?? "untitled"}-${song.artist ?? "unknown"}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });

  return sortPlaylistByReleasedYear(normalizedPlaylist);
};

export const App = () => {
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [currentSong, setCurrentSong] = useState(null);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [equalizerValues, setEqualizerValues] = useState([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);
  const [playlist, setPlaylist] = useState(() => normalizePlaylist(music));
  const audioRef = useRef(null);
  const filteredPlaylist = useMemo(
    () => getFilteredPlaylist(playlist, searchQuery),
    [playlist, searchQuery],
  );

  const handleNavigate = (direction) => {
    if (!currentSong || !audioRef.current) {
      return;
    }

    const activeQueue = searchQuery.trim() ? filteredPlaylist : playlist;
    const nextSong = getNextSong(activeQueue, currentSong, direction);

    if (!nextSong) {
      return;
    }

    setCurrentSong(nextSong);
    audioRef.current.src = nextsong.url;
    audioRef.current.play().catch(() => {
      // Browser may block playback until the user interacts again.
    });
  };

  const handleStop = () => {
    const audio = audioRef.current;

    audio?.pause();
    if (audio) {
      audio.src = "";
      audio.load();
    }
    setCurrentSong(null);
    setIsAutoplay(false);
    setIsShuffle(false);
    setSearchQuery("");
    setPlaylist(normalizePlaylist(music));
  };

  const handleShuffle = () => {
    if (!isAutoplay || !currentSong) {
      return;
    }

    setIsShuffle(true);

    const queueBase = searchQuery.trim() ? filteredPlaylist : playlist;
    const remainingSongs = normalizePlaylist(
      queueBase.filter((song) => song._id !== currentSong._id),
    );

    for (let index = remainingSongs.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [remainingSongs[index], remainingSongs[randomIndex]] = [
        remainingSongs[randomIndex],
        remainingSongs[index],
      ];
    }

    setPlaylist([currentSong, ...remainingSongs]);
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
        <MainView
          audioRef={audioRef}
          currentSong={currentSong}
          onPrevious={() => handleNavigate(-1)}
          onNext={() => handleNavigate(1)}
          onStop={handleStop}
          isAutoplay={isAutoplay}
          onToggleAutoplay={() => setIsAutoplay((enabled) => !enabled)}
          onShuffle={handleShuffle}
          isShuffle={isShuffle}
          equalizerValues={equalizerValues}
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
                className="panel-button panel-button__top-ear panel-button__left"
                src="/images/left-panel-button-area.png"
                alt=""
              />
              <img
                className="panel-button panel-button__middle-ear panel-button__middle-ear-left panel-button__left"
                src="/images/left-panel-ear-button.png"
                alt=""
              />
              <img
                className="panel-button panel-button__back-ear panel-button__left"
                src="/images/left-panel-ear-button-back.png"
                alt=""
              />
              <img
                className="artwork__panel artwork__panel--left"
                src="/images/left-panel-speaker.png"
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
              <div className="panel-content">
                <div
                  className={`panel-content__left ${isLeftPanelOpen ? "" : "is-collapsed"}`}
                >
                  <Equalizer onChange={setEqualizerValues} />
                </div>
              </div>
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
              <div className="panel-content">
                <div
                  className={`panel-content__right ${isRightPanelOpen ? "" : "is-collapsed"}`}
                >
                  <MusicList
                    audioRef={audioRef}
                    onSongSelect={setCurrentSong}
                    currentSong={currentSong}
                    playlist={playlist}
                    search={searchQuery}
                    onSearchChange={setSearchQuery}
                  />
                </div>
              </div>
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
                className="panel-button panel-button__top-ear panel-button__right"
                src="/images/right-panel-button-area.png"
                alt=""
              />
              <img
                className="panel-button panel-button__middle-ear-right panel-button__middle-ear panel-button__right"
                src="/images/right-panel-ear-button.png"
                alt=""
              />
              <img
                className="panel-button panel-button__back-ear panel-button__right"
                src="/images/right-panel-ear-button-back.png"
                alt=""
              />
              <img
                className="artwork__panel artwork__panel--right"
                src="/images/right-panel-speaker.png"
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
