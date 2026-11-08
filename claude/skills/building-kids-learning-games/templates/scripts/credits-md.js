// Regenerates CREDITS.md from js/data/credits.js. Run: node scripts/credits-md.js
import { writeFileSync } from "node:fs";
import { CREDITS } from "../js/data/credits.js";
import { getAnimal } from "../js/data/animals.js";

const rows = CREDITS.map((c) => {
  const a = getAnimal(c.animal);
  return `| ${a.emoji} ${a.name.en} | \`${c.file}\` | [${c.title}](${c.source}) | ${c.author} | [${c.license}](${c.licenseUrl}) |`;
});

const md = `# Sound credits

All animal sounds in Bruno's Zoo are recordings shared under open licenses.
Each clip was trimmed (to a few seconds), converted to mono MP3, and volume-normalized.
Clips under CC BY-SA are shared under the same license.

| Animal | File | Original | Author | License |
|---|---|---|---|---|
${rows.join("\n")}

# Artwork credits

- Animal and zone pictures, and the app icon's lion: [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji)
  (3D style), MIT License — see \`art/LICENSE-fluentui-emoji.txt\`. Converted to 256×256 WebP.
- Button icons: [Phosphor Icons](https://phosphoricons.com/) 2.1.1, MIT License — see
  \`art/LICENSE-phosphor-icons.txt\`.
`;

writeFileSync("CREDITS.md", md);
console.log(`Wrote CREDITS.md (${CREDITS.length} sounds)`);
