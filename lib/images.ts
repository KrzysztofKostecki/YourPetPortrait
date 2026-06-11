function unsplash(id: string, width: number) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=85`;
}

export const showcaseImages = {
  // Hero before/after: real customer photo → hand-painted portrait
  heroPhoto: "/images/hero/photo.png",
  heroPainting: "/images/hero/painting.png",
  // Smaller companion frame hung beside the hero
  heroCompanion: unsplash("1573865526739-10659fec78a5", 700),
  gallery: [
    {
      key: "warmVintage",
      src: unsplash("1530281700549-e82e7bf110d6", 800),
    },
    {
      key: "classicOil",
      src: unsplash("1568572933382-74d440642117", 800),
    },
    {
      key: "modernRealistic",
      src: unsplash("1583511655857-d19b40a7a54e", 800),
    },
    {
      key: "lightImpressionist",
      src: unsplash("1514888286974-6c03e2ca1dba", 800),
    },
  ],
  testimonials: [
    unsplash("1552053831-71594a27632d", 200),
    unsplash("1517849845537-4d257902454a", 200),
    unsplash("1518791841217-8f162f1e1131", 200),
  ],
  cta: unsplash("1543466835-00a7907e9de1", 900),
  signIn: unsplash("1548199973-03cce0bbc87b", 1400),
} as const;
