import { useEffect, useMemo, useRef, useState } from "react";
import { AudioWave, useMediaAudio } from "@audiowave/react";
import PropTypes from "prop-types";
import "./MainView.css";
import { OrbButton, SimpleButton } from "../../components/ui/StyledButton";

const renderWaveform = ({
  context,
  audioData,
  isActive,
  dimensions,
  timestamp,
}) => {
  const { width, height } = dimensions;

  context.clearRect(0, 0, width, height);

  if (!isActive || !audioData?.length) {
    return;
  }

  const barWidth = 6;
  const gap = 3;
  const barCount = Math.floor(width / (barWidth + gap));
  const samplesPerBar = Math.max(1, Math.floor(audioData.length / barCount));

  const pulse = 0.08 + (Math.sin(timestamp / 500) + 1) * 0.04;
  const centerStop = 0.5 + Math.sin(timestamp / 1200) * 0.025;
  const barGradient = context.createLinearGradient(0, 0, 0, height);
  barGradient.addColorStop(0, "#8f38c8");
  barGradient.addColorStop(Math.max(0, centerStop - pulse), "#7ed8ff");
  barGradient.addColorStop(centerStop, "#ffffff");
  barGradient.addColorStop(Math.min(1, centerStop + pulse), "#7ed8ff");
  barGradient.addColorStop(1, "#8f38c8");
  context.fillStyle = barGradient;

  for (let barIndex = 0; barIndex < barCount; barIndex += 1) {
    let peak = 0;
    const start = barIndex * samplesPerBar;
    const end = Math.min(start + samplesPerBar, audioData.length);

    for (let sampleIndex = start; sampleIndex < end; sampleIndex += 1) {
      peak = Math.max(peak, Math.abs(audioData[sampleIndex] - 128) / 128);
    }

    const curvePhase = timestamp / 700;
    const curvePosition = barIndex / Math.max(1, barCount - 1);
    const curveScale =
      0.7 +
      0.3 * ((Math.sin(curvePosition * Math.PI * 2 - curvePhase) + 1) / 2);
    const barHeight = Math.min(
      height,
      Math.max(10, peak * height * 6 * curveScale),
    );
    const x = barIndex * (barWidth + gap);
    const y = (height - barHeight) / 2;

    context.beginPath();
    context.roundRect(x, y, barWidth, barHeight, 3);
    context.fill();
  }
};

