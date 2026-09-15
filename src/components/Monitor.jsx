import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import "./Monitor.css";

let youtubeApiPromise;

function loadYoutubeApi() {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      const previousCallback = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.();
        resolve(window.YT);
      };

      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.body.appendChild(script);
    });
  }

  return youtubeApiPromise;
}

const formatTime = (seconds) => {
  const totalSeconds = Math.floor(seconds || 0);
  const minutes = Math.floor(totalSeconds / 60);
  const remainder = String(totalSeconds % 60).padStart(2, "0");

  return `${minutes}:${remainder}`;
};

export const Monitor = ({
  track,
  onNext,
  onPrevious,
  onPlaybackStateChange,
}) => {
  const playerElementRef = useRef(null);
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!track) {
      playerRef.current?.destroy();
      playerRef.current = null;
      setIsPlaying(false);
      onPlaybackStateChange(false);
      return undefined;
    }

    let isCancelled = false;
    setIsPlaying(false);
    onPlaybackStateChange(false);

    loadYoutubeApi().then((youtube) => {
      if (isCancelled || !playerElementRef.current) {
        return;
      }

      if (!playerRef.current) {
        playerRef.current = new youtube.Player(playerElementRef.current, {
          videoId: track.youtubeId,
          playerVars: {
            controls: 0,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onReady: (event) => {
              setDuration(event.target.getDuration());
              event.target.playVideo();
            },
            onStateChange: (event) => {
              const playing = event.data === youtube.PlayerState.PLAYING;
              setIsPlaying(playing);
              onPlaybackStateChange(playing);
            },
          },
        });
      } else {
        playerRef.current.loadVideoById(track.youtubeId);
        setCurrentTime(0);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [track]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
        setDuration(playerRef.current.getDuration());
      }
    }, 500);

    return () => window.clearInterval(timer);
  }, []);

  const togglePlayback = () => {
    if (isPlaying) {
      playerRef.current?.pauseVideo();
    } else {
      playerRef.current?.playVideo();
    }
  };

  const handleSeek = (event) => {
    const nextTime = Number(event.target.value);
    setCurrentTime(nextTime);
    playerRef.current?.seekTo(nextTime, true);
  };

  return (
    <section className="monitor__content" aria-label="Music monitor">
      {track ? (
        <>
          <div className="monitor__video-wrap">
            <div
              className="monitor__video"
              ref={playerElementRef}
              title={`${track.title} by ${track.artist}`}
            />
          </div>
          <div className="monitor__track">
            <strong>{track.title}</strong>
            <span>{track.artist}</span>
          </div>
          <div className="monitor__controls" aria-label="Playback controls">
            <button
              type="button"
              onClick={onPrevious}
              aria-label="Previous track"
            >
              <img
                className="monitor__control-icon"
                src="/images/previous-svgrepo-com.svg"
                alt=""
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              onClick={togglePlayback}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <img
                  className="monitor__control-icon"
                  src="/images/pause-svgrepo-com.svg"
                  alt=""
                  aria-hidden="true"
                />
              ) : (
                <img
                  className="monitor__control-icon monitor__control-icon--play"
                  src="/images/play-svgrepo-com.svg"
                  alt=""
                  aria-hidden="true"
                />
              )}
            </button>
            <button type="button" onClick={onNext} aria-label="Next track">
              <img
                className="monitor__control-icon"
                src="/images/next-svgrepo-com.svg"
                alt=""
                aria-hidden="true"
              />
            </button>
            <span className="monitor__time">{formatTime(currentTime)}</span>
            <input
              className="monitor__progress"
              type="range"
              min="0"
              max={duration || 0}
              step="1"
              value={Math.min(currentTime, duration || 0)}
              onChange={handleSeek}
              aria-label="Seek through track"
            />
            <span className="monitor__time">{formatTime(duration)}</span>
          </div>
        </>
      ) : (
        <p className="monitor__empty">Select a song to play</p>
      )}
    </section>
  );
};

Monitor.propTypes = {
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onPlaybackStateChange: PropTypes.func.isRequired,
  track: PropTypes.shape({
    artist: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    youtubeId: PropTypes.string.isRequired,
  }),
};
