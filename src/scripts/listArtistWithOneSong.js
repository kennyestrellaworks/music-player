import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const artistsFile = fileURLToPath(
  //   new URL("../../src/data/artists.json", import.meta.url),
  new URL("../data/artists.json", import.meta.url),
);
const artists = JSON.parse(readFileSync(artistsFile, "utf8"));

if (!Array.isArray(artists)) {
  throw new TypeError("Expected artists.json to contain an array of artists.");
}

const artistsWithOneSong = artists.filter(
  (artist) => Array.isArray(artist.songs) && artist.songs.length === 1,
);

console.log(`Artists with exactly one song (${artistsWithOneSong.length}):`);

if (artistsWithOneSong.length === 0) {
  console.log("None found.");
} else {
  for (const artist of artistsWithOneSong) {
    console.log(`- ${artist.name} (${artist._id})`);
  }
}
