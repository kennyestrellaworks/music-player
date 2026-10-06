import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const artistsFile = fileURLToPath(
  new URL("../data/artists.json", import.meta.url),
);
const songsFile = fileURLToPath(
  new URL("../data/music-local.json", import.meta.url),
);

const artists = JSON.parse(readFileSync(artistsFile, "utf8"));
const songs = JSON.parse(readFileSync(songsFile, "utf8"));

if (!Array.isArray(artists)) {
  throw new TypeError("Expected artists.json to contain an array.");
}

if (!Array.isArray(songs)) {
  throw new TypeError("Expected music-local.json to contain an array.");
}

console.log(`Total artists: ${artists.length}`);
console.log(`Total songs in music-local.json: ${songs.length}`);