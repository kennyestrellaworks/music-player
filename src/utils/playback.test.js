import test from "node:test";
import assert from "node:assert/strict";

import {
  getFilteredPlaylist,
  getNextSong,
  sortPlaylistByReleasedYear,
} from "./playback.js";

const songs = [
  {
    _id: "1",
    title: "Baby One More Time",
    artist: "Britney Spears",
    file: "/music/1.mp3",
  },
  { _id: "2", title: "Lucky", artist: "Britney Spears", file: "/music/2.mp3" },
  { _id: "3", title: "Shut Up", artist: "Simple Plan", file: "/music/3.mp3" },
  { _id: "4", title: "Toxic", artist: "Britney Spears", file: "/music/4.mp3" },
];

test("filters songs using the active search query", () => {
  const filtered = getFilteredPlaylist(songs, "Britney");

  assert.deepEqual(
    filtered.map((song) => song._id),
    ["1", "2", "4"],
  );
});

test("advances within the filtered playlist instead of the original list", () => {
  const filtered = getFilteredPlaylist(songs, "Britney");
  const nextSong = getNextSong(filtered, songs[0], 1);

  assert.equal(nextSong?._id, "2");
});

test("sorts songs by released year from newest to oldest without mutating the playlist", () => {
  const playlist = [
    { _id: "older", releasedYear: 1999 },
    { _id: "newer", releasedYear: 2024 },
    { _id: "same-year-first", releasedYear: 2020 },
    { _id: "same-year-second", releasedYear: 2020 },
    { _id: "unknown-year" },
  ];

  const sorted = sortPlaylistByReleasedYear(playlist);

  assert.deepEqual(
    sorted.map((song) => song._id),
    ["newer", "same-year-first", "same-year-second", "older", "unknown-year"],
  );
  assert.equal(playlist[0]._id, "older");
});
