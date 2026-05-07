import { toHTML } from "@portabletext/to-html";

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET;

function sanityImageUrl(ref: string): string {
  // Converts "image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg"
  // → "https://cdn.sanity.io/images/PROJECT/DATASET/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000.jpg"
  const withoutPrefix = ref.replace(/^image-/, "");
  const withExt = withoutPrefix.replace(/-(\w+)$/, ".$1");
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${withExt}`;
}

export function portableTextToHtml(blocks: unknown[]): string {
  return toHTML(blocks, {
    components: {
      types: {
        image: ({ value }: { value: { asset?: { _ref?: string }; alt?: string } }) => {
          if (!value.asset?._ref) return "";
          const src = sanityImageUrl(value.asset._ref);
          const alt = value.alt ?? "";
          return `<img src="${src}" alt="${alt}" loading="lazy" />`;
        },
      },
    },
  });
}
