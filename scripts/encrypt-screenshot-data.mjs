import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { randomBytes, pbkdf2Sync, createCipheriv } from "node:crypto";
const [input, output] = process.argv.slice(2);
if (!input || !output || (!process.argv.includes("--plain") && !process.env.SCREENSHOT_MEMORY_PASSWORD)) throw new Error("Pass input, output, and SCREENSHOT_MEMORY_PASSWORD.");
const raw = JSON.parse(await readFile(input, "utf8"));
const source = raw.map((item) => ({
  title: (item.text.split("\n").find((line) => line.replace(/[^\p{L}\p{N}]/gu, "").length > 8) ?? item.text).slice(0, 100),
  text: item.text, date: new Date(item.takenAt).toLocaleDateString("ja-JP").replaceAll("/", "."), tags: item.tags, imageUrl: `images/${item.id}.jpeg`,
}));
if (process.argv.includes("--plain")) {
  if (process.argv.includes("--copy-images")) {
    const imageDirectory = join(dirname(output), "images");
    await mkdir(imageDirectory, { recursive: true });
    await Promise.all(raw.map((item) => copyFile(item.imagePath, join(imageDirectory, `${item.id}.jpeg`)).catch(() => undefined)));
  }
  await writeFile(output, JSON.stringify(source));
  process.exit(0);
}
const salt = randomBytes(16), iv = randomBytes(16), key = pbkdf2Sync(process.env.SCREENSHOT_MEMORY_PASSWORD, salt, 250000, 32, "sha256");
const cipher = createCipheriv("aes-256-cbc", key, iv); const data = Buffer.concat([cipher.update(JSON.stringify(source), "utf8"), cipher.final()]);
await writeFile(output, JSON.stringify({ salt: salt.toString("base64"), iv: iv.toString("base64"), data: data.toString("base64") }));
