export type PrintCategory = "poster" | "serigraph" | "limited";

export interface PrintItem {
  slug: string;
  title: string;
  artist: string;
  category: PrintCategory;
  technique: string;
  paper: string;
  price: number;
  sizes: string;
  description: string;
  image: string;
}

export const prints: PrintItem[] = [
  {
    slug: "guernica-sketch",
    title: "Guernica Sketch",
    artist: "Pablo Picasso",
    category: "poster",
    technique: "offset",
    paper: "matte 200g",
    price: 18.5,
    sizes: "70 x 50 cm",
    description: "A clean reproduction of the original Guernica study in neutral tones.",
    image: "/images/placeholder.svg"
  },
  {
    slug: "garden-of-earthly-delights",
    title: "Garden of Earthly Delights",
    artist: "Hieronymus Bosch",
    category: "serigraph",
    technique: "giclee",
    paper: "cotton rag 240g",
    price: 42,
    sizes: "80 x 60 cm",
    description: "High detail print of the central panel with vibrant color balance.",
    image: "/images/placeholder.svg"
  },
  {
    slug: "maja-desnuda",
    title: "La Maja Desnuda",
    artist: "Francisco de Goya",
    category: "limited",
    technique: "photolithography",
    paper: "linen 220g",
    price: 55,
    sizes: "65 x 45 cm",
    description: "Numbered series with subtle texture to match the original canvas feel.",
    image: "/images/placeholder.svg"
  }
];

export function getPrintBySlug(slug: string): PrintItem | undefined {
  return prints.find((item) => item.slug === slug);
}