export const MainView = ({
  audioRef,
  currentSong,
  onPrevious,
  onNext,
  onStop,
  isAutoplay,
  onToggleAutoplay,
  onShuffle,
  isShuffle,
  equalizerValues,
}) => {
  const [audioElement, setAudioElement] = useState(null);
  const [audioGraphNode, setAudioGraphNode] = useState(null);
  const audioGraphRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const controlsDisabled = !currentSong;

  useEffect(() => {
    const audio = audioRef?.current;

    if (!audio) {
      return undefined;
    }

    const activateVisualizer = () => {
      setAudioElement(audio);
    };
    const handlePlay = () => {
      setIsPlaying(true);
      audioGraphRef.current?.audioContext.resume();
    };
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleReset = () => {
      setCurrentTime(0);
      setDuration(0);
    };

    audio.addEventListener("play", activateVisualizer);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleDurationChange);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("emptied", handleReset);

    if (!audio.paused) {
      activateVisualizer();
      setIsPlaying(true);
    }

    return () => {
      audio.removeEventListener("play", activateVisualizer);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleDurationChange);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("emptied", handleReset);
    };
  }, [audioRef]);

  useEffect(() => {
    if (!audioElement) {
      return undefined;
    }

    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    const mediaSource = audioContext.createMediaElementSource(audioElement);
    const frequencies = [31, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
    const filters = frequencies.map((frequency) => {
      const filter = audioContext.createBiquadFilter();
      filter.type = "peaking";
      filter.frequency.value = frequency;
      filter.Q.value = 1;
      return filter;
    });

    mediaSource.connect(filters[0]);
    filters.forEach((filter, index) => {
      if (filters[index + 1]) {
        filter.connect(filters[index + 1]);
      }
    });
    filters.at(-1).connect(audioContext.destination);

    const graph = { audioContext, filters };
    audioGraphRef.current = graph;
    setAudioGraphNode(filters.at(-1));
    audioContext.resume();

    return () => {
      filters.forEach((filter) => filter.disconnect());
      mediaSource.disconnect();
      audioContext.close();
      audioGraphRef.current = null;
      setAudioGraphNode(null);
    };
  }, [audioElement]);

  useEffect(() => {
    const filters = audioGraphRef.current?.filters;

    if (!filters) {
      return;
    }

    filters.forEach((filter, index) => {
      filter.gain.value = equalizerValues[index] ?? 0;
    });
  }, [equalizerValues, audioGraphNode]);

  const handlePauseClick = () => {
    audioRef.current?.pause();
  };

  const handlePlayClick = () => {
    audioRef.current?.play().catch(() => {
      setIsPlaying(false);
    });
  };

  const handleSeek = (event) => {
    const nextTime = Number(event.target.value);

    setCurrentTime(nextTime);
    if (audioRef.current) {
      audioRef.current.currentTime = nextTime;
    }
  };

  const handleVolumeChange = (event) => {
    const nextVolume = Number(event.target.value);

    setVolume(nextVolume);
    setIsMuted(false);
    if (audioRef.current) {
      audioRef.current.volume = nextVolume;
      audioRef.current.muted = false;
    }
  };

  const handleMuteToggle = () => {
    const nextMuted = !isMuted;

    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
  };

  useEffect(() => {
    const audio = audioRef?.current;

    if (!audio || !isAutoplay) {
      return undefined;
    }

    const handleEnded = () => onNext();
    audio.addEventListener("ended", handleEnded);

    return () => audio.removeEventListener("ended", handleEnded);
  }, [audioRef, isAutoplay, onNext]);

  const audioSourceOptions = useMemo(
    () => ({ source: audioGraphNode }),
    [audioGraphNode],
  );
  const { source, error } = useMediaAudio(audioSourceOptions);

  return (
    <div className="main-view" aria-label="Media player display">
      <div className="main-view__controls" aria-label="Player controls">
        <div className="rewind-btn">
          <OrbButton
            color="#8F38C8"
            disabled={controlsDisabled}
            onClick={onPrevious}
          >
            <svg
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 2.5C8 2.31271 7.89533 2.14112 7.72879 2.05542C7.56226 1.96972 7.36179 1.98427 7.20938 2.09314L0.209381 7.09314C0.0779829 7.18699 0 7.33853 0 7.5C0 7.66148 0.0779829 7.81301 0.209381 7.90687L7.20938 12.9069C7.36179 13.0157 7.56226 13.0303 7.72879 12.9446C7.89533 12.8589 8 12.6873 8 12.5V8.4716L14.2094 12.9069C14.3618 13.0157 14.5623 13.0303 14.7288 12.9446C14.8953 12.8589 15 12.6873 15 12.5V2.5C15 2.31271 14.8953 2.14112 14.7288 2.05542C14.5623 1.96972 14.3618 1.98427 14.2094 2.09314L8 6.52841V2.5Z"
                fill="#000000"
              />
            </svg>
          </OrbButton>
        </div>
        <div
          className="pause-btn"
          style={{
            display: currentSong && !isPlaying ? "none" : undefined,
          }}
        >
          <OrbButton
            color="#8F38C8"
            disabled={controlsDisabled}
            onClick={handlePauseClick}
          >
            <span aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.163 3.819C5 4.139 5 4.559 5 5.4v13.2c0 .84 0 1.26.163 1.581a1.5 1.5 0 0 0 .656.655c.32.164.74.164 1.581.164h.2c.84 0 1.26 0 1.581-.163a1.5 1.5 0 0 0 .656-.656c.163-.32.163-.74.163-1.581V5.4c0-.84 0-1.26-.163-1.581a1.5 1.5 0 0 0-.656-.656C8.861 3 8.441 3 7.6 3h-.2c-.84 0-1.26 0-1.581.163a1.5 1.5 0 0 0-.656.656zm9 0C14 4.139 14 4.559 14 5.4v13.2c0 .84 0 1.26.164 1.581a1.5 1.5 0 0 0 .655.655c.32.164.74.164 1.581.164h.2c.84 0 1.26 0 1.581-.163a1.5 1.5 0 0 0 .655-.656c.164-.32.164-.74.164-1.581V5.4c0-.84 0-1.26-.163-1.581a1.5 1.5 0 0 0-.656-.656C17.861 3 17.441 3 16.6 3h-.2c-.84 0-1.26 0-1.581.163a1.5 1.5 0 0 0-.655.656z"
                  fill="#000000"
                />
              </svg>
            </span>
          </OrbButton>
        </div>
        <div
          className="play-btn"
          style={{
            display: !currentSong || isPlaying ? "none" : undefined,
          }}
        >
          <OrbButton
            color="#8F38C8"
            disabled={controlsDisabled}
            onClick={handlePlayClick}
          >
            <span aria-hidden="true">
              <svg viewBox="-3 0 28 28" xmlns="http://www.w3.org/2000/svg">
                <title>play</title>
                <desc>Created with Sketch Beta.</desc>
                <defs></defs>
                <g id="Page-1" stroke="none" fill="none" fillRule="evenodd">
                  <g
                    id="Icon-Set-Filled"
                    transform="translate(-419.000000, -571.000000)"
                    fill="#000000"
                  >
                    <path
                      d="M440.415,583.554 L421.418,571.311 C420.291,570.704 419,570.767 419,572.946 L419,597.054 C419,599.046 420.385,599.36 421.418,598.689 L440.415,586.446 C441.197,585.647 441.197,584.353 440.415,583.554"
                      id="play"
                    ></path>
                  </g>
                </g>
              </svg>
            </span>
          </OrbButton>
        </div>
        <div className="stop-btn">
          <OrbButton
            color="#8F38C8"
            disabled={controlsDisabled}
            onClick={onStop}
          >
            <span aria-hidden="true">
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <title>stop</title>
                <path
                  d="M5.92 24.096q0 0.832 0.576 1.408t1.44 0.608h16.128q0.832 0 1.44-0.608t0.576-1.408v-16.16q0-0.832-0.576-1.44t-1.44-0.576h-16.128q-0.832 0-1.44 0.576t-0.576 1.44v16.16z"
                  fill="#000000"
                ></path>
              </svg>
            </span>
          </OrbButton>
        </div>
        <div className="forward-btn">
          <OrbButton
            color="#8F38C8"
            disabled={controlsDisabled}
            onClick={onNext}
          >
            <svg
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 2.5C8 2.31271 7.89533 2.14112 7.72879 2.05542C7.56226 1.96972 7.36179 1.98427 7.20938 2.09314L0.209381 7.09314C0.0779829 7.18699 0 7.33853 0 7.5C0 7.66148 0.0779829 7.81301 0.209381 7.90687L7.20938 12.9069C7.36179 13.0157 7.56226 13.0303 7.72879 12.9446C7.89533 12.8589 8 12.6873 8 12.5V8.4716L14.2094 12.9069C14.3618 13.0157 14.5623 13.0303 14.7288 12.9446C14.8953 12.8589 15 12.6873 15 12.5V2.5C15 2.31271 14.8953 2.14112 14.7288 2.05542C14.5623 1.96972 14.3618 1.98427 14.2094 2.09314L8 6.52841V2.5Z"
                fill="#000000"
              />
            </svg>
          </OrbButton>
        </div>
        <div className="sunburst-btn" style={{ display: "none" }}>
          <OrbButton color="#e3bf20" disabled={controlsDisabled}>
            <span aria-hidden="true">
              <svg
                version="1.1"
                id="Layer_1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                viewBox="0 0 186.5 182"
                style={{ enableBackground: "new 0 0 186.5 182" }}
                xmlSpace="preserve"
              >
                <g id="b">
                  <g id="c">
                    <path
                      d="M175.4,80.2h-45.3c-0.8-2.4-1.8-4.8-3-7l32-31.3c2.2-2.1,3.2-4.9,3.2-7.6s-1.1-5.5-3.2-7.6c-4.3-4.2-11.3-4.2-15.6,0 l-32,31.3c-2.3-1.2-4.7-2.2-7.2-2.9V10.8c0-3-1.2-5.7-3.2-7.6c-2-2-4.8-3.2-7.8-3.2c-6.1,0-11.1,4.8-11.1,10.8V55 c-2.5,0.7-4.9,1.7-7.2,2.9l0,0L43,26.7c-4.3-4.2-11.3-4.2-15.6,0s-4.3,11,0,15.3l32,31.3c-1.2,2.2-2.2,4.6-3,7H11.1 C5,80.2,0,85,0,91s5,10.8,11.1,10.8h45.3c0.8,2.5,1.8,4.8,3,7l-32,31.3c-4.3,4.2-4.3,11.1,0,15.3c4.3,4.2,11.3,4.2,15.6,0l32-31.3 c2.3,1.2,4.7,2.2,7.2,2.9v44.2c0,6,4.9,10.8,11.1,10.8s11.1-4.8,11.1-10.8V127c2.5-0.7,4.9-1.7,7.2-2.9l32,31.3 c2.2,2.1,5,3.2,7.8,3.2s5.7-1.1,7.8-3.2c4.3-4.2,4.3-11.1,0-15.3l-32-31.3l0,0c1.2-2.2,2.2-4.6,3-7h45.3c3.1,0,5.8-1.2,7.8-3.2 c2-2,3.2-4.7,3.2-7.6C186.5,85,181.6,80.2,175.4,80.2L175.4,80.2z M105.5,101.8c-0.4,0.4-0.8,0.8-1.2,1.2 c-2.7,2.4-6.3,3.9-10.2,4.1c-0.3,0-0.6,0-0.8,0s-0.6,0-0.8,0c-3.9-0.2-7.5-1.7-10.2-4.1c-0.4-0.4-0.8-0.8-1.2-1.2 c-2.5-2.7-4-6.1-4.2-10l0,0c0-0.3,0-0.6,0-0.8s0-0.6,0-0.8c0.2-3.8,1.8-7.3,4.2-10c0.4-0.4,0.8-0.8,1.2-1.2 c2.7-2.4,6.3-3.9,10.2-4.1c0.3,0,0.6,0,0.8,0s0.6,0,0.8,0h0c3.9,0.2,7.5,1.7,10.2,4.1c0.4,0.4,0.8,0.8,1.2,1.2 c2.5,2.7,4,6.2,4.2,10c0,0.3,0,0.5,0,0.8s0,0.5,0,0.8C109.5,95.7,108,99.1,105.5,101.8z"
                      fill="#000000"
                    />
                  </g>
                </g>
              </svg>
            </span>
          </OrbButton>
        </div>
      </div>

      <div className="main-view__display">
        {currentSong ? (
          <div className="main-view__visual">
            {error ? (
              <p>Unable to visualize this track.</p>
            ) : (
              <div className="visualizer-view">
                <AudioWave
                  source={source}
                  width="100%"
                  height={150}
                  barColor="#7ed8ff"
                  secondaryBarColor="#9ff7ff"
                  barWidth={2}
                  gap={1}
                  rounded={4}
                  customRenderer={renderWaveform}
                  onlyActive
                />
                <input
                  className="track-progress"
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.01"
                  value={Math.min(currentTime, duration || 0)}
                  onChange={handleSeek}
                  disabled={!currentSong || !duration}
                  aria-label="Seek through track"
                />
              </div>
            )}
          </div>
        ) : (
          <p className="main-view__empty">
            Please select a track from the list
          </p>
        )}
      </div>
      <div className="main-view__controls-secondary">
        <div className="main-view__volume">
          <button
            className="main-view__volume-button"
            type="button"
            disabled={controlsDisabled}
            onClick={handleMuteToggle}
            aria-label={isMuted ? "Unmute" : "Mute"}
            aria-pressed={isMuted}
          >
            {isMuted ? (
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M2.293 21.707a1 1 0 0 0 1.414 0l5-5 0 0 10.5-10.5 0 0 2.5-2.5a1 1 0 1 0-1.414-1.414l-.793.793V3a1 1 0 0 0-1.53-.848L10.213 7H4A1 1 0 0 0 3 8v8a1 1 0 0 0 1 1h1.586l-3.293 3.293a1 1 0 0 0 0 1.414ZM5 15V9h5.5a1 1 0 0 0 .53-.152L17.5 4.805v.281L7.586 15H5Zm14.5-5V21a1 1 0 0 1-1.53.848l-6.4-4a1 1 0 0 1 1.061-1.7L17.5 19.2V10a1 1 0 0 1 2 0Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M2 17h3.638l5.722 4.769A1 1 0 0 0 12 22a.989.989 0 0 0 .424-.095A1 1 0 0 0 13 21V3a1 1 0 0 0-1.64-.769L5.638 7H2A1 1 0 0 0 1 8v8a1 1 0 0 0 1 1ZM3 9h3a1 1 0 0 0 .64-.231L11 5.135v13.73l-4.36-3.634A1 1 0 0 0 6 15H3V9Zm20 3a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-2h4a1 1 0 0 1 1 1Zm-2.293-7.293-4 4a1 1 0 0 1-1.414-1.414l4-4a1 1 0 1 1 1.414 1.414Zm-4 10.586 4 4a1 1 0 1 1-1.414 1.414l-4-4a1 1 0 0 1 1.414-1.414Z" />
              </svg>
            )}
          </button>
          <input
            className="main-view__volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            disabled={controlsDisabled}
            aria-label="Volume"
          />
        </div>
        <SimpleButton
          className="autoplay-btn"
          text="Auto Play"
          disabled={controlsDisabled}
          aria-label={isAutoplay ? "Disable autoplay" : "Enable autoplay"}
          aria-pressed={isAutoplay}
          active={isAutoplay}
          onClick={onToggleAutoplay}
        />
        <SimpleButton
          className="shuffle-btn"
          text="Shuffle"
          disabled={!isAutoplay || controlsDisabled}
          active={isShuffle}
          aria-label={isShuffle ? "Shuffle active" : "Shuffle"}
          aria-pressed={isShuffle}
          onClick={onShuffle}
        />
      </div>
    </div>
  );
};

MainView.propTypes = {
  audioRef: PropTypes.shape({
    current: PropTypes.object,
  }).isRequired,
  currentSong: PropTypes.object,
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onStop: PropTypes.func.isRequired,
  isAutoplay: PropTypes.bool.isRequired,
  onToggleAutoplay: PropTypes.func.isRequired,
  onShuffle: PropTypes.func.isRequired,
  isShuffle: PropTypes.bool.isRequired,
  equalizerValues: PropTypes.arrayOf(PropTypes.number).isRequired,
};
