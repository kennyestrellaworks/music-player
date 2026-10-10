import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const artistsFile = fileURLToPath(
  new URL("../data/artists.json", import.meta.url),
);
const artists = JSON.parse(readFileSync(artistsFile, "utf8"));

if (!Array.isArray(artists)) {
  throw new TypeError("Expected artists.json to contain an array.");
}

const artistsById = new Map();

for (const artist of artists) {
  if (!artist || artist._id === undefined || artist._id === null) {
    continue;
  }

  const matchingArtists = artistsById.get(artist._id) ?? [];
  matchingArtists.push(artist);
  artistsById.set(artist._id, matchingArtists);
}

const duplicateGroups = [...artistsById.entries()].filter(
  ([, matchingArtists]) => matchingArtists.length > 1,
);

if (duplicateGroups.length === 0) {
  console.log("No duplicate artist _id values found.");
} else {
  console.log(`Found ${duplicateGroups.length} duplicate artist _id value(s):`);

  for (const [id, matchingArtists] of duplicateGroups) {
    console.log(`\n_id: ${JSON.stringify(id)} (${matchingArtists.length} artists)`);
    for (const artist of matchingArtists) {
      console.log(`${JSON.stringify(artist, null, 2)},`);
    }
  }
}
