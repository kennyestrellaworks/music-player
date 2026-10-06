import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const musicFile = fileURLToPath(
  new URL("../data/music-local.json", import.meta.url),
);
const music = JSON.parse(readFileSync(musicFile, "utf8"));

if (!Array.isArray(music)) {
  throw new TypeError("Expected music-local.json to contain an array.");
}

const itemsById = new Map();

for (const item of music) {
  if (!item || item._id === undefined || item._id === null) {
    continue;
  }

  const items = itemsById.get(item._id) ?? [];
  items.push(item);
  itemsById.set(item._id, items);
}

const duplicateGroups = [...itemsById.entries()].filter(
  ([, items]) => items.length > 1,
);

if (duplicateGroups.length === 0) {
  console.log("No duplicate _id values found.");
} else {
  console.log(`Found ${duplicateGroups.length} duplicate _id value(s):`);

  for (const [id, items] of duplicateGroups) {
    console.log(`\n_id: ${JSON.stringify(id)} (${items.length} items)`);
    for (const item of items) {
      console.log(`${JSON.stringify(item, null, 2)},`);
    }
  }
}