import { useState } from "react";
import PropTypes from "prop-types";
import "./Equalizer.css";

// const frequencies = [
//   "31Hz",
//   "63Hz",
//   "125Hz",
//   "250Hz",
//   "500Hz",
//   "1kHz",
//   "2kHz",
//   "4kHz",
//   "8kHz",
//   "16kHz",
// ];

const frequencies = [
  { label: "31", label2: "Hz" },
  { label: "63", label2: "Hz" },
  { label: "125", label2: "Hz" },
  { label: "250", label2: "Hz" },
  { label: "500", label2: "Hz" },
  { label: "1", label2: "kHz" },
  { label: "2", label2: "kHz" },
  { label: "4", label2: "kHz" },
  { label: "8", label2: "kHz" },
  { label: "16", label2: "kHz" },
];

const presets = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  "Bass Boost": [6, 5, 4, 2, 0, 0, 0, 0, 0, 0],
  Vocal: [-2, -1, 0, 2, 4, 4, 3, 2, 1, 0],
  Rock: [4, 3, 2, 0, -2, -1, 2, 3, 4, 4],
  Jazz: [3, 2, 0, -1, -2, -2, 0, 2, 3, 3],
  Electronic: [4, 3, 1, 0, -2, 2, 1, 3, 4, 5],
  Acoustic: [3, 2, 1, 0, 2, 3, 3, 2, 1, 2],
};

const formatGain = (value) => (value > 0 ? `+${value}` : value);

export const Equalizer = ({ onChange }) => {
  const [values, setValues] = useState(presets.Flat);
  const [activePreset, setActivePreset] = useState("Flat");

  const updateValues = (nextValues, preset = null) => {
    setValues(nextValues);
    setActivePreset(preset);
    onChange?.(nextValues);
  };

  const handleBandChange = (index, value) => {
    const nextValues = values.map((currentValue, bandIndex) =>
      bandIndex === index ? Number(value) : currentValue,
    );

    updateValues(nextValues, activePreset);
  };

  return (
    <section className="equalizer" aria-label="Audio equalizer">
      <div className="equalizer__wrap">
        <div className="equalizer__bands">
          {frequencies.map((frequency, index) => (
            <div className="equalizer__band" key={index}>
              <output
                className="equalizer__value"
                htmlFor={`equalizer-${index}`}
              >
                {formatGain(values[index])}
              </output>
              <input
                id={`equalizer-${index}`}
                className="equalizer__slider"
                type="range"
                min="-12"
                max="12"
                step="1"
                value={values[index]}
                onChange={(event) =>
                  handleBandChange(index, event.target.value)
                }
                aria-label={`${frequency} gain`}
              />
              <div className="equalizer__labels">
                <strong>{frequency.label}</strong>
                <span>{frequency.label2}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="equalizer__presets">
          <button
            className="equalizer__reset"
            type="button"
            onClick={() => updateValues(presets.Flat, "Flat")}
          >
            Reset
          </button>
          <div className="equalizer__preset-grid">
            {Object.entries(presets).map(([presetName, presetValues]) => (
              <button
                className={`equalizer__preset ${activePreset === presetName ? "is-active" : ""}`}
                type="button"
                key={presetName}
                aria-pressed={activePreset === presetName}
                onClick={() => updateValues(presetValues, presetName)}
              >
                {presetName}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

Equalizer.propTypes = {
  onChange: PropTypes.func,
};
