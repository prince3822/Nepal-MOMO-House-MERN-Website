export const defaultShopSettings = {
  name: "Nepal MOMO House",
  tagline: "Fresh. Hot. Delicious.",
  logo: "/assets/logo.jpg",
  city: "Raxaul",
  state: "Bihar",
  country: "India",
  fullAddress: "Laxmipur, Karbola Rd, near The Chandrasheel School, Raxaul, Bihar 845305",
  phone: "+91 9523349571",
  whatsapp: "919523349571",
  upiVpa: "9523349571@ybl",
  razorpayKeyId: "rzp_test_NepalMomoHouse",
  openingHours: "Wed - Mon: 1:00 PM - 10:00 PM (Closed on Tuesdays)",
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Nepal+MOMO+House+Laxmipur+Karbola+Rd+near+The+Chandrasheel+School+Raxaul+Bihar+845305",
  announcement: "🥟 Authentic Nepalese Momos & Fast Food in Raxaul! (Closed on Tuesday)",
  currency: "₹",
  isAcceptingOrders: true,
  facebookUrl: "https://facebook.com/NepalMOMOHouseRaxaul",
  instagramUrl: "https://instagram.com/nepal_momo_house",
  adminMobile: "9523349571",
  adminPassword: "admin@momo123"
};

export const defaultCategories = [
  { id: "all", name: "All Items" },
  { id: "steamed", name: "Steam Momo" },
  { id: "fried", name: "Fry Momo" },
  { id: "chilly-momo", name: "Chilly Momo" },
  { id: "kurkure", name: "Kurkure Momo" },
  { id: "chowmein", name: "Chowmein" },
  { id: "bbq", name: "BBQ & Sekuwa" },
  { id: "taas", name: "Nepalese Taas" },
  { id: "thukpa", name: "Thukpa" },
  { id: "chilly", name: "Chilly Dishes" },
  { id: "special", name: "Nepali Special Snacks" }
];

