import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const musicFile = fileURLToPath(
  new URL("../data/music-local.json", import.meta.url),
);
const music = JSON.parse(readFileSync(musicFile, "utf8"));

if (!Array.isArray(music)) {
  throw new TypeError("Expected music-local.json to contain an array.");
}

const oddCharacters = ["-", "_", "?", "$", "(", ")", "[", "]", "&", " "];
const matchingItems = music.filter(
  (item) =>
    item &&
    typeof item.url === "string" &&
    (item.url.includes("1.mp3") ||
      oddCharacters.some((character) => item.url.includes(character))),
);

if (matchingItems.length === 0) {
  console.log("No files with the specified characters found.");
} else {
  console.log(
    `Found ${matchingItems.length} file(s) with the specified characters:`,
  );

  for (const item of matchingItems) {
    console.log(
      `_id: ${JSON.stringify(item._id)} | file: ${JSON.stringify(item.url)}`,
    );
  }
}
