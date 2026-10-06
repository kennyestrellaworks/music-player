import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const mp3Directory = fileURLToPath(
  new URL("../../public/mp3/", import.meta.url),
);
const musicFile = fileURLToPath(
  new URL("../data/music-local.json", import.meta.url),
);

const music = JSON.parse(readFileSync(musicFile, "utf8"));

if (!Array.isArray(music)) {
  throw new TypeError("Expected music-local.json to contain an array.");
}

const filenamesInJson = new Set(
  music
    .filter((track) => track && typeof track.file === "string")
    .map((track) => track.file.split(/[\\/]/).pop()),
);
const mp3Filenames = readdirSync(mp3Directory).filter((filename) =>
  filename.toLowerCase().endsWith(".mp3"),
);
const missingFilenames = mp3Filenames.filter(
  (filename) => !filenamesInJson.has(filename),
);

console.log(`MP3 files missing from music-local.json (${missingFilenames.length}):`);

if (missingFilenames.length === 0) {
  console.log("None found.");
} else {
  for (const filename of missingFilenames) {
    console.log(`- ${filename}`);
  }
}