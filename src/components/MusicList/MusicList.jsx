import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import "./MusicList.css";
import artists from "../../data/artists.json";
import { getFilteredPlaylist } from "../../utils/playback";

const truncateTitle = (title, maxLength = 30) => {
  const safeTitle = typeof title === "string" ? title : "";

  if (!safeTitle) {
    return "Untitled";
  }

  if (safeTitle.length <= maxLength) {
    return safeTitle;
  }

  return `${safeTitle.slice(0, maxLength).trimEnd()}...`;
};

const isSameSong = (firstSong, secondSong) => {
  if (!firstSong || !secondSong) {
    return false;
  }

  return (
    firstSong._id === secondSong._id ||
    (firstSong.file && secondSong.file && firstSong.file === secondSong.file)
  );
};

const getSongKey = (song, index) => {
  const baseKey = song?._id || song?.file || song?.title || `song-${index}`;

  return `${baseKey}-${index}`;
};

export const MusicList = ({
  audioRef,
  currentSong,
  onSongSelect,
  playlist,
  search,
  onSearchChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showArtistList, setShowArtistList] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const listRef = useRef(null);
  const activeSongRef = useRef(null);

  useEffect(() => {
    const audio = audioRef?.current;

    if (!audio) {
      return undefined;
    }

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handlePause);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handlePause);
    };
  }, [audioRef]);

  const handlePlaySong = (song) => {
    const audio = audioRef?.current;

    if (!audio) {
      return;
    }

    onSongSelect?.(song);
    audio.src = song.file;
    audio.play().catch(() => {
      // Browser may block autoplay until the user interacts; we already handle the click.
    });
  };

  const filteredMusic = useMemo(
    () => getFilteredPlaylist(playlist, search),
    [playlist, search],
  );

  const artistNames = useMemo(
    () =>
      [
        ...new Set(
          (artists ?? []).map((artist) => artist?.name).filter(Boolean),
        ),
      ].sort((left, right) => left.localeCompare(right)),
    [],
  );

  const hasSearchQuery = search.trim().length > 0;
  const selectedArtistSongs = selectedArtist?.songs ?? [];

  const handleArtistSelect = (artistName) => {
    const normalizedName = artistName?.trim();
    const matchingArtist =
      (artists ?? []).find(
        (artist) =>
          artist?.name?.trim().toLowerCase() === normalizedName?.toLowerCase(),
      ) ?? null;

    setSelectedArtist(matchingArtist);
    onSearchChange(artistName);
    setShowArtistList(false);
  };

  const handleSearchChange = (nextValue) => {
    onSearchChange(nextValue);

    if (!nextValue.trim()) {
      setSelectedArtist(null);
      return;
    }

    const normalizedSearch = nextValue.trim().toLowerCase();
    const nextSelectedArtist =
      (artists ?? []).find(
        (artist) =>
          artist?.name?.trim().toLowerCase() === normalizedSearch,
      ) ?? null;

    if (!selectedArtist || normalizedSearch !== selectedArtist.name?.trim().toLowerCase()) {
      setSelectedArtist(nextSelectedArtist);
    }
  };

  const visibleArtistNames = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return artistNames;
    }

    return artistNames.filter((artistName) =>
      artistName.toLowerCase().includes(normalizedSearch),
    );
  }, [artistNames, search]);

  useEffect(() => {
    const list = listRef.current;
    const activeItem = activeSongRef.current;

    if (!list || !activeItem || !currentSong?._id) {
      return;
    }

    const itemTop = activeItem.offsetTop;
    const itemBottom = itemTop + activeItem.offsetHeight;
    const listTop = list.scrollTop;
    const listBottom = listTop + list.clientHeight;

    if (itemTop < listTop || itemBottom > listBottom) {
      activeItem.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [currentSong?._id, filteredMusic]);

  return (
    <div className="music-list">
      <audio ref={audioRef} preload="auto" crossOrigin="anonymous" />

      <div className="music-list__search-wrap">
        <div className="music-list__filter">
          <div className="music-list__search-field">
            <input
              className="music-list__search"
              type="search"
              placeholder="Search songs or artists"
              aria-label="Search songs or artists"
              aria-controls="music-search-results"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
            />
            {!search ? (
              <span className="music-list__search-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
                </svg>
              </span>
            ) : null}
            {search ? (
              <button
                className="music-list__clear-search"
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  onSearchChange("");
                  setSelectedArtist(null);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="m6 6 12 12M18 6 6 18"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            ) : null}
          </div>
          <button
            className={`music-list__artist ${showArtistList ? "music-list__artist--active" : ""}`.trim()}
            type="button"
            onClick={() => setShowArtistList((isVisible) => !isVisible)}
            aria-pressed={showArtistList}
          >
            Artists
          </button>
        </div>
      </div>

      <div
        id="music-search-results"
        ref={listRef}
        className="music-list__dropdown music-list__dropdown-default"
        aria-live="polite"
      >
        {showArtistList ? (
          visibleArtistNames.length === 0 ? (
            <p className="music-list__empty">No matching artist found.</p>
          ) : (
            visibleArtistNames.map((artistName) => (
              <button
                key={artistName}
                type="button"
                className="music-list__artist-item"
                onClick={() => handleArtistSelect(artistName)}
              >
                {artistName}
              </button>
            ))
          )
        ) : hasSearchQuery && (selectedArtist ? selectedArtistSongs.length === 0 : filteredMusic.length === 0) ? (
          <p className="music-list__empty">No matching songs found.</p>
        ) : (
          (selectedArtist ? selectedArtistSongs : filteredMusic).map((song, index) => {
            const isActive = isSameSong(currentSong, song);
            const songKey = getSongKey(song, index);

            return (
              <button
                key={songKey}
                ref={isActive ? activeSongRef : undefined}
                type="button"
                className={`music-list__item ${isActive ? "is-active" : ""}`}
                aria-label={`Play ${song.title} by ${song.artist}`}
                aria-pressed={isActive}
                onClick={() => handlePlaySong(song)}
              >
                <span className="music-list__title">
                  {truncateTitle(song.title)}
                </span>
                <span className="music-list__artist-name">{song.artist}</span>
                {isActive && isPlaying ? (
                  <span className="music-list__playing" aria-label="Playing">
                    <span />
                    <span />
                    <span />
                    <span />
                  </span>
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

MusicList.propTypes = {
  audioRef: PropTypes.shape({
    current: PropTypes.object,
  }).isRequired,
  currentSong: PropTypes.shape({
    _id: PropTypes.string,
  }),
  onSongSelect: PropTypes.func.isRequired,
  playlist: PropTypes.arrayOf(PropTypes.object).isRequired,
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
};
