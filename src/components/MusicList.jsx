import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import music from "../data/music.json";
import { getYoutubeThumbnail } from "../utils/youtube";
import "./MusicList.css";

export const MusicList = ({ onTrackSelect, selectedTrackId, isPlaying }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);
  const selectedTrack = music.find((track) => track._id === selectedTrackId);

  const filteredMusic = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return music.filter(({ _id: trackId, artist, title }) => {
      const matchesSearch = normalizedSearchTerm
        ? `${title} ${artist}`.toLowerCase().includes(normalizedSearchTerm)
        : true;

      return matchesSearch && trackId !== selectedTrackId;
    });
  }, [searchTerm, selectedTrackId]);

  const handleSelectTrack = (track) => {
    onTrackSelect(track);
  };

  return (
    <section className="music-list" aria-label="Search music">
      <div className="music-list__search-wrap">
        <input
          className="music-list__search"
          type="search"
          placeholder="Search songs or artists"
          value={searchTerm}
          aria-label="Search songs or artists"
          aria-expanded={isDropdownOpen}
          aria-controls="music-search-results"
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
        />
        <span className="music-list__search-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
          </svg>
        </span>
      </div>

      {selectedTrack && (
        <div className="selected-song" aria-label="Selected song">
          <img
            className="music-list__thumbnail"
            src={getYoutubeThumbnail(selectedTrack.youtubeId)}
            alt=""
          />
          <span className="music-list__option-details">
            <span className="music-list__option-title">
              {selectedTrack.title}
            </span>
            <span className="music-list__option-artist">
              {selectedTrack.artist}
            </span>
          </span>
          {isPlaying && (
            <span className="music-list__playing-bars" aria-label="Playing">
              <span />
              <span />
              <span />
            </span>
          )}
        </div>
      )}

      {isDropdownOpen && (
        <div
          className={`music-list__dropdown ${
            selectedTrack
              ? "music-list__dropdown-has-active"
              : "music-list__dropdown-default"
          }`}
          id="music-search-results"
        >
          {filteredMusic.length > 0 ? (
            filteredMusic.map((track) => (
              <button
                className={`music-list__option ${
                  selectedTrackId === track._id
                    ? "music-list__option--selected"
                    : ""
                }`}
                type="button"
                key={track._id}
                aria-pressed={selectedTrackId === track._id}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelectTrack(track)}
              >
                <img
                  className="music-list__thumbnail"
                  src={getYoutubeThumbnail(track.youtubeId)}
                  alt=""
                />
                <span className="music-list__option-details">
                  <span className="music-list__option-title">
                    {track.title}
                  </span>
                  <span className="music-list__option-artist">
                    {track.artist}
                  </span>
                </span>
                {isPlaying && selectedTrackId === track._id && (
                  <span
                    className="music-list__playing-bars"
                    aria-label="Playing"
                  >
                    <span />
                    <span />
                    <span />
                  </span>
                )}
              </button>
            ))
          ) : (
            <p className="music-list__empty">No songs found</p>
          )}
        </div>
      )}
    </section>
  );
};

MusicList.propTypes = {
  isPlaying: PropTypes.bool,
  onTrackSelect: PropTypes.func.isRequired,
  selectedTrackId: PropTypes.string,
};
