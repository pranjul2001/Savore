import { asset } from "./utils";

/**
 * PLACEHOLDER ARTWORK — illustrated flat-lays generated for the redesign.
 * Replace each `src` with approved product photography (e.g. "photos/salads.jpg" in /public)
 * and update `alt`; nothing else in the app needs to change.
 */
export type Art = { src: string; alt: string };

const art = (file: string, alt: string): Art => ({ src: asset(`art/${file}`), alt });

export const heroArt = art("hero-bowl.svg", "Illustration of a fresh salad bowl with greens, cherry tomatoes, chickpeas, avocado and feta");
export const tablescapeArt = art("tablescape.svg", "Illustration of a table set with a thali, smoothie bowl, pasta and coffee");

export const categoryArt: Record<string, Art> = {
  Salads: art("salad.svg", "Illustration of a leafy salad bowl"),
  "Smoothie Bowls": art("smoothie-bowl.svg", "Illustration of a berry smoothie bowl topped with banana, blueberries and granola"),
  Thali: art("thali.svg", "Illustration of a steel thali with dal, sabzi, paneer, curd, rice and rotis"),
  "Chinese Favourites": art("noodles.svg", "Illustration of a bowl of hakka noodles with chopsticks"),
  Pasta: art("pasta.svg", "Illustration of penne in red sauce with basil"),
  Snacks: art("sandwich.svg", "Illustration of a grilled sandwich on a wooden board"),
  Beverages: art("drinks.svg", "Illustration of a cappuccino and a fruit cooler"),
  "South Indian": art("uttapam.svg", "Illustration of an uttapam on a banana leaf with chutneys and sambar"),
  "Quick Bite": art("maggi.svg", "Illustration of a bowl of masala noodles"),
  "Protein Meals": art("protein-bowl.svg", "Illustration of a rajma rice bowl with feta"),
  "More to Love": art("dessert.svg", "Illustration of chocolate mousse and coconut bread pudding"),
};

export const artFor = (category: string) => categoryArt[category] ?? heroArt;
