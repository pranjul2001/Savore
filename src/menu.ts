export type MenuCategory = {
  name: string;
  description: string;
};

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  note?: string;
  options?: string[];
};

export const menuCategories: MenuCategory[] = [
  { name: "Salads", description: "Bright flavours and feel-good bowls." },
  { name: "Smoothie Bowls", description: "A colourful start to your day." },
  { name: "Thali", description: "Comfort plates, ghar-jaisa." },
  { name: "Chinese Favourites", description: "Wok, toss and twirl." },
  { name: "Pasta", description: "Comfort food, with a thoughtful twist." },
  { name: "Snacks", description: "A little something between meals." },
  { name: "Beverages", description: "Coolers, coffee and tea." },
  { name: "South Indian", description: "A familiar favourite, freshly made." },
  { name: "Quick Bite", description: "A quick, cosy classic." },
  { name: "Protein Meals", description: "Protein-powered goodness." },
  { name: "More to Love", description: "One more lovely thing." },
];

export const menuItems: MenuItem[] = [
  { id: "italian-pasta-salad", name: "Italian Pasta Salad", price: 349, category: "Salads" },
  { id: "mexican-millet-salad", name: "Mexican Millet Salad", price: 349, category: "Salads" },
  { id: "hummus-avocado-salad", name: "Hummus Avocado Salad", price: 349, category: "Salads" },
  { id: "som-tam-salad", name: "Som Tam Salad", price: 349, category: "Salads" },
  { id: "spicy-peanut-noodle-salad", name: "Spicy Peanut Noodle Salad", price: 349, category: "Salads" },
  { id: "watermelon-feta-salad", name: "Watermelon Feta Salad", price: 299, category: "Salads" },
  { id: "chickpea-salad", name: "Chickpea Salad", price: 299, category: "Salads" },
  { id: "south-indian-chickpea-salad", name: "South Indian Chickpea Salad", price: 299, category: "Salads" },
  { id: "caprese-salad", name: "Caprese Salad", price: 299, category: "Salads" },
  { id: "sweet-potato-salad", name: "Sweet Potato Salad", price: 299, category: "Salads" },
  { id: "desi-flavour-salad", name: "Desi Flavour Salad", price: 299, category: "Salads" },
  { id: "peanut-chocolate-smoothie-bowl", name: "Peanut Chocolate Smoothie Bowl", price: 349, category: "Smoothie Bowls" },
  { id: "mixed-berry-smoothie-bowl", name: "Mixed Berry Smoothie Bowl", price: 349, category: "Smoothie Bowls" },
  { id: "ghar-jaisi-thali", name: "Ghar-Jaisi Thali", price: 199, category: "Thali" },
  { id: "premium-thali", name: "Premium Thali", price: 279, category: "Thali" },
  { id: "veg-manchurian-gravy", name: "Veg Manchurian (Gravy)", price: 249, category: "Chinese Favourites" },
  { id: "veg-manchurian-dry", name: "Veg Manchurian (Dry)", price: 249, category: "Chinese Favourites" },
  { id: "chilli-paneer-gravy", name: "Chilli Paneer (Gravy)", price: 279, category: "Chinese Favourites" },
  { id: "chilli-paneer-dry", name: "Chilli Paneer (Dry)", price: 279, category: "Chinese Favourites" },
  { id: "sweet-sour-paneer", name: "Sweet & Sour Paneer", price: 299, category: "Chinese Favourites" },
  { id: "honey-chilli-potato", name: "Honey Chilli Potato", price: 199, category: "Chinese Favourites" },
  { id: "hakka-noodles", name: "Hakka Noodles", price: 249, category: "Chinese Favourites" },
  { id: "chilli-garlic-noodles", name: "Chilli Garlic Noodles", price: 249, category: "Chinese Favourites" },
  { id: "schezwan-fried-rice", name: "Schezwan Fried Rice", price: 249, category: "Chinese Favourites" },
  { id: "fried-rice", name: "Fried Rice", price: 199, category: "Chinese Favourites" },
  { id: "chowmein", name: "Chowmein", price: 299, category: "Chinese Favourites" },
  { id: "marinara-pasta", name: "Marinara Pasta (Red Sauce)", price: 299, category: "Pasta" },
  { id: "arrabbiata-pasta", name: "Arrabbiata Pasta", price: 299, category: "Pasta" },
  { id: "pink-sauce-pasta", name: "Pink Sauce Pasta", price: 299, category: "Pasta" },
  { id: "alfredo-pasta", name: "Alfredo Pasta (White Sauce)", price: 299, category: "Pasta" },
  { id: "veg-aloo-tikki-burger", name: "Veg Aloo Tikki Burger", price: 149, category: "Snacks" },
  { id: "veg-sandwich", name: "Veg Sandwich", price: 149, category: "Snacks" },
  { id: "paneer-club-sandwich", name: "Paneer Club Sandwich", price: 249, category: "Snacks" },
  { id: "aloo-masala-sandwich", name: "Aloo Masala Sandwich", price: 149, category: "Snacks" },
  { id: "cheese-corn-sandwich", name: "Cheese & Corn Sandwich", price: 199, category: "Snacks" },
  { id: "classic-cold-coffee", name: "Classic Cold Coffee", price: 179, category: "Beverages" },
  { id: "apple-passion-fruit-cooler", name: "Apple Passion Fruit Cooler", price: 249, category: "Beverages" },
  { id: "kokum-cooler", name: "Kokum Cooler", price: 199, category: "Beverages" },
  { id: "thai-tea", name: "Thai Tea", price: 199, category: "Beverages" },
  { id: "filter-coffee", name: "Filter Coffee", price: 149, category: "Beverages" },
  { id: "cappuccino", name: "Cappuccino", price: 149, category: "Beverages" },
  { id: "paneer-uttapam", name: "Paneer Uttapam", price: 279, category: "South Indian" },
  { id: "onion-uttapam", name: "Onion Uttapam", price: 199, category: "South Indian" },
  { id: "otc-uttapam", name: "OTC Uttapam", price: 249, category: "South Indian" },
  { id: "veg-maggi", name: "Veg Maggi", price: 149, category: "Quick Bite" },
  {
    id: "high-protein-burger",
    name: "High Protein Burger",
    price: 299,
    category: "Protein Meals",
    note: "Choose one patty: Rajma kidney-bean, Moong dal, or Chickpea-paneer chilli.",
    options: ["Rajma kidney-bean patty", "Moong dal patty", "Chickpea-paneer chilli patty"],
  },
  { id: "high-protein-idli", name: "High Protein Idli", price: 249, category: "Protein Meals" },
  { id: "moong-dal-palak-paneer-toast", name: "Moong Dal Palak Paneer Toast", price: 299, category: "Protein Meals" },
  { id: "chickpea-guacamole-sandwich", name: "Chickpea + Guacamole Sandwich", price: 299, category: "Protein Meals" },
  { id: "chana-kebab", name: "Chana Kebab", price: 349, category: "Protein Meals" },
  { id: "rajma-rice-feta-salad", name: "Rajma Rice with Feta Cheese Salad", price: 299, category: "Protein Meals" },
  { id: "black-chana-rice-feta-salad", name: "Black Chana Rice with Feta Cheese Salad", price: 299, category: "Protein Meals" },
  { id: "chickpea-rice-feta-salad", name: "Chickpea Rice with Feta Cheese Salad", price: 299, category: "Protein Meals" },
  { id: "paneer-chilli-rice-feta-salad", name: "Paneer Chilli Rice with Feta Cheese Salad", price: 299, category: "Protein Meals" },
  { id: "thecha-paneer-rice-feta-salad", name: "Thecha Paneer Rice with Feta Cheese Salad", price: 299, category: "Protein Meals" },
  { id: "herbed-rice-feta-salad", name: "Herbed Rice with Feta Cheese Salad", price: 299, category: "Protein Meals" },
  { id: "chocolate-mousse", name: "Chocolate Mousse", price: 349, category: "More to Love" },
  { id: "coconut-bread-pudding", name: "Coconut Bread Pudding", price: 349, category: "More to Love" },
  { id: "guacamole-toast", name: "Guacamole Toast", price: 349, category: "More to Love" },
];