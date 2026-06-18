import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import satori from "satori";
import sharp from "sharp";

import { projects } from "../src/data/projects.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicOgDir = join(root, "public", "og");

const WIDTH = 1200;
const HEIGHT = 630;

type OgTheme = {
  background: string;
  backgroundAccent: string;
  text: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  border: string;
};

const homeTheme: OgTheme = {
  background: "#0c1119",
  backgroundAccent: "#1d5fd9",
  text: "#ecf1f9",
  textMuted: "#96a1b4",
  accent: "#95b7ff",
  accentSoft: "rgba(149, 183, 255, 0.14)",
  border: "rgba(236, 241, 249, 0.12)",
};

const cvTheme: OgTheme = {
  background: "#12100e",
  backgroundAccent: "#c8753d",
  text: "#f3ebe1",
  textMuted: "#bcafa0",
  accent: "#c8753d",
  accentSoft: "rgba(200, 117, 61, 0.16)",
  border: "rgba(243, 235, 225, 0.12)",
};

async function loadFonts() {
  const fontRoot = join(root, "node_modules", "@fontsource");
  const [frauncesRegular, frauncesBold, jakartaRegular, jakartaSemibold] =
    await Promise.all([
      readFile(join(fontRoot, "fraunces/files/fraunces-latin-400-normal.woff")),
      readFile(join(fontRoot, "fraunces/files/fraunces-latin-700-normal.woff")),
      readFile(
        join(fontRoot, "plus-jakarta-sans/files/plus-jakarta-sans-latin-400-normal.woff"),
      ),
      readFile(
        join(fontRoot, "plus-jakarta-sans/files/plus-jakarta-sans-latin-600-normal.woff"),
      ),
    ]);

  return [
    { name: "Fraunces", data: frauncesRegular, weight: 400, style: "normal" as const },
    { name: "Fraunces", data: frauncesBold, weight: 700, style: "normal" as const },
    { name: "Plus Jakarta Sans", data: jakartaRegular, weight: 400, style: "normal" as const },
    { name: "Plus Jakarta Sans", data: jakartaSemibold, weight: 600, style: "normal" as const },
  ];
}

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

function buildMarkup(input: {
  theme: OgTheme;
  kicker: string;
  title: string;
  subtitle: string;
  footer?: string;
}) {
  const { theme, kicker, title, subtitle, footer = "miguelgarglez.github.io" } = input;

  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: `radial-gradient(circle at 12% 18%, ${theme.accentSoft}, transparent 34%), radial-gradient(circle at 88% 12%, rgba(255,255,255,0.04), transparent 28%), linear-gradient(145deg, ${theme.background} 0%, #080b10 100%)`,
        color: theme.text,
        fontFamily: "Plus Jakarta Sans",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "18px",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          width: "54px",
                          height: "54px",
                          borderRadius: "14px",
                          background: theme.accentSoft,
                          border: `1px solid ${theme.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: theme.accent,
                          fontFamily: "Fraunces",
                          fontSize: "22px",
                          fontWeight: 700,
                        },
                        children: "MG",
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: "18px",
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: theme.accent,
                          fontFamily: "Plus Jakarta Sans",
                          fontWeight: 600,
                        },
                        children: kicker,
                      },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    width: "120px",
                    height: "1px",
                    background: theme.border,
                  },
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: "28px",
              maxWidth: "920px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontFamily: "Fraunces",
                    fontSize: title.length > 42 ? "68px" : "78px",
                    lineHeight: 0.95,
                    letterSpacing: "-0.04em",
                    fontWeight: 400,
                    color: theme.text,
                  },
                  children: title,
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "30px",
                    lineHeight: 1.35,
                    color: theme.textMuted,
                    maxWidth: "860px",
                  },
                  children: subtitle,
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: `1px solid ${theme.border}`,
              paddingTop: "28px",
              color: theme.textMuted,
              fontSize: "22px",
            },
            children: [
              { type: "div", props: { children: footer } },
              {
                type: "div",
                props: {
                  style: {
                    width: "10px",
                    height: "10px",
                    borderRadius: "999px",
                    background: theme.backgroundAccent,
                  },
                },
              },
            ],
          },
        },
      ],
    },
  };
}

async function renderOgImage(
  fonts: Awaited<ReturnType<typeof loadFonts>>,
  markup: ReturnType<typeof buildMarkup>,
  outputPath: string,
) {
  const svg = await satori(markup, {
    width: WIDTH,
    height: HEIGHT,
    fonts,
  });

  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  await writeFile(outputPath, png);
}

async function readPosts() {
  const postsDir = join(root, "src", "content", "posts");
  const { readdir } = await import("node:fs/promises");
  const files = (await readdir(postsDir)).filter((file) => file.endsWith(".md"));

  const posts = [];

  for (const file of files) {
    const raw = await readFile(join(postsDir, file), "utf8");
    const match = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!match) continue;

    const frontmatter = match[1];
    const title = frontmatter.match(/^title:\s*"(.*)"/m)?.[1];
    const description = frontmatter.match(/^description:\s*"(.*)"/m)?.[1];
    const draft = frontmatter.match(/^draft:\s*(true|false)/m)?.[1] === "true";

    if (!title || !description || draft) continue;

    posts.push({
      slug: file.replace(/\.md$/, ""),
      title,
      description,
    });
  }

  return posts;
}

async function main() {
  const fonts = await loadFonts();
  await mkdir(publicOgDir, { recursive: true });
  await mkdir(join(publicOgDir, "posts"), { recursive: true });
  await mkdir(join(publicOgDir, "projects"), { recursive: true });

  const images = [
    {
      output: join(publicOgDir, "default.png"),
      markup: buildMarkup({
        theme: homeTheme,
        kicker: "Directory",
        title: "Miguel García",
        subtitle:
          "Software engineer in Madrid. Projects, notes, readings, and references on building with clarity.",
      }),
    },
    {
      output: join(publicOgDir, "cv-chat.png"),
      markup: buildMarkup({
        theme: cvTheme,
        kicker: "CV Chat",
        title: "Miguel García",
        subtitle:
          "Frontend platform engineer building design systems and practical AI workflows.",
        footer: "miguelgarglez.github.io/cv-chat",
      }),
    },
  ];

  const posts = await readPosts();
  for (const post of posts) {
    images.push({
      output: join(publicOgDir, "posts", `${post.slug}.png`),
      markup: buildMarkup({
        theme: homeTheme,
        kicker: "Post",
        title: truncate(post.title, 72),
        subtitle: truncate(post.description, 140),
      }),
    });
  }

  for (const project of projects) {
    images.push({
      output: join(publicOgDir, "projects", `${project.slug}.png`),
      markup: buildMarkup({
        theme: homeTheme,
        kicker: "Project",
        title: truncate(project.displayName, 72),
        subtitle: truncate(project.summary, 140),
      }),
    });
  }

  await Promise.all(
    images.map(({ markup, output }) => renderOgImage(fonts, markup, output)),
  );

  const defaultOg = join(publicOgDir, "default.png");
  await sharp(defaultOg).resize(180, 180).png().toFile(join(root, "public", "apple-touch-icon.png"));

  console.log(`Generated ${images.length} OG images in public/og/`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