export const defaultMenuItems = [
  // 1. Steam Momo
  {
    id: "steam-1",
    name: "Veg Steam",
    category: "steamed",
    price: 90,
    isVeg: true,
    spicyLevel: 1,
    isBestseller: true,
    isAvailable: true,
    description: "Authentic Nepalese steamed dumplings filled with finely chopped fresh vegetables and aromatic spices.",
    image: "/assets/momo_hero.jpg"
  },
  {
    id: "steam-2",
    name: "Paneer Steam",
    category: "steamed",
    price: 110,
    isVeg: true,
    spicyLevel: 1,
    isBestseller: false,
    isAvailable: true,
    description: "Soft cottage cheese spiced with ginger, herbs, and Himalayan seasonings in delicate steamed wrappers.",
    image: "/assets/momo_hero.jpg"
  },
  {
    id: "steam-3",
    name: "Chicken Steam",
    category: "steamed",
    price: 110,
    isVeg: false,
    spicyLevel: 2,
    isBestseller: true,
    isAvailable: true,
    description: "Juicy minced chicken momos steamed to perfection. Served with fiery red tomato chutney.",
    image: "/assets/momo_hero.jpg"
  },
  {
    id: "steam-4",
    name: "Mutton Steam",
    category: "steamed",
    price: 135,
    isVeg: false,
    spicyLevel: 2,
    isBestseller: true,
    isAvailable: true,
    description: "Rich tender mutton minced dumplings infused with authentic Nepalese herbs and spices.",
    image: "/assets/momo_hero.jpg"
  },

  // 2. Fry Momo
  {
    id: "fry-1",
    name: "Veg Fry",
    category: "fried",
    price: 90,
    isVeg: true,
    spicyLevel: 1,
    isBestseller: false,
    isAvailable: true,
    description: "Crispy golden fried vegetable momos seasoned with house masala.",
    image: "/assets/kurkure_momo.jpg"
  },
  {
    id: "fry-2",
    name: "Paneer Fry",
    category: "fried",
    price: 110,
    isVeg: true,
    spicyLevel: 1,
    isBestseller: false,
    isAvailable: true,
    description: "Deep fried paneer momos with a light crunchy crust.",
    image: "/assets/kurkure_momo.jpg"
  },
  {
    id: "fry-3",
    name: "Chicken Fry",
    category: "fried",
    price: 110,
    isVeg: false,
    spicyLevel: 2,
    isBestseller: true,
    isAvailable: true,
    description: "Succulent chicken dumplings deep fried to golden crispness.",
    image: "/assets/kurkure_momo.jpg"
  },
  {
    id: "fry-4",
    name: "Mutton Fry",
    category: "fried",
    price: 135,
    isVeg: false,
    spicyLevel: 2,
    isBestseller: true,
    isAvailable: true,
    description: "Crispy deep fried spiced mutton momos served with garlic chutney.",
    image: "/assets/kurkure_momo.jpg"
  },

  // 3. Chilly Momo
  {
    id: "chilly-momo-1",
    name: "Veg Chilly Momo",
    category: "chilly-momo",
    price: 165,
    isVeg: true,
    spicyLevel: 3,
    isBestseller: false,
    isAvailable: true,
    description: "Fried veg momos wok-tossed in dark soy sauce, green chillies, garlic, and bell peppers.",
    image: "/assets/jhol_momo.jpg"
  },
  {
    id: "chilly-momo-2",
    name: "Paneer Chilly Momo",
    category: "chilly-momo",
    price: 180,
    isVeg: true,
    spicyLevel: 3,
    isBestseller: false,
    isAvailable: true,
    description: "Crispy paneer momos tossed in spicy chilli gravy with capsicum and onions.",
    image: "/assets/jhol_momo.jpg"
  },
  {
    id: "chilly-momo-3",
    name: "Chicken Chilly Momo",
    category: "chilly-momo",
    price: 180,
    isVeg: false,
    spicyLevel: 3,
    isBestseller: true,
    isAvailable: true,
    description: "Popular Indo-Chinese style chicken momos tossed in fiery garlic chilli sauce.",
    image: "/assets/jhol_momo.jpg"
  },
  {
    id: "chilly-momo-4",
    name: "Mutton Chilly Momo",
    category: "chilly-momo",
    price: 200,
    isVeg: false,
    spicyLevel: 3,
    isBestseller: true,
    isAvailable: true,
    description: "Rich mutton momos tossed in extra spicy red chilli sauce with fresh bell peppers.",
    image: "/assets/jhol_momo.jpg"
  },

  // 4. Kurkure Momo
  {
    id: "kurkure-1",
    name: "Veg Kurkure",
    category: "kurkure",
    price: 145,
    isVeg: true,
    spicyLevel: 2,
    isBestseller: true,
    isAvailable: true,
    description: "Extra crunchy cornflakes coated fried veg momos served with mayonnaise dip.",
    image: "/assets/kurkure_momo.jpg"
  },
  {
    id: "kurkure-2",
    name: "Paneer Kurkure",
    category: "kurkure",
    price: 155,
    isVeg: true,
    spicyLevel: 2,
    isBestseller: false,
    isAvailable: true,
    description: "Double coated crispy paneer momos fried to golden perfection.",
    image: "/assets/kurkure_momo.jpg"
  },
  {
    id: "kurkure-3",
    name: "Chicken Kurkure",
    category: "kurkure",
    price: 155,
    isVeg: false,
    spicyLevel: 2,
    isBestseller: true,
    isAvailable: true,
    description: "Famous Nepal MOMO House special! Ultra crunchy chicken momos.",
    image: "/assets/kurkure_momo.jpg"
  },
  {
    id: "kurkure-4",
    name: "Mutton Kurkure",
    category: "kurkure",
    price: 180,
    isVeg: false,
    spicyLevel: 2,
    isBestseller: true,
    isAvailable: true,
    description: "Crispy coated mutton momos served with house dips.",
    image: "/assets/kurkure_momo.jpg"
  },

  // 5. Chowmein
  {
    id: "chowmein-1",
    name: "Veg Chowmein",
    category: "chowmein",
    price: 100,
    isVeg: true,
    spicyLevel: 2,
    isBestseller: false,
    isAvailable: true,
    description: "Street style wok tossed Hakka noodles with fresh cabbage, carrots, capsicum, and onions.",
    image: "/assets/chowmein_fastfood.jpg"
  },
  {
    id: "chowmein-2",
    name: "Egg Chowmein",
    category: "chowmein",
    price: 135,
    isVeg: false,
    spicyLevel: 2,
    isBestseller: false,
    isAvailable: true,
    description: "High flame fried noodles loaded with scrambled eggs and stir fried veggies.",
    image: "/assets/chowmein_fastfood.jpg"
  },
  {
    id: "chowmein-3",
    name: "Chicken Chowmein",
    category: "chowmein",
    price: 170,
    isVeg: false,
    spicyLevel: 2,
    isBestseller: true,
    isAvailable: true,
    description: "Authentic spicy chicken Hakka chowmein loaded with shredded chicken and veggies.",
    image: "/assets/chowmein_fastfood.jpg"
  },

  // 6. BBQ
  {
    id: "bbq-1",
    name: "Paneer Sekuwa",
    category: "bbq",
    price: 100,
    isVeg: true,
    spicyLevel: 2,
    isBestseller: false,
    isAvailable: true,
    description: "Traditional Nepalese marinated paneer cubes grilled over charcoal embers.",
    image: "/assets/chowmein_fastfood.jpg"
  },
  {
    id: "bbq-2",
    name: "Chicken BBQ",
    category: "bbq",
    price: 100,
    isVeg: false,
    spicyLevel: 2,
    isBestseller: true,
    isAvailable: true,
    description: "Smoky charcoal grilled chicken skewers marinated in Nepalese spices.",
    image: "/assets/chowmein_fastfood.jpg"
  },
  {
    id: "bbq-3",
    name: "Mutton BBQ",
    category: "bbq",
    price: 165,
    isVeg: false,
    spicyLevel: 2,
    isBestseller: true,
    isAvailable: true,
    description: "Tender juicy mutton pieces grilled with traditional Himalayan marinade.",
    image: "/assets/chowmein_fastfood.jpg"
  },

  // 7. Taas
  {
    id: "taas-1",
    name: "Chicken Taas",
    category: "taas",
    price: 480,
    isVeg: false,
    spicyLevel: 3,
    isBestseller: true,
    isAvailable: true,
    description: "Famous Nepalese Chitwan style pan-fried spicy chicken served per kg portion.",
    image: "/assets/chowmein_fastfood.jpg"
  },
  {
    id: "taas-2",
    name: "Mutton Taas",
    category: "taas",
    price: 1000,
    isVeg: false,
    spicyLevel: 3,
    isBestseller: true,
    isAvailable: true,
    description: "Authentic Himalayan marinated mutton taas cooked slowly on heavy tava (1 kg).",
    image: "/assets/chowmein_fastfood.jpg"
  },

  // 8. Thukpa
  {
    id: "thukpa-1",
    name: "Veg Thukpa",
    category: "thukpa",
    price: 110,
    isVeg: true,
    spicyLevel: 1,
    isBestseller: false,
    isAvailable: true,
    description: "Warm Tibetan vegetable noodle soup with aromatic broth and fresh greens.",
    image: "/assets/jhol_momo.jpg"
  },
  {
    id: "thukpa-2",
    name: "Egg Thukpa",
    category: "thukpa",
    price: 140,
    isVeg: false,
    spicyLevel: 2,
    isBestseller: false,
    isAvailable: true,
    description: "Comforting noodle soup topped with boiled and scrambled egg slices.",
    image: "/assets/jhol_momo.jpg"
  },
  {
    id: "thukpa-3",
    name: "Chicken Thukpa",
    category: "thukpa",
    price: 170,
    isVeg: false,
    spicyLevel: 2,
    isBestseller: true,
    isAvailable: true,
    description: "Hot spiced chicken noodle soup filled with tender chicken pieces.",
    image: "/assets/jhol_momo.jpg"
  },

  // 9. Chilly
  {
    id: "chilly-1",
    name: "Potato Chilly",
    category: "chilly",
    price: 135,
    isVeg: true,
    spicyLevel: 2,
    isBestseller: false,
    isAvailable: true,
    description: "Crispy fried potato wedges tossed in sweet and spicy chilli sauce.",
    image: "/assets/chowmein_fastfood.jpg"
  },
  {
    id: "chilly-2",
    name: "Paneer Chilly",
    category: "chilly",
    price: 180,
    isVeg: true,
    spicyLevel: 3,
    isBestseller: false,
    isAvailable: true,
    description: "Golden fried cottage cheese cubes tossed with soy, garlic, and capsicum.",
    image: "/assets/chowmein_fastfood.jpg"
  },
  {
    id: "chilly-3",
    name: "Chicken Chilly",
    category: "chilly",
    price: 190,
    isVeg: false,
    spicyLevel: 3,
    isBestseller: true,
    isAvailable: true,
    description: "Crispy boneless chicken tossed with dark soy, green chillies, and bell peppers.",
    image: "/assets/chowmein_fastfood.jpg"
  },

  // 10. Special
  {
    id: "special-1",
    name: "Peanut Sadheko",
    category: "special",
    price: 80,
    isVeg: true,
    spicyLevel: 2,
    isBestseller: false,
    isAvailable: true,
    description: "Crunchy roasted peanuts tossed with raw onions, tomatoes, green chillies, mustard oil, and lemon juice.",
    image: "/assets/momo_hero.jpg"
  },
  {
    id: "special-2",
    name: "French Fries",
    category: "special",
    price: 120,
    isVeg: true,
    spicyLevel: 0,
    isBestseller: false,
    isAvailable: true,
    description: "Crispy potato fries sprinkled with peri peri seasoning.",
    image: "/assets/kurkure_momo.jpg"
  },
  {
    id: "special-3",
    name: "Crispy Corn",
    category: "special",
    price: 100,
    isVeg: true,
    spicyLevel: 2,
    isBestseller: true,
    isAvailable: true,
    description: "Deep fried sweet corn kernels tossed with spices and herbs.",
    image: "/assets/kurkure_momo.jpg"
  },
  {
    id: "special-4",
    name: "Bhatmas Sadheko",
    category: "special",
    price: 120,
    isVeg: true,
    spicyLevel: 2,
    isBestseller: true,
    isAvailable: true,
    description: "Authentic Nepalese roasted soybean salad marinated with raw ginger, garlic, mustard oil, and lemon.",
    image: "/assets/momo_hero.jpg"
  },
  {
    id: "special-5",
    name: "Jhinga Papad",
    category: "special",
    price: 120,
    isVeg: true,
    spicyLevel: 1,
    isBestseller: false,
    isAvailable: true,
    description: "Crispy roasted papad topped with spicy onion-tomato salsa.",
    image: "/assets/momo_hero.jpg"
  },
  {
    id: "special-6",
    name: "Chicken Choila",
    category: "special",
    price: 120,
    isVeg: false,
    spicyLevel: 3,
    isBestseller: true,
    isAvailable: true,
    description: "Traditional Newari spiced grilled chicken salad tossed in roasted mustard oil and fenugreek seeds.",
    image: "/assets/chowmein_fastfood.jpg"
  },
  {
    id: "special-7",
    name: "Butter Chicken",
    category: "special",
    price: 150,
    isVeg: false,
    spicyLevel: 1,
    isBestseller: true,
    isAvailable: true,
    description: "Rich creamy butter chicken gravy cooked with fragrant spices.",
    image: "/assets/chowmein_fastfood.jpg"
  },
  {
    id: "special-8",
    name: "Mutton Pani Sekuwa",
    category: "special",
    price: 1000,
    isVeg: false,
    spicyLevel: 3,
    isBestseller: true,
    isAvailable: true,
    description: "Authentic Himalayan tender mutton sekuwa served per 1 kg portion.",
    image: "/assets/chowmein_fastfood.jpg"
  }
];

export const defaultOffers = [
  {
    id: "offer-1",
    title: "Momo Special Combo",
    subtitle: "Steam Momo + Kurkure Momo + Cold Drink",
    discount: "Save ₹40",
    code: "MOMO40",
    bgGradient: "from-amber-600 to-red-600",
    badge: "Popular Combo"
  },
  {
    id: "offer-2",
    title: "Chowmein & Momo Combo",
    subtitle: "1 Veg Chowmein + 1 Veg Steam Momo",
    discount: "Only ₹170",
    code: "COMBO170",
    bgGradient: "from-red-600 to-rose-700",
    badge: "Best Value"
  }
];
