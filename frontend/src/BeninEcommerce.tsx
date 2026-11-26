import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Smartphone,
  Laptop,
  Tv,
  CookingPot,
  BookOpen,
  Apple,
  Truck,
  ShieldCheck,
  CreditCard,
  Star,
  Menu,
  X,
  ChevronRight,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  Search,
  Utensils,
  LayoutGrid,
  Tag,
  Footprints,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  CONFIG                                                            */
/* ------------------------------------------------------------------ */

const USE_LOCAL_ASSETS = false;
const CART_STORAGE_KEY = 'beninmarket_cart_v5';

/* ------------------------------------------------------------------ */
/*  TYPES                                                             */
/* ------------------------------------------------------------------ */

type CategoryName =
  | 'Téléphones'
  | 'Ordinateurs'
  | 'Électroménager'
  | 'TV & Audio'
  | 'Ustensiles'
  | 'Chaussures'
  | 'Fournitures'
  | 'Alimentaire';

type NavTabId = 'top' | 'categories' | 'produits' | 'promotions' | 'contact';

interface SheetCrop {
  sheet: string;
  col: 0 | 1 | 2 | 3;
  row: 0 | 1;
}

interface Category {
  name: CategoryName;
  icon: React.ReactNode;
  colorClass: string;
}

interface Product {
  id: number;
  sku: string;
  name: string;
  brand: string;
  category: CategoryName;
  price: number;
  oldPrice?: number;
  specs: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  badge?: string;
  image: string;
  localImage: string;
  sheetCrop?: SheetCrop;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface TrustFeature {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

/* ------------------------------------------------------------------ */
/*  HELPERS                                                           */
/* ------------------------------------------------------------------ */

const formatPrice = (amount: number): string =>
  amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';

const getDiscountPercent = (price: number, oldPrice?: number): number | null => {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
};

const SVG_FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="360" viewBox="0 0 500 360">
      <rect width="500" height="360" fill="#f3f4f6"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6b7280" font-family="sans-serif" font-size="16" font-weight="600">
        BéninMarket
      </text>
    </svg>`
  );

/* ------------------------------------------------------------------ */
/*  VERIFIED PRODUCT IMAGES (100% Working, Distinct Fallbacks)        */
/* ------------------------------------------------------------------ */

const IMG = {
  // Apple iPhones
  iphone11: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80',
  iphone12: 'https://images.unsplash.com/photo-1611472173362-3f53dbd65d80?auto=format&fit=crop&w=600&q=80',
  iphone13: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=600&q=80',
  iphone14: 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?auto=format&fit=crop&w=600&q=80',
  iphone15: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
  iphone16: 'https://images.unsplash.com/photo-1726828537956-61ae115d7d7a?auto=format&fit=crop&w=600&q=80',
  iphone17: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80',

  // Samsung Galaxy
  samsungA05: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
  samsungA15: 'https://images.unsplash.com/photo-1678911820864-e2c567c655d7?auto=format&fit=crop&w=600&q=80',
  samsungA35: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80',
  samsungS23FE: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80',
  samsungS24Ultra: 'https://images.unsplash.com/photo-1707227156852-8b7d2d5a7c6d?auto=format&fit=crop&w=600&q=80',
  samsungS26Ultra: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',

  // Tecno
  tecnoSpark20: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=600&q=80',
  tecnoCamon20: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=600&q=80',
  tecnoPova5: 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&w=600&q=80',
  tecnoPhantomX2: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=600&q=80',

  // Infinix
  infinixHot40: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=600&q=80',
  infinixNote30: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=600&q=80',
  infinixZero30: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
  infinixSmart8: 'https://images.unsplash.com/photo-1533228100845-08145b01de14?auto=format&fit=crop&w=600&q=80',

  // Laptops
  hpPavilion: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
  dellInspiron: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
  lenovoIdeaPad: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80',
  macbookAirM2: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
  asusVivoBook: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80',

  // Électroménager
  gasCooker: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=600&q=80',
  tableTopBurner: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80',
  microwaveSamsung: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=600&q=80',
  microwaveLG: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=600&q=80',
  electricOven: 'https://images.unsplash.com/photo-1584269600519-112d071b35e6?auto=format&fit=crop&w=600&q=80',
  deepFryer: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=600&q=80',
  pressureCookerAlt: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=600&q=80',
  fridgeHisense: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=600&q=80',
  fridgeDouble: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=600&q=80',
  kettlePhilips: 'https://images.unsplash.com/photo-1563223771-5fe4038fbfc9?auto=format&fit=crop&w=600&q=80',
  kettleInox: 'https://images.unsplash.com/photo-1594213114663-d94db9b17125?auto=format&fit=crop&w=600&q=80',
  gasRegulator: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
  standingFan: 'https://images.unsplash.com/photo-1618944847023-38aa001235f0?auto=format&fit=crop&w=600&q=80',
  miniFan: 'https://images.unsplash.com/photo-1617375407633-acd67aba7864?auto=format&fit=crop&w=600&q=80',
  roomHeater: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80',
  lintRemover: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=600&q=80',
  steamIron: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80',
  dryIron: 'https://images.unsplash.com/photo-1610494176189-6a2007e5c6b8?auto=format&fit=crop&w=600&q=80',
  wallFan: 'https://images.unsplash.com/photo-1595844730289-0a7a6dfb5c5a?auto=format&fit=crop&w=600&q=80',
  blender: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=600&q=80',

  // TV & Audio
  hisense32A4: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80',
  hisense43Qled: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80',
  hisense43A6: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=600&q=80',
  hisense50Q5: 'https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?auto=format&fit=crop&w=600&q=80',
  hisense55Q5: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=600&q=80',
  smartTV: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80',
  oledTV: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80',
  sonyWoofer: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
  lgWoofer: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=600&q=80',
  jblPartyBox: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80',
  hisenseRadio: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
  philipsRadio: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?auto=format&fit=crop&w=600&q=80',

  // Ustensiles
  cookwareSet: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=600&q=80',
  ustBowlsInox: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80',
  ustPocketKnife: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=600&q=80',
  ustDinnerSet12: 'https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=600&q=80',
  ustFryingPan: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=600&q=80',
  ustBentoBox: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  ustDrinkingGlasses: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
  ustKitchenRug: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=600&q=80',
  ustGlassCups: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=600&q=80',
  ustDishRack: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80',
  ustChefKnives: 'https://images.unsplash.com/photo-1594221708779-94832f4320d1?auto=format&fit=crop&w=600&q=80',
  ustKitchenApron: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=600&q=80',
  ustAluPots: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80',
  ustFaucet: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
  ustBlackUtensils: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
  ustCoffeeTumbler: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
  ustEggBoiler: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=600&q=80',
  ustJapaneseDinner24: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
  ustMatrixHotpots: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=600&q=80',
  ustRollingRack: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=600&q=80',
  ustBambooSpoons: 'https://images.unsplash.com/photo-1584269600519-112d071b35e6?auto=format&fit=crop&w=600&q=80',
  ustCeramicBowls: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80',
  ustWaterSet7: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=600&q=80',
  ustManualChopper: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
  ustCakeKit: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
  ustChapatiPan: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=600&q=80',
  ustDinnerFlask13: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
  ustCutlerySet: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=600&q=80',
  ustThermalBottle: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
  ustCeramicMugs: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&q=80',
  ustDishRack3T: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?auto=format&fit=crop&w=600&q=80',
  ustTableMats: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=600&q=80',
  ustCookieCutter: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80',
  ustTablecloth: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80',
  ustLoafPan: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',

  // Chaussures
  nikeAF1: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
  adidasRun: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80',
  jordanHigh: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=600&q=80',
  nb550: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=600&q=80',
  converseAllStar: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=600&q=80',
  pumaSport: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80',
  leatherDerby: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80',
  timberlandBoot: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80',

  // Fournitures & Alimentaire
  schoolKit: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
  notebooks: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=600&q=80',
  rice25kg: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  oil5L: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
};

/* ------------------------------------------------------------------ */
/*  DATA                                                              */
/* ------------------------------------------------------------------ */

const NAV_LINKS: { label: string; id: NavTabId }[] = [
  { label: 'Accueil', id: 'top' },
  { label: 'Catégories', id: 'categories' },
  { label: 'Produits', id: 'produits' },
  { label: 'Promotions', id: 'promotions' },
  { label: 'Contact', id: 'contact' },
];

const categories: Category[] = [
  { name: 'Téléphones', icon: <Smartphone size={24} />, colorClass: 'bg-blue-100 text-blue-700' },
  { name: 'Ordinateurs', icon: <Laptop size={24} />, colorClass: 'bg-purple-100 text-purple-700' },
  { name: 'Électroménager', icon: <CookingPot size={24} />, colorClass: 'bg-amber-100 text-amber-700' },
  { name: 'TV & Audio', icon: <Tv size={24} />, colorClass: 'bg-rose-100 text-rose-700' },
  { name: 'Ustensiles', icon: <Utensils size={24} />, colorClass: 'bg-emerald-100 text-emerald-700' },
  { name: 'Chaussures', icon: <Footprints size={24} />, colorClass: 'bg-indigo-100 text-indigo-700' },
  { name: 'Fournitures', icon: <BookOpen size={24} />, colorClass: 'bg-lime-100 text-lime-700' },
  { name: 'Alimentaire', icon: <Apple size={24} />, colorClass: 'bg-orange-100 text-orange-700' },
];

const products: Product[] = [
  /* ==================== APPLE iPHONES ==================== */
  {
    id: 1,
    sku: 'A2221-64',
    name: 'iPhone 11 – 64 Go',
    brand: 'Apple',
    category: 'Téléphones',
    price: 220000,
    oldPrice: 260000,
    specs: ['Liquid Retina 6.1"', 'Puce A13 Bionic', 'Double caméra 12MP'],
    rating: 4.7,
    reviewCount: 142,
    stock: 12,
    badge: 'Classique',
    image: IMG.iphone11,
    localImage: '/images/products/iphone-11-64gb.webp',
  },
  {
    id: 2,
    sku: 'A2403-128',
    name: 'iPhone 12 – 128 Go',
    brand: 'Apple',
    category: 'Téléphones',
    price: 285000,
    oldPrice: 320000,
    specs: ['Super Retina XDR 6.1"', 'Puce A14 Bionic', '5G & MagSafe'],
    rating: 4.8,
    reviewCount: 118,
    stock: 9,
    image: IMG.iphone12,
    localImage: '/images/products/iphone-12-128gb.webp',
  },
  {
    id: 3,
    sku: 'A2633-128',
    name: 'iPhone 13 – 128 Go',
    brand: 'Apple',
    category: 'Téléphones',
    price: 355000,
    oldPrice: 395000,
    specs: ['Puce A15 Bionic', 'Mode Cinématique', 'Double caméra 12MP'],
    rating: 4.9,
    reviewCount: 204,
    stock: 15,
    image: IMG.iphone13,
    localImage: '/images/products/iphone-13-128gb.webp',
  },
  {
    id: 4,
    sku: 'A2882-256',
    name: 'iPhone 14 – 256 Go',
    brand: 'Apple',
    category: 'Téléphones',
    price: 455000,
    oldPrice: 510000,
    specs: ['A15 Bionic (GPU 5 cœurs)', 'Double caméra 12MP Photonic', "Détection d'accident"],
    rating: 4.8,
    reviewCount: 96,
    stock: 7,
    image: IMG.iphone14,
    localImage: '/images/products/iphone-14-256gb.webp',
  },
  {
    id: 5,
    sku: 'A3090-256',
    name: 'iPhone 15 – 256 Go',
    brand: 'Apple',
    category: 'Téléphones',
    price: 565000,
    specs: ['USB-C', 'Puce A16 Bionic', 'Caméra 48MP & Dynamic Island'],
    rating: 4.9,
    reviewCount: 163,
    stock: 11,
    badge: 'Populaire',
    image: IMG.iphone15,
    localImage: '/images/products/iphone-15-256gb.webp',
  },
  {
    id: 6,
    sku: 'A3287-256',
    name: 'iPhone 16 – 256 Go',
    brand: 'Apple',
    category: 'Téléphones',
    price: 695000,
    specs: ['Puce A18', 'Caméra Fusion 48MP', 'Commande de l’appareil photo'],
    rating: 4.9,
    reviewCount: 74,
    stock: 8,
    badge: 'Nouveau',
    image: IMG.iphone16,
    localImage: '/images/products/iphone-16-256gb.webp',
  },
  {
    id: 7,
    sku: 'A3520-512',
    name: 'iPhone 17 Pro – 512 Go',
    brand: 'Apple',
    category: 'Téléphones',
    price: 895000,
    specs: ['Puce A19 Pro', 'Écran 120Hz ProMotion', 'Triple caméra 48MP'],
    rating: 5.0,
    reviewCount: 38,
    stock: 4,
    badge: 'Premium',
    image: IMG.iphone17,
    localImage: '/images/products/iphone-17-pro-512gb.webp',
  },

  /* ==================== TECNO ==================== */
  {
    id: 8,
    sku: 'TEC-KJ5',
    name: 'Tecno Spark 20 – 128 Go',
    brand: 'Tecno',
    category: 'Téléphones',
    price: 65000,
    oldPrice: 78000,
    specs: ['6.6" HD+ 90Hz', 'Helio G85 • 8 Go RAM', 'Caméra 50MP'],
    rating: 4.6,
    reviewCount: 185,
    stock: 24,
    badge: 'Budget',
    image: IMG.tecnoSpark20,
    localImage: '/images/products/tecno-spark-20.webp',
  },
  {
    id: 9,
    sku: 'TEC-CK6N',
    name: 'Tecno Camon 20 – 256 Go',
    brand: 'Tecno',
    category: 'Téléphones',
    price: 95000,
    specs: ['AMOLED 6.67" FHD+', 'Helio G85 • 8 Go RAM', 'Capteur 64MP RGBW'],
    rating: 4.7,
    reviewCount: 121,
    stock: 16,
    image: IMG.tecnoCamon20,
    localImage: '/images/products/tecno-camon-20.webp',
  },
  {
    id: 10,
    sku: 'TEC-LH7N',
    name: 'Tecno Pova 5 – 256 Go',
    brand: 'Tecno',
    category: 'Téléphones',
    price: 88000,
    oldPrice: 102000,
    specs: ['Batterie 6000mAh', 'Charge rapide 45W', 'Helio G99 • 120Hz'],
    rating: 4.8,
    reviewCount: 94,
    stock: 14,
    image: IMG.tecnoPova5,
    localImage: '/images/products/tecno-pova-5.webp',
  },
  {
    id: 11,
    sku: 'TEC-AD9',
    name: 'Tecno Phantom X2 Pro 5G',
    brand: 'Tecno',
    category: 'Téléphones',
    price: 185000,
    specs: ['Dimensity 9000', 'Objectif portrait rétractable 50MP', 'AMOLED incurvé 120Hz'],
    rating: 4.8,
    reviewCount: 47,
    stock: 5,
    badge: 'Haut de gamme',
    image: IMG.tecnoPhantomX2,
    localImage: '/images/products/tecno-phantom-x2-pro.webp',
  },

  /* ==================== INFINIX ==================== */
  {
    id: 12,
    sku: 'INF-X6836',
    name: 'Infinix Hot 40 – 128 Go',
    brand: 'Infinix',
    category: 'Téléphones',
    price: 72000,
    oldPrice: 85000,
    specs: ['6.78" FHD+ 90Hz', 'Helio G88 • 8 Go RAM', 'Charge 33W • 50MP'],
    rating: 4.6,
    reviewCount: 132,
    stock: 19,
    image: IMG.infinixHot40,
    localImage: '/images/products/infinix-hot-40.webp',
  },
  {
    id: 13,
    sku: 'INF-X6833B',
    name: 'Infinix Note 30 – 256 Go',
    brand: 'Infinix',
    category: 'Téléphones',
    price: 112000,
    specs: ['6.78" 120Hz • Son JBL', 'Helio G99 • 5000mAh', 'Charge 45W'],
    rating: 4.8,
    reviewCount: 164,
    stock: 13,
    badge: 'Populaire',
    image: IMG.infinixNote30,
    localImage: '/images/products/infinix-note-30.webp',
  },
  {
    id: 14,
    sku: 'INF-X6731',
    name: 'Infinix Zero 30 5G – 256 Go',
    brand: 'Infinix',
    category: 'Téléphones',
    price: 168000,
    oldPrice: 195000,
    specs: ['AMOLED 144Hz', 'Dimensity 8020', '108MP OIS • Selfie 4K 60fps'],
    rating: 4.8,
    reviewCount: 68,
    stock: 6,
    image: IMG.infinixZero30,
    localImage: '/images/products/infinix-zero-30-5g.webp',
  },
  {
    id: 15,
    sku: 'INF-X6525',
    name: 'Infinix Smart 8 – 64 Go',
    brand: 'Infinix',
    category: 'Téléphones',
    price: 55000,
    specs: ['6.6" 90Hz Magic Ring', 'Batterie 5000mAh', 'Double caméra 13MP'],
    rating: 4.5,
    reviewCount: 210,
    stock: 30,
    badge: 'Éco',
    image: IMG.infinixSmart8,
    localImage: '/images/products/infinix-smart-8.webp',
  },

  /* ==================== SAMSUNG ==================== */
  {
    id: 16,
    sku: 'SM-A055F',
    name: 'Samsung Galaxy A05 – 64 Go',
    brand: 'Samsung',
    category: 'Téléphones',
    price: 48000,
    oldPrice: 62000,
    specs: ['6.7" HD+ PLS LCD', 'Helio G85 • 4 Go RAM', '50MP • Batterie 5000mAh'],
    rating: 4.5,
    reviewCount: 176,
    stock: 22,
    image: IMG.samsungA05,
    localImage: '/images/products/samsung-galaxy-a05.webp',
  },
  {
    id: 17,
    sku: 'SM-A155F',
    name: 'Samsung Galaxy A15 – 128 Go',
    brand: 'Samsung',
    category: 'Téléphones',
    price: 88000,
    oldPrice: 98000,
    specs: ['Super AMOLED 6.5" 90Hz', 'Helio G99', 'Triple caméra 50MP'],
    rating: 4.8,
    reviewCount: 193,
    stock: 18,
    badge: 'Promo',
    image: IMG.samsungA15,
    localImage: '/images/products/samsung-galaxy-a15.webp',
  },
  {
    id: 18,
    sku: 'SM-A356E',
    name: 'Samsung Galaxy A35 5G – 128 Go',
    brand: 'Samsung',
    category: 'Téléphones',
    price: 132000,
    specs: ['Super AMOLED 120Hz', 'Exynos 1380 • IP67', '50MP OIS • 5G'],
    rating: 4.8,
    reviewCount: 84,
    stock: 10,
    image: IMG.samsungA35,
    localImage: '/images/products/samsung-galaxy-a35-5g.webp',
  },
  {
    id: 19,
    sku: 'SM-S711B',
    name: 'Samsung Galaxy S23 FE – 256 Go',
    brand: 'Samsung',
    category: 'Téléphones',
    price: 385000,
    oldPrice: 420000,
    specs: ['Dynamic AMOLED 2X 120Hz', '50MP OIS • Zoom 3x', 'IP68 • Charge sans fil'],
    rating: 4.7,
    reviewCount: 62,
    stock: 7,
    image: IMG.samsungS23FE,
    localImage: '/images/products/samsung-galaxy-s23-fe.webp',
  },
  {
    id: 20,
    sku: 'SM-S928B',
    name: 'Samsung Galaxy S24 Ultra – 256 Go',
    brand: 'Samsung',
    category: 'Téléphones',
    price: 485000,
    specs: ['Snapdragon 8 Gen 3', 'Capteur 200MP • S Pen', 'Châssis Titane • Galaxy AI'],
    rating: 4.9,
    reviewCount: 115,
    stock: 6,
    badge: 'Flagship',
    image: IMG.samsungS24Ultra,
    localImage: '/images/products/samsung-galaxy-s24-ultra.webp',
  },
  {
    id: 21,
    sku: 'SM-S948B',
    name: 'Samsung Galaxy S26 Ultra – 512 Go',
    brand: 'Samsung',
    category: 'Téléphones',
    price: 785000,
    specs: ['Snapdragon 8 Elite Gen 2', 'Capteur 200MP • S Pen', 'Galaxy AI • Titane'],
    rating: 5.0,
    reviewCount: 29,
    stock: 3,
    badge: 'Nouveau',
    image: IMG.samsungS26Ultra,
    localImage: '/images/products/samsung-galaxy-s26-ultra.webp',
  },

  /* ==================== ORDINATEURS ==================== */
  {
    id: 22,
    sku: 'HP-15-EG2000',
    name: 'HP Pavilion 15 (Core i5)',
    brand: 'HP',
    category: 'Ordinateurs',
    price: 355000,
    oldPrice: 385000,
    specs: ['Intel Core i5-1235U', '8 Go RAM • SSD 512 Go', '15.6" FHD IPS'],
    rating: 4.7,
    reviewCount: 78,
    stock: 9,
    image: IMG.hpPavilion,
    localImage: '/images/products/hp-pavilion-15.webp',
  },
  {
    id: 23,
    sku: 'DELL-3525-R5',
    name: 'Dell Inspiron 15 3525 (Ryzen 5)',
    brand: 'Dell',
    category: 'Ordinateurs',
    price: 325000,
    specs: ['AMD Ryzen 5 5500U', '16 Go RAM • SSD 512 Go', '15.6" FHD 120Hz'],
    rating: 4.8,
    reviewCount: 64,
    stock: 7,
    image: IMG.dellInspiron,
    localImage: '/images/products/dell-inspiron-15.webp',
  },
  {
    id: 24,
    sku: 'LEN-82RK',
    name: 'Lenovo IdeaPad 3 15IAU7',
    brand: 'Lenovo',
    category: 'Ordinateurs',
    price: 285000,
    specs: ['Intel Core i3-1215U', '8 Go RAM • SSD 256 Go', '15.6" Anti-reflet'],
    rating: 4.6,
    reviewCount: 91,
    stock: 11,
    badge: 'Affaire',
    image: IMG.lenovoIdeaPad,
    localImage: '/images/products/lenovo-ideapad-3.webp',
  },
  {
    id: 25,
    sku: 'APPLE-MLXW3',
    name: 'MacBook Air 13.6" M2',
    brand: 'Apple',
    category: 'Ordinateurs',
    price: 765000,
    oldPrice: 820000,
    specs: ['Puce Apple M2', '8 Go RAM • SSD 256 Go', 'Liquid Retina • 18h autonomie'],
    rating: 4.9,
    reviewCount: 109,
    stock: 5,
    badge: 'Premium',
    image: IMG.macbookAirM2,
    localImage: '/images/products/macbook-air-m2.webp',
  },
  {
    id: 26,
    sku: 'ASUS-X1404',
    name: 'Asus VivoBook 14 (Core i3)',
    brand: 'Asus',
    category: 'Ordinateurs',
    price: 255000,
    specs: ['Intel Core i3-1215U', '8 Go RAM • SSD 256 Go', '14" FHD léger'],
    rating: 4.6,
    reviewCount: 53,
    stock: 8,
    image: IMG.asusVivoBook,
    localImage: '/images/products/asus-vivobook-14.webp',
  },

  /* ==================== ÉLECTROMÉNAGER ==================== */
  {
    id: 59,
    sku: 'EH-LINT-USB',
    name: 'Rasoir anti-bouloches électrique USB',
    brand: 'ElectroHome',
    category: 'Électroménager',
    price: 2500,
    oldPrice: 3500,
    specs: ['Rechargeable par câble USB', 'Lames inox 6 branches', 'Pour pulls & vêtements'],
    rating: 4.6,
    reviewCount: 486,
    stock: 42,
    badge: 'Black Fri',
    image: IMG.lintRemover,
    localImage: '/images/products/usb-lint-remover.webp',
  },
  {
    id: 60,
    sku: 'EM-DF6L-PRO',
    name: 'Friteuse électrique commerciale EM 6L Inox',
    brand: 'ElectroMate',
    category: 'Électroménager',
    price: 14500,
    oldPrice: 18000,
    specs: ['Capacité 6 Litres • Acier Inox', 'Thermostat réglable • Panier amovible', 'Garantie 1 an'],
    rating: 4.8,
    reviewCount: 1074,
    stock: 15,
    badge: 'Black Fri',
    image: IMG.deepFryer,
    localImage: '/images/products/em-6l-deep-fryer.webp',
  },
  {
    id: 61,
    sku: 'PAC-REG-6KG-2M',
    name: 'Détendeur gaz 6kg Pac Advance + Tuyau 2m & 2 colliers',
    brand: 'Pac Advance',
    category: 'Électroménager',
    price: 2500,
    oldPrice: 3500,
    specs: ['Pression standard 6kg', 'Tuyau gaz renforcé 2 mètres', '2 colliers de serrage inclus'],
    rating: 4.8,
    reviewCount: 40,
    stock: 50,
    badge: 'Black Fri',
    image: IMG.gasRegulator,
    localImage: '/images/products/pac-advance-6kg-regulator.webp',
  },
  {
    id: 62,
    sku: 'AIL-GC2B-SS',
    name: 'Réchaud à gaz 2 feux AILYONS Inox (+ Kit gaz offert)',
    brand: 'AILYONS',
    category: 'Électroménager',
    price: 8500,
    oldPrice: 11500,
    specs: ['2 brûleurs en acier inoxydable', 'Détendeur 6kg + tuyau 1.5m offerts', 'Garantie 1 an'],
    rating: 4.7,
    reviewCount: 1272,
    stock: 26,
    badge: 'Déstockage',
    image: IMG.tableTopBurner,
    localImage: '/images/products/ailyons-2burner-gas-stove.webp',
  },
  {
    id: 63,
    sku: 'AIL-LS-A1-5L',
    name: 'Autocuiseur électrique AILYONS LS-A1-5L (5L • 900W)',
    brand: 'AILYONS',
    category: 'Électroménager',
    price: 25000,
    oldPrice: 30000,
    specs: ['Capacité 5 Litres • 900W', 'Cuisson rapide multifonction', 'Affichage numérique • Garantie 1 an'],
    rating: 4.8,
    reviewCount: 312,
    stock: 11,
    badge: 'Offre Spéciale',
    image: IMG.pressureCookerAlt,
    localImage: '/images/products/ailyons-ls-a1-5l-pressure-cooker.webp',
  },
  {
    id: 64,
    sku: 'EM-OV20L-1500',
    name: 'Four électrique rôtissoire EM 20L – 1500W',
    brand: 'ElectroMate',
    category: 'Électroménager',
    price: 27500,
    oldPrice: 32000,
    specs: ['Capacité 20 Litres • 1500W', '3 modes de cuisson + Rôtissoire', 'Minuterie 60 min • Garantie 1 an'],
    rating: 4.7,
    reviewCount: 218,
    stock: 9,
    badge: 'Vente Flash',
    image: IMG.electricOven,
    localImage: '/images/products/em-20l-rotisserie-oven.webp',
  },
  {
    id: 65,
    sku: 'TRN-FAN-MINI',
    name: 'Mini ventilateur portable USB rechargeable',
    brand: 'Trinity',
    category: 'Électroménager',
    price: 3500,
    oldPrice: 4500,
    specs: ['Format main + socle de bureau', 'Silencieux • 3 vitesses', 'Recharge USB longue durée'],
    rating: 4.6,
    reviewCount: 195,
    stock: 34,
    badge: '-20% Solde',
    image: IMG.miniFan,
    localImage: '/images/products/portable-mini-usb-fan.webp',
  },
  {
    id: 66,
    sku: 'RSH-QH80A',
    name: "Chauffage d'appoint Rashnik QH-80A (400W / 800W)",
    brand: 'Rashnik',
    category: 'Électroménager',
    price: 7500,
    oldPrice: 9500,
    specs: ['2 niveaux de chauffe (400W / 800W)', 'Tubes quartz rapides', 'Sécurité anti-basculement'],
    rating: 4.7,
    reviewCount: 164,
    stock: 18,
    badge: 'Black Fri',
    image: IMG.roomHeater,
    localImage: '/images/products/rashnik-qh-80a-heater.webp',
  },
  {
    id: 27,
    sku: 'NAS-GC5050',
    name: 'Cuisinière à gaz 4 feux Nasco 50x50',
    brand: 'Nasco',
    category: 'Électroménager',
    price: 98000,
    oldPrice: 115000,
    specs: ['4 brûleurs gaz', 'Four émaillé avec grill', 'Sécurité thermocouple'],
    rating: 4.7,
    reviewCount: 88,
    stock: 10,
    badge: 'Populaire',
    image: IMG.gasCooker,
    localImage: '/images/products/nasco-cooker-4-feux.webp',
  },
  {
    id: 28,
    sku: 'BIN-GC300',
    name: 'Cuisinière 3 feux Binatone',
    brand: 'Binatone',
    category: 'Électroménager',
    price: 78000,
    specs: ['3 brûleurs gaz', 'Grille de rôtissoire', 'Allumage automatique'],
    rating: 4.6,
    reviewCount: 54,
    stock: 8,
    image: IMG.gasCooker,
    localImage: '/images/products/binatone-cooker-3-feux.webp',
  },
  {
    id: 29,
    sku: 'SAM-MS23K3513',
    name: 'Four micro-ondes Samsung 23L',
    brand: 'Samsung',
    category: 'Électroménager',
    price: 68000,
    oldPrice: 78000,
    specs: ['Capacité 23L • 800W', 'Intérieur Ceramic Inside', 'Décongélation rapide'],
    rating: 4.8,
    reviewCount: 73,
    stock: 14,
    image: IMG.microwaveSamsung,
    localImage: '/images/products/samsung-microwave-23l.webp',
  },
  {
    id: 30,
    sku: 'LG-MH6535G',
    name: 'Four micro-ondes LG NeoChef 25L',
    brand: 'LG',
    category: 'Électroménager',
    price: 82000,
    specs: ['25L • Smart Inverter 1000W', 'Fonction Grill', 'Revêtement EasyClean'],
    rating: 4.8,
    reviewCount: 61,
    stock: 9,
    badge: 'Promo',
    image: IMG.microwaveLG,
    localImage: '/images/products/lg-microwave-25l.webp',
  },
  {
    id: 31,
    sku: 'HIS-RD27DR',
    name: 'Réfrigérateur Hisense 200L Double Porte',
    brand: 'Hisense',
    category: 'Électroménager',
    price: 198000,
    oldPrice: 225000,
    specs: ['Capacité 200L', 'Congélateur haut', 'Classe énergétique A+'],
    rating: 4.7,
    reviewCount: 102,
    stock: 7,
    image: IMG.fridgeHisense,
    localImage: '/images/products/hisense-fridge-200l.webp',
  },
  {
    id: 32,
    sku: 'LG-GNB262',
    name: 'Réfrigérateur LG 260L Smart Inverter',
    brand: 'LG',
    category: 'Électroménager',
    price: 285000,
    specs: ['260L • No Frost', 'Compresseur Smart Inverter', 'Éclairage LED'],
    rating: 4.9,
    reviewCount: 67,
    stock: 5,
    image: IMG.fridgeDouble,
    localImage: '/images/products/lg-fridge-260l.webp',
  },
  {
    id: 33,
    sku: 'SAM-RT35K',
    name: 'Réfrigérateur Samsung 350L Twin Cooling',
    brand: 'Samsung',
    category: 'Électroménager',
    price: 385000,
    specs: ['350L • Double porte', 'Digital Inverter', 'Refroidissement rapide'],
    rating: 4.9,
    reviewCount: 49,
    stock: 4,
    badge: 'Spacieux',
    image: IMG.fridgeDouble,
    localImage: '/images/products/samsung-fridge-350l.webp',
  },
  {
    id: 34,
    sku: 'PHI-HD9350',
    name: 'Bouilloire Philips Daily Collection 1.7L',
    brand: 'Philips',
    category: 'Électroménager',
    price: 18500,
    oldPrice: 22000,
    specs: ['1.7L • Acier inoxydable', '2200W • Base 360°', 'Arrêt automatique'],
    rating: 4.8,
    reviewCount: 112,
    stock: 20,
    image: IMG.kettlePhilips,
    localImage: '/images/products/philips-kettle-1-7l.webp',
  },
  {
    id: 35,
    sku: 'BIN-CEJ1855',
    name: 'Bouilloire Binatone 1.8L',
    brand: 'Binatone',
    category: 'Électroménager',
    price: 14500,
    specs: ['1.8L • 2200W', 'Indicateur LED', 'Protection marche à sec'],
    rating: 4.6,
    reviewCount: 83,
    stock: 18,
    image: IMG.kettleInox,
    localImage: '/images/products/binatone-kettle-1-8l.webp',
  },
  {
    id: 53,
    sku: 'AIL-SF1805',
    name: 'Ventilateur sur pied AILYONS 18" – 5 pales',
    brand: 'AILYONS',
    category: 'Électroménager',
    price: 28000,
    oldPrice: 35000,
    specs: ['Diamètre 18 pouces • 5 pales', '3 vitesses silencieuses', 'Rallonge offerte'],
    rating: 4.7,
    reviewCount: 129,
    stock: 16,
    image: IMG.standingFan,
    localImage: '/images/products/ailyons-standing-fan-18.webp',
  },
  {
    id: 54,
    sku: 'STM-PORT-01',
    name: 'Défroisseur vapeur portable (Sec & Humide)',
    brand: 'Sokany',
    category: 'Électroménager',
    price: 12500,
    specs: ['Format voyage pliable', 'Chauffage en 30s', 'Vapeur continue'],
    rating: 4.5,
    reviewCount: 71,
    stock: 22,
    image: IMG.steamIron,
    localImage: '/images/products/portable-steam-iron.webp',
  },
  {
    id: 55,
    sku: 'IPC-DI200',
    name: 'Fer à repasser sec IPCONE Deluxe',
    brand: 'IPCONE',
    category: 'Électroménager',
    price: 8000,
    specs: ['1000W • Semelle anti-adhésive', 'Thermostat réglable', 'Témoin lumineux'],
    rating: 4.8,
    reviewCount: 194,
    stock: 28,
    badge: 'Top Vente',
    image: IMG.dryIron,
    localImage: '/images/products/ipcone-dry-iron.webp',
  },
  {
    id: 56,
    sku: 'IPC-WF1605',
    name: 'Ventilateur mural IPCONE 16" – 5 pales',
    brand: 'IPCONE',
    category: 'Électroménager',
    price: 22000,
    specs: ['Fixation murale gain de place', '16 pouces • 5 pales', 'Oscillation 90°'],
    rating: 4.6,
    reviewCount: 68,
    stock: 14,
    image: IMG.wallFan,
    localImage: '/images/products/ipcone-wall-fan-16.webp',
  },
  {
    id: 57,
    sku: 'IPC-EK20SS',
    name: 'Bouilloire électrique IPCONE 2L Inox',
    brand: 'IPCONE',
    category: 'Électroménager',
    price: 9500,
    specs: ['Capacité 2.0L • Inox', '1500W • Base rotative 360°', 'Arrêt auto'],
    rating: 4.7,
    reviewCount: 157,
    stock: 25,
    image: IMG.kettleInox,
    localImage: '/images/products/ipcone-kettle-2l.webp',
  },
  {
    id: 58,
    sku: 'EM-BL215',
    name: 'Blender ElectroMate 2-en-1 1.5L',
    brand: 'ElectroMate',
    category: 'Électroménager',
    price: 18000,
    oldPrice: 22000,
    specs: ['Bol 1.5L + moulin à épices', '4 vitesses + Pulse', 'Lames en inox'],
    rating: 4.6,
    reviewCount: 92,
    stock: 19,
    image: IMG.blender,
    localImage: '/images/products/electromate-blender-2in1.webp',
  },

  /* ==================== TV & AUDIO (HISENSE + OTHERS) ==================== */
  {
    id: 36,
    sku: 'HIS-32A4-VIDAA',
    name: 'Hisense 32" Smart TV VIDAA OS 32A4 Frameless',
    brand: 'Hisense',
    category: 'TV & Audio',
    price: 110000,
    oldPrice: 125000,
    specs: ['32" Frameless Full HD', 'VIDAA OS (YouTube, Netflix)', 'Antenne + Support mural + TV Guard offerts'],
    rating: 4.8,
    reviewCount: 188,
    stock: 18,
    badge: 'Nouveau',
    image: IMG.hisense32A4,
    localImage: '/images/products/hisense-32a4-vidaa.webp',
  },
  {
    id: 37,
    sku: 'HIS-43QLED-BT',
    name: 'Hisense 43" QLED 2K Smart TV Bluetooth Frameless',
    brand: 'Hisense',
    category: 'TV & Audio',
    price: 139500,
    oldPrice: 155000,
    specs: ['QLED 2K Quantum Dot • Full HD', 'Dolby Vision & Atmos • Bluetooth', 'Pack accessoires + Support offerts'],
    rating: 4.8,
    reviewCount: 296,
    stock: 14,
    badge: 'Top Vente',
    image: IMG.hisense43Qled,
    localImage: '/images/products/hisense-43-qled-2k-bt.webp',
  },
  {
    id: 67,
    sku: 'HIS-43QLED-FHD',
    name: 'Hisense 43" Full HD QLED 2K Smart TV',
    brand: 'Hisense',
    category: 'TV & Audio',
    price: 140000,
    oldPrice: 158000,
    specs: ['43" Frameless QLED 2K', 'Quantum Dot • Dolby Atmos', 'Bluetooth • Rallonge & Support offerts'],
    rating: 4.7,
    reviewCount: 124,
    stock: 11,
    badge: 'Populaire',
    image: IMG.hisense43Qled,
    localImage: '/images/products/hisense-43-qled-fhd.webp',
  },
  {
    id: 68,
    sku: 'HIS-43A6-UHD',
    name: 'Hisense 43" Smart TV Série A6 (43A6) UHD 4K',
    brand: 'Hisense',
    category: 'TV & Audio',
    price: 160000,
    oldPrice: 180000,
    specs: ['UHD 4K Direct Lit LED • Quad Core', 'Precision Colour • Bluetooth', 'Support pivotant & TV Guard offerts'],
    rating: 4.7,
    reviewCount: 41,
    stock: 9,
    badge: 'Black Fri',
    image: IMG.hisense43A6,
    localImage: '/images/products/hisense-43a6-uhd-4k.webp',
  },
  {
    id: 69,
    sku: 'HIS-43A6-FRAMELESS',
    name: 'Hisense 43" 4K Ultra HD LED Smart TV 43A6',
    brand: 'Hisense',
    category: 'TV & Audio',
    price: 159500,
    oldPrice: 175000,
    specs: ['43" UHD 4K Frameless', 'Bluetooth • YouTube & Netflix', 'Câbles, Support & TV Guard offerts'],
    rating: 4.8,
    reviewCount: 4,
    stock: 10,
    image: IMG.hisense43A6,
    localImage: '/images/products/hisense-43a6-frameless-4k.webp',
  },
  {
    id: 70,
    sku: 'HIS-50Q5-2K',
    name: 'Hisense 50" QLED Smart TV 50Q5 2K Full HD',
    brand: 'Hisense',
    category: 'TV & Audio',
    price: 179000,
    oldPrice: 198000,
    specs: ['50" QLED 2K • VIDAA OS', 'Garantie 25 mois', 'Rallonge + TV Guard + Support mural offerts'],
    rating: 4.7,
    reviewCount: 2,
    stock: 7,
    badge: 'Garantie 25 mois',
    image: IMG.hisense50Q5,
    localImage: '/images/products/hisense-50q5-qled.webp',
  },
  {
    id: 71,
    sku: 'HIS-55Q5SKEN',
    name: 'Hisense 55" QLED 2K Smart TV (55Q5SKEN)',
    brand: 'Hisense',
    category: 'TV & Audio',
    price: 208000,
    oldPrice: 229000,
    specs: ['55" QLED 2K Full HD', 'Dolby Vision & Atmos • VIDAA OS', 'Hi-View Engine • Wi-Fi & HDMI'],
    rating: 4.9,
    reviewCount: 15,
    stock: 6,
    badge: 'Nouvel Arrivage',
    image: IMG.hisense55Q5,
    localImage: '/images/products/hisense-55q5sken-qled.webp',
  },
  {
    id: 72,
    sku: 'HIS-55QLED-BT54',
    name: 'Hisense 55" QLED 2K Smart TV Frameless (Bluetooth 5.4)',
    brand: 'Hisense',
    category: 'TV & Audio',
    price: 212500,
    oldPrice: 235000,
    specs: ['55" QLED Frameless • Bluetooth 5.4', 'VIDAA OS • Dolby • Garantie 24+1 mois', 'Support, Rallonge, TV Guard & Antenne offerts'],
    rating: 4.9,
    reviewCount: 12,
    stock: 5,
    badge: 'Pack Complet',
    image: IMG.hisense55Q5,
    localImage: '/images/products/hisense-55-qled-vidaa-pack.webp',
  },
  {
    id: 38,
    sku: 'SAM-QA55Q60D',
    name: 'TV Samsung 55" QLED 4K',
    brand: 'Samsung',
    category: 'TV & Audio',
    price: 385000,
    specs: ['QLED Quantum Dot 4K', 'Tizen Smart TV', 'Quantum HDR • AirSlim'],
    rating: 4.9,
    reviewCount: 74,
    stock: 6,
    image: IMG.oledTV,
    localImage: '/images/products/samsung-tv-55-qled.webp',
  },
  {
    id: 39,
    sku: 'LG-OLED65C4',
    name: 'TV LG 65" OLED evo 4K',
    brand: 'LG',
    category: 'TV & Audio',
    price: 655000,
    oldPrice: 720000,
    specs: ['OLED 4K 120Hz', 'webOS • Processeur α9 AI', 'Dolby Vision & Atmos'],
    rating: 5.0,
    reviewCount: 41,
    stock: 3,
    badge: 'Premium',
    image: IMG.oledTV,
    localImage: '/images/products/lg-tv-65-oled.webp',
  },
  {
    id: 40,
    sku: 'TCL-50P635',
    name: 'TV TCL 50" 4K Google TV',
    brand: 'TCL',
    category: 'TV & Audio',
    price: 215000,
    specs: ['4K UHD HDR10', 'Google TV intégré', 'Dolby Audio • Sans bordures'],
    rating: 4.7,
    reviewCount: 66,
    stock: 8,
    image: IMG.smartTV,
    localImage: '/images/products/tcl-tv-50-4k.webp',
  },
  {
    id: 41,
    sku: 'SON-MHCV13',
    name: 'Système Audio Sony MHC-V13',
    brand: 'Sony',
    category: 'TV & Audio',
    price: 98000,
    oldPrice: 115000,
    specs: ['Jet Bass Booster', 'Bluetooth • USB • CD', 'Entrée micro Karaoké'],
    rating: 4.8,
    reviewCount: 89,
    stock: 9,
    badge: 'Son puissant',
    image: IMG.sonyWoofer,
    localImage: '/images/products/sony-mhc-v13.webp',
  },
  {
    id: 42,
    sku: 'LG-RN7',
    name: 'Woofer LG XBoom RN7',
    brand: 'LG',
    category: 'TV & Audio',
    price: 125000,
    specs: ['Double Super Bass Boost', 'Bluetooth • Double USB', 'Éclairage LED Party'],
    rating: 4.8,
    reviewCount: 77,
    stock: 7,
    image: IMG.lgWoofer,
    localImage: '/images/products/lg-xboom-rn7.webp',
  },
  {
    id: 43,
    sku: 'JBL-PB110',
    name: 'Enceinte JBL PartyBox 110',
    brand: 'JBL',
    category: 'TV & Audio',
    price: 185000,
    specs: ['160W RMS JBL Pro Sound', 'Autonomie 12h • IPX4', 'Entrées micro & guitare'],
    rating: 4.9,
    reviewCount: 104,
    stock: 6,
    badge: 'Portable',
    image: IMG.jblPartyBox,
    localImage: '/images/products/jbl-partybox-110.webp',
  },
  {
    id: 44,
    sku: 'HIS-RM70',
    name: 'Radio Portable Hisense RM-70',
    brand: 'Hisense',
    category: 'TV & Audio',
    price: 22000,
    oldPrice: 28000,
    specs: ['Tuner FM/AM', 'Bluetooth • Port USB/SD', 'Batterie rechargeable'],
    rating: 4.6,
    reviewCount: 58,
    stock: 18,
    image: IMG.hisenseRadio,
    localImage: '/images/products/hisense-radio-rm70.webp',
  },
  {
    id: 45,
    sku: 'PHI-AZ127',
    name: 'Radio Lecteur CD Philips AZ127',
    brand: 'Philips',
    category: 'TV & Audio',
    price: 28500,
    specs: ['Lecteur CD & Cassette', 'Tuner FM • Dynamic Bass Boost', 'Secteur ou piles'],
    rating: 4.7,
    reviewCount: 44,
    stock: 10,
    image: IMG.philipsRadio,
    localImage: '/images/products/philips-radio-az127.webp',
  },

  /* ==================== USTENSILES (56 ITEMS) ==================== */
  {
    id: 101,
    sku: 'UST-BOWL-5PC',
    name: 'Set de 5 Bols de Conservation en Acier Inoxydable',
    brand: 'Cookware Center',
    category: 'Ustensiles',
    price: 1750,
    oldPrice: 2200,
    specs: ['5 tailles empilables', 'Couvercles hermétiques', 'Acier inoxydable'],
    rating: 4.7,
    reviewCount: 1393,
    stock: 30,
    badge: 'Black Fri',
    image: IMG.ustBowlsInox,
    localImage: '/images/products/ust-5pc-bowls.webp',
    sheetCrop: { sheet: '/images/sheets/image_028702.jpg', col: 0, row: 0 },
  },
  {
    id: 102,
    sku: 'UST-KNIFE-FOLD',
    name: 'Couteau de Poche Pliable à Fruits en Inox',
    brand: 'KitchenPro',
    category: 'Ustensiles',
    price: 950,
    specs: ['Lame acier inoxydable', 'Format poche pliable', 'Idéal cuisine & plein air'],
    rating: 4.6,
    reviewCount: 849,
    stock: 45,
    image: IMG.ustPocketKnife,
    localImage: '/images/products/ust-folding-knife.webp',
    sheetCrop: { sheet: '/images/sheets/image_028702.jpg', col: 1, row: 0 },
  },
  {
    id: 103,
    sku: 'UST-DINNER-12PC',
    name: 'Service de Table / Petit-Déjeuner 12 Pièces + Support',
    brand: 'Choice Home',
    category: 'Ustensiles',
    price: 5900,
    oldPrice: 7000,
    specs: ['6 tasses + 6 assiettes céramique', 'Support métallique inclus', 'Finition bordure noire'],
    rating: 4.8,
    reviewCount: 567,
    stock: 16,
    badge: 'Offre',
    image: IMG.ustDinnerSet12,
    localImage: '/images/products/ust-12pc-dinner.webp',
    sheetCrop: { sheet: '/images/sheets/image_028702.jpg', col: 2, row: 0 },
  },
  {
    id: 104,
    sku: 'UST-PAN-24CM',
    name: 'Poêle Anti-Adhésive 24 cm en Fer Forgé',
    brand: 'JamesPot',
    category: 'Ustensiles',
    price: 1800,
    oldPrice: 2300,
    specs: ['Diamètre 24 cm', 'Revêtement anti-adhésif', 'Poignée ergonomique isolante'],
    rating: 4.8,
    reviewCount: 5798,
    stock: 40,
    badge: 'Black Fri',
    image: IMG.ustFryingPan,
    localImage: '/images/products/ust-24cm-pan.webp',
    sheetCrop: { sheet: '/images/sheets/image_028702.jpg', col: 3, row: 0 },
  },
  {
    id: 105,
    sku: 'UST-BENTO-JK',
    name: 'Boîte à Déjeuner Bento Portable + Sac Isotherme',
    brand: 'Jaza Keja',
    category: 'Ustensiles',
    price: 3600,
    oldPrice: 4500,
    specs: ['Étanche anti-fuite', 'Sac isotherme + bol soupe', 'Couverts inclus'],
    rating: 4.8,
    reviewCount: 2851,
    stock: 28,
    badge: 'Vente Flash',
    image: IMG.ustBentoBox,
    localImage: '/images/products/ust-bento-set.webp',
    sheetCrop: { sheet: '/images/sheets/image_028702.jpg', col: 0, row: 1 },
  },
  {
    id: 106,
    sku: 'UST-GLASS-6PC',
    name: 'Lot de 6 Verres à Eau Striés (Sans Plomb)',
    brand: 'CrystalHome',
    category: 'Ustensiles',
    price: 2300,
    specs: ['6 verres haute transparence', 'Verre épais résistant', 'Pour eau, jus & cocktails'],
    rating: 4.7,
    reviewCount: 22,
    stock: 35,
    image: IMG.ustDrinkingGlasses,
    localImage: '/images/products/ust-6pc-glasses.webp',
    sheetCrop: { sheet: '/images/sheets/image_028702.jpg', col: 1, row: 1 },
  },
  {
    id: 107,
    sku: 'UST-AIL-KET2L',
    name: 'Bouilloire Électrique AILYONS 2L + Rallonge',
    brand: 'AILYONS',
    category: 'Ustensiles',
    price: 3250,
    oldPrice: 4000,
    specs: ['Capacité 2L Inox', 'Arrêt automatique', 'Rallonge électrique incluse'],
    rating: 4.7,
    reviewCount: 7,
    stock: 20,
    badge: 'Black Fri',
    image: IMG.kettleInox,
    localImage: '/images/products/ust-ailyons-kettle.webp',
    sheetCrop: { sheet: '/images/sheets/image_028702.jpg', col: 2, row: 1 },
  },
  {
    id: 108,
    sku: 'UST-SUF-4PC',
    name: 'Lot de 4 Marmites Sufuria en Acier Inoxydable',
    brand: 'ChefInox',
    category: 'Ustensiles',
    price: 3600,
    oldPrice: 4500,
    specs: ['4 tailles graduées', 'Acier inoxydable durable', 'Cuisson homogène'],
    rating: 4.8,
    reviewCount: 1245,
    stock: 22,
    badge: 'Black Fri',
    image: IMG.cookwareSet,
    localImage: '/images/products/ust-4pc-sufuria.webp',
    sheetCrop: { sheet: '/images/sheets/image_028702.jpg', col: 3, row: 1 },
  },
  {
    id: 109,
    sku: 'UST-RUG-2PC',
    name: 'Lot de 2 Tapis de Cuisine Antidérapants',
    brand: 'HomeStyle',
    category: 'Ustensiles',
    price: 3250,
    oldPrice: 3900,
    specs: ['2 tapis assortis', 'Base antidérapante', 'Lavable & absorbant'],
    rating: 4.7,
    reviewCount: 990,
    stock: 25,
    badge: 'Black Fri',
    image: IMG.ustKitchenRug,
    localImage: '/images/products/ust-kitchen-rug.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d8a1.jpg', col: 0, row: 0 },
  },
  {
    id: 110,
    sku: 'UST-CUP-6PC',
    name: 'Sundabests Lot de 6 Tasses en Verre avec Anse',
    brand: 'Sundabests',
    category: 'Ustensiles',
    price: 1850,
    specs: ['6 tasses verre épais', 'Résistant à la chaleur', 'Idéal thé & café'],
    rating: 4.7,
    reviewCount: 320,
    stock: 32,
    image: IMG.ustGlassCups,
    localImage: '/images/products/ust-sundabests-cups.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d8a1.jpg', col: 1, row: 0 },
  },
  {
    id: 111,
    sku: 'UST-RACK-2T',
    name: 'Égouttoir à Vaisselle Smartrahalife 2 Niveaux Inox',
    brand: 'Smartrahalife',
    category: 'Ustensiles',
    price: 4600,
    oldPrice: 5500,
    specs: ['2 étages grande capacité', 'Porte-tasses & bac égouttoir', 'Acier chromé anti-rouille'],
    rating: 4.8,
    reviewCount: 2251,
    stock: 19,
    badge: 'Black Fri',
    image: IMG.ustDishRack,
    localImage: '/images/products/ust-dish-rack-2t.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d8a1.jpg', col: 2, row: 0 },
  },
  {
    id: 112,
    sku: 'UST-KNIFE-6PC',
    name: 'Set de 6 Couteaux de Chef + Ciseaux & Économe',
    brand: 'ChefPro',
    category: 'Ustensiles',
    price: 3250,
    specs: ['4 couteaux + ciseaux + éplucheur', 'Lames acier revêtement noir', 'Manches antidérapants'],
    rating: 4.7,
    reviewCount: 1032,
    stock: 27,
    image: IMG.ustChefKnives,
    localImage: '/images/products/ust-6pc-knives.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d8a1.jpg', col: 3, row: 0 },
  },
  {
    id: 113,
    sku: 'UST-APRON-2PC',
    name: 'Lot de 2 Tabliers de Cuisine Imperméables avec Poche',
    brand: 'CookingLife',
    category: 'Ustensiles',
    price: 1600,
    specs: ['Lot de 2 (Noir & Beige)', 'Imperméable & anti-huile', 'Poche frontale pratique'],
    rating: 4.6,
    reviewCount: 145,
    stock: 30,
    image: IMG.ustKitchenApron,
    localImage: '/images/products/ust-2pc-apron.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d8a1.jpg', col: 0, row: 1 },
  },
  {
    id: 114,
    sku: 'UST-ALU-4PC',
    name: 'Lot de 4 Marmites Sufurias en Aluminium Épais',
    brand: 'HeavyChef',
    category: 'Ustensiles',
    price: 3700,
    oldPrice: 4400,
    specs: ['4 marmites empilables', 'Aluminium lourd haute durabilité', 'Usage quotidien intensif'],
    rating: 4.7,
    reviewCount: 310,
    stock: 18,
    badge: 'Black Fri',
    image: IMG.ustAluPots,
    localImage: '/images/products/ust-4pc-heavy-alu.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d8a1.jpg', col: 1, row: 1 },
  },
  {
    id: 115,
    sku: 'UST-FAUCET-360',
    name: 'Rallonge de Robinet Flexible 360° Économiseur d’Eau',
    brand: 'SmartWater',
    category: 'Ustensiles',
    price: 1150,
    specs: ['Rotation flexible 360°', '2 modes de jet', 'Installation universelle'],
    rating: 4.5,
    reviewCount: 204,
    stock: 50,
    image: IMG.ustFaucet,
    localImage: '/images/products/ust-faucet-360.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d8a1.jpg', col: 2, row: 1 },
  },
  {
    id: 116,
    sku: 'UST-UTENSIL-6PC',
    name: 'Set de 6 Ustensiles de Cuisine Anti-Adhésifs Noirs',
    brand: 'Smartrahalife',
    category: 'Ustensiles',
    price: 2300,
    specs: ['Louche, spatules & écumoire', 'Nylon résistant à la chaleur', 'Ne raye pas les poêles'],
    rating: 4.7,
    reviewCount: 412,
    stock: 33,
    image: IMG.ustBlackUtensils,
    localImage: '/images/products/ust-6pc-black-utensils.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d8a1.jpg', col: 3, row: 1 },
  },
  {
    id: 117,
    sku: 'UST-MUG-316',
    name: 'Mug Isotherme Café en Acier Inoxydable 316',
    brand: 'CoffeeFlow',
    category: 'Ustensiles',
    price: 3600,
    specs: ['Acier inox 316 alimentaire', 'Maintien chaud/froid 6h', 'Couvercle étanche'],
    rating: 4.7,
    reviewCount: 360,
    stock: 26,
    image: IMG.ustCoffeeTumbler,
    localImage: '/images/products/ust-316-coffee-cup.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d8e5.jpg', col: 0, row: 0 },
  },
  {
    id: 118,
    sku: 'UST-EGG-BOIL',
    name: 'Cuiseur à Œufs Électrique Vapeur Double Étage',
    brand: 'HomeChef',
    category: 'Ustensiles',
    price: 3100,
    specs: ['Capacité jusqu’à 14 œufs', 'Cuisson vapeur rapide', 'Arrêt automatique'],
    rating: 4.6,
    reviewCount: 1111,
    stock: 21,
    image: IMG.ustEggBoiler,
    localImage: '/images/products/ust-egg-boiler.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d8e5.jpg', col: 1, row: 0 },
  },
  {
    id: 119,
    sku: 'UST-JAP-24PC',
    name: 'Service de Table Japonais 24 Pièces Céramique',
    brand: 'KyotoHome',
    category: 'Ustensiles',
    price: 13050,
    oldPrice: 15500,
    specs: ['Assiettes, bols & tasses (24 pcs)', 'Céramique épaisse durable', 'Design blanc liseré noir'],
    rating: 4.9,
    reviewCount: 1955,
    stock: 12,
    badge: 'Offre',
    image: IMG.ustJapaneseDinner24,
    localImage: '/images/products/ust-24pc-japanese.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d8e5.jpg', col: 2, row: 0 },
  },
  {
    id: 120,
    sku: 'UST-SCISSOR-SS',
    name: 'Ciseaux de Cuisine Multifonctions en Acier Inox',
    brand: 'ChefPro',
    category: 'Ustensiles',
    price: 950,
    specs: ['Lames crantées puissantes', 'Coupe volaille, herbes & os', 'Poignées ergonomiques'],
    rating: 4.7,
    reviewCount: 693,
    stock: 48,
    image: IMG.ustPocketKnife,
    localImage: '/images/products/ust-kitchen-scissors.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d8e5.jpg', col: 3, row: 0 },
  },
  {
    id: 121,
    sku: 'UST-MATRIX-4PC',
    name: 'Lot de 4 Plats Isothermes Matrix Inox (Hotpots)',
    brand: 'Matrix',
    category: 'Ustensiles',
    price: 9150,
    oldPrice: 11000,
    specs: ['4 tailles graduées', 'Garde les repas chauds 6h', 'Intérieur acier inoxydable'],
    rating: 4.8,
    reviewCount: 5,
    stock: 15,
    badge: 'Black Fri',
    image: IMG.ustMatrixHotpots,
    localImage: '/images/products/ust-matrix-hotpots.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d8e5.jpg', col: 0, row: 1 },
  },
  {
    id: 122,
    sku: 'UST-RACK-4T',
    name: 'Étagère Roulante de Cuisine 4 Niveaux Pivotante',
    brand: 'OrganizeIt',
    category: 'Ustensiles',
    price: 6350,
    oldPrice: 7500,
    specs: ['4 paniers rotatifs ventilés', 'Roulettes 360° avec frein', 'Idéal fruits & légumes'],
    rating: 4.7,
    reviewCount: 1539,
    stock: 17,
    badge: 'Promo',
    image: IMG.ustRollingRack,
    localImage: '/images/products/ust-4tier-rack.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d8e5.jpg', col: 1, row: 1 },
  },
  {
    id: 123,
    sku: 'UST-BAMBOO-SET',
    name: 'Set de Spatules en Bambou Naturel + Pot de Rangement',
    brand: 'EcoKitchen',
    category: 'Ustensiles',
    price: 1750,
    specs: ['Bambou 100% naturel', 'Protège les poêles anti-adhésives', 'Pot de rangement inclus'],
    rating: 4.6,
    reviewCount: 22,
    stock: 34,
    image: IMG.ustBambooSpoons,
    localImage: '/images/products/ust-bamboo-mwiko.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d8e5.jpg', col: 2, row: 1 },
  },
  {
    id: 124,
    sku: 'UST-CER-12PC',
    name: 'Service Céramique 12 Pièces Haute Qualité + Support',
    brand: 'KyotoHome',
    category: 'Ustensiles',
    price: 5850,
    oldPrice: 6900,
    specs: ['6 assiettes + 6 tasses', 'Support métal doré/chromé', 'Céramique résistante'],
    rating: 4.8,
    reviewCount: 2349,
    stock: 19,
    badge: 'Offre Spéciale',
    image: IMG.ustDinnerSet12,
    localImage: '/images/products/ust-ceramic-12pc.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d8e5.jpg', col: 3, row: 1 },
  },
  {
    id: 125,
    sku: 'UST-BOWL-JAP6',
    name: 'Lot de 6 Bols Japonais en Céramique Premium',
    brand: 'KyotoHome',
    category: 'Ustensiles',
    price: 950,
    specs: ['6 bols assortis', 'Céramique blanche bord noir', 'Passe au micro-ondes'],
    rating: 4.7,
    reviewCount: 280,
    stock: 40,
    image: IMG.ustCeramicBowls,
    localImage: '/images/products/ust-japanese-bowls-6.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d920.jpg', col: 0, row: 0 },
  },
  {
    id: 126,
    sku: 'UST-BOARD-KNIFE',
    name: 'Planche à Découper + Couteau de Cuisine Offert',
    brand: 'KitchenPro',
    category: 'Ustensiles',
    price: 1350,
    specs: ['Planche alimentaire hygiénique', 'Couteau inox offert', 'Facile à nettoyer'],
    rating: 4.7,
    reviewCount: 591,
    stock: 38,
    image: IMG.ustChefKnives,
    localImage: '/images/products/ust-chopping-board.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d920.jpg', col: 1, row: 0 },
  },
  {
    id: 127,
    sku: 'UST-WATER-7PC',
    name: 'Service à Eau 7 Pièces (1 Carafe Verre + 6 Verres)',
    brand: 'CrystalHome',
    category: 'Ustensiles',
    price: 4600,
    specs: ['1 carafe en verre épais', '6 verres assortis', 'Idéal table & réception'],
    rating: 4.8,
    reviewCount: 236,
    stock: 22,
    image: IMG.ustWaterSet7,
    localImage: '/images/products/ust-7pc-water-set.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d920.jpg', col: 2, row: 0 },
  },
  {
    id: 128,
    sku: 'UST-CHOPPER-MAN',
    name: 'Hachoir Manuel à Légumes & Viande à Ficelle',
    brand: 'QuickPrep',
    category: 'Ustensiles',
    price: 1750,
    specs: ['Lames inox ultra-tranchantes', 'Sans électricité', 'Hache oignons, ail & herbes'],
    rating: 4.6,
    reviewCount: 25,
    stock: 31,
    image: IMG.ustManualChopper,
    localImage: '/images/products/ust-manual-chopper.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d920.jpg', col: 3, row: 0 },
  },
  {
    id: 129,
    sku: 'UST-HOTCHEF-10',
    name: 'Batterie de Cuisine HotChef TTG164 – 10 Pièces',
    brand: 'HotChef',
    category: 'Ustensiles',
    price: 13850,
    oldPrice: 16500,
    specs: ['5 marmites + 5 couvercles verre', 'Revêtement pierre anti-adhésif', 'Poignées effet bois'],
    rating: 4.9,
    reviewCount: 829,
    stock: 10,
    badge: 'Black Fri',
    image: IMG.cookwareSet,
    localImage: '/images/products/ust-hotchef-10pc.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d920.jpg', col: 0, row: 1 },
  },
  {
    id: 130,
    sku: 'UST-CAKE-40PC',
    name: 'Kit Pâtisserie Décoration Gâteaux 40 Pièces',
    brand: 'BakeMaster',
    category: 'Ustensiles',
    price: 1650,
    specs: ['Poches à douille silicone', 'Douilles inox + spatules', 'Idéal cupcakes & gâteaux'],
    rating: 4.7,
    reviewCount: 367,
    stock: 29,
    image: IMG.ustCakeKit,
    localImage: '/images/products/ust-40pc-cake-kit.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d920.jpg', col: 1, row: 1 },
  },
  {
    id: 131,
    sku: 'UST-KNIFE-WOOD5',
    name: 'Set 5 Couteaux Inox + Planche à Découper en Bois',
    brand: 'ChefPro',
    category: 'Ustensiles',
    price: 3500,
    specs: ['Hachoir, couteaux & fusil', 'Planche en bois massif', 'Acier inoxydable durable'],
    rating: 4.7,
    reviewCount: 47,
    stock: 18,
    image: IMG.ustPocketKnife,
    localImage: '/images/products/ust-5pc-knife-wood.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d920.jpg', col: 2, row: 1 },
  },
  {
    id: 132,
    sku: 'UST-CHAPATI-PAN',
    name: 'Poêle à Crêpes / Chapati en Fonte Lourde',
    brand: 'HeavyChef',
    category: 'Ustensiles',
    price: 2750,
    specs: ['Fonte épaisse haute résistance', 'Distribution uniforme de la chaleur', 'Idéal galettes & chapatis'],
    rating: 4.6,
    reviewCount: 29,
    stock: 24,
    image: IMG.ustChapatiPan,
    localImage: '/images/products/ust-chapati-pan.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d920.jpg', col: 3, row: 1 },
  },
  {
    id: 133,
    sku: 'UST-DINNER-13FL',
    name: 'Service Céramique 13 Pièces + Thermos 2L Incassable',
    brand: 'Choice Home',
    category: 'Ustensiles',
    price: 12000,
    oldPrice: 14000,
    specs: ['Assiettes carrées + tasses noires', 'Thermos 2L inox inclus', 'Support métallique fourni'],
    rating: 4.8,
    reviewCount: 383,
    stock: 11,
    image: IMG.ustDinnerFlask13,
    localImage: '/images/products/ust-13pc-flask-set.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d97a.jpg', col: 0, row: 0 },
  },
  {
    id: 134,
    sku: 'UST-BOWL-JAP6B',
    name: 'Lot de 6 Bols Japonais Céramique Bord Fin',
    brand: 'KyotoHome',
    category: 'Ustensiles',
    price: 950,
    specs: ['6 bols profonds', 'Porcelaine facile à laver', 'Pour riz, soupes & salades'],
    rating: 4.7,
    reviewCount: 79,
    stock: 36,
    image: IMG.ustJapaneseDinner24,
    localImage: '/images/products/ust-japanese-bowls-6b.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d97a.jpg', col: 1, row: 0 },
  },
  {
    id: 135,
    sku: 'UST-CUTLERY-12',
    name: 'Ménagère Couverts Inox (Cuillères, Fourchettes & Couteaux)',
    brand: 'ChefInox',
    category: 'Ustensiles',
    price: 1150,
    specs: ['Acier inoxydable poli miroir', 'Ne rouille pas', 'Lot de 12 pièces'],
    rating: 4.6,
    reviewCount: 99,
    stock: 50,
    image: IMG.ustCutlerySet,
    localImage: '/images/products/ust-cutlery-12pc.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d97a.jpg', col: 2, row: 0 },
  },
  {
    id: 136,
    sku: 'UST-WATER-7PC-B',
    name: 'Coffret Carafe 1L + 6 Verres Cristal Haute Qualité',
    brand: 'CrystalHome',
    category: 'Ustensiles',
    price: 4600,
    specs: ['1 pichet + 6 verres longs', 'Verre renforcé', 'Idéal cadeaux & famille'],
    rating: 4.8,
    reviewCount: 1712,
    stock: 20,
    badge: 'Offre',
    image: IMG.ustDrinkingGlasses,
    localImage: '/images/products/ust-water-set-7b.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d97a.jpg', col: 3, row: 0 },
  },
  {
    id: 137,
    sku: 'UST-BOTTLE-1L',
    name: 'Gourde Thermos 1L Inox (Chaud & Froid)',
    brand: 'ThermoGo',
    category: 'Ustensiles',
    price: 3250,
    specs: ['Double paroi sous vide 1L', 'Garde chaud 12h / froid 24h', 'Bouchon anti-fuite'],
    rating: 4.8,
    reviewCount: 574,
    stock: 30,
    image: IMG.ustThermalBottle,
    localImage: '/images/products/ust-thermal-bottle-1l.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d97a.jpg', col: 0, row: 1 },
  },
  {
    id: 138,
    sku: 'UST-NICEONE-2L',
    name: 'Pichet Thermos Nice One VFS-024 (2L / 3L Inox)',
    brand: 'Nice One',
    category: 'Ustensiles',
    price: 4600,
    specs: ['Grande capacité 2L/3L', 'Acier inoxydable double paroi', 'Bec verseur bouton-poussoir'],
    rating: 4.9,
    reviewCount: 1063,
    stock: 19,
    badge: 'Officiel',
    image: IMG.kettlePhilips,
    localImage: '/images/products/ust-niceone-jug.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d97a.jpg', col: 1, row: 1 },
  },
  {
    id: 139,
    sku: 'UST-MUGS-6PC',
    name: 'Lot de 6 Mugs Japonais en Céramique Blanche',
    brand: 'KyotoHome',
    category: 'Ustensiles',
    price: 2100,
    specs: ['6 grandes tasses céramique', 'Finition élégante bord noir', 'Pour café, thé & chocolat'],
    rating: 4.7,
    reviewCount: 36,
    stock: 28,
    image: IMG.ustCeramicMugs,
    localImage: '/images/products/ust-6pc-ceramic-mugs.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d97a.jpg', col: 2, row: 1 },
  },
  {
    id: 140,
    sku: 'UST-RACK-3T',
    name: 'Égouttoir à Vaisselle 3 Niveaux Acier Carbone',
    brand: 'Smartrahalife',
    category: 'Ustensiles',
    price: 12400,
    oldPrice: 14500,
    specs: ['3 niveaux ultra-spacieux', 'Porte-couteaux & planche inclus', 'Acier carbone anti-corrosion'],
    rating: 4.9,
    reviewCount: 620,
    stock: 9,
    image: IMG.ustDishRack3T,
    localImage: '/images/products/ust-3tier-dish-rack.webp',
    sheetCrop: { sheet: '/images/sheets/image_02d97a.jpg', col: 3, row: 1 },
  },
  {
    id: 141,
    sku: 'UST-MEKO-6KG',
    name: 'Brûleur Gaz 6kg Meko Anti-Fuite Renforcé',
    brand: 'StrongGas',
    category: 'Ustensiles',
    price: 1200,
    specs: ['Compatible bouteilles 6kg', 'Valve anti-fuite sécurisée', 'Flamme bleue puissante'],
    rating: 4.6,
    reviewCount: 235,
    stock: 40,
    image: IMG.gasRegulator,
    localImage: '/images/products/ust-meko-burner.webp',
    sheetCrop: { sheet: '/images/sheets/image_02dc61.jpg', col: 0, row: 0 },
  },
  {
    id: 142,
    sku: 'UST-SUNGAS-6KG',
    name: 'Brûleur Gaz Sungas Meko Anti-Fuite Durable',
    brand: 'Sungas',
    category: 'Ustensiles',
    price: 1250,
    specs: ['Tête large haute résistance', 'Joint renforcé anti-fuite', 'Poignée de réglage précise'],
    rating: 4.7,
    reviewCount: 204,
    stock: 35,
    image: IMG.tableTopBurner,
    localImage: '/images/products/ust-sungas-burner.webp',
    sheetCrop: { sheet: '/images/sheets/image_02dc61.jpg', col: 1, row: 0 },
  },
  {
    id: 143,
    sku: 'UST-MATS-6PC',
    name: 'Lot de 6 Sets de Table PVC Antidérapants',
    brand: 'HomeStyle',
    category: 'Ustensiles',
    price: 3200,
    specs: ['6 sets tissés PVC doré/beige', 'Résistant à la chaleur', 'Nettoyage facile à l’éponge'],
    rating: 4.7,
    reviewCount: 73,
    stock: 25,
    image: IMG.ustTableMats,
    localImage: '/images/products/ust-6pc-table-mats.webp',
    sheetCrop: { sheet: '/images/sheets/image_02dc61.jpg', col: 2, row: 0 },
  },
  {
    id: 144,
    sku: 'UST-TOWEL-HOLD',
    name: 'Porte-Essuie-Tout de Cuisine en Acier Inoxydable',
    brand: 'HomeStyle',
    category: 'Ustensiles',
    price: 1400,
    specs: ['Support vertical stable', 'Acier inoxydable argent/or', 'Convient à tous rouleaux'],
    rating: 4.6,
    reviewCount: 43,
    stock: 30,
    image: IMG.ustDishRack,
    localImage: '/images/products/ust-paper-holder.webp',
    sheetCrop: { sheet: '/images/sheets/image_02dc61.jpg', col: 3, row: 0 },
  },
  {
    id: 145,
    sku: 'UST-COOLER-25L',
    name: 'Glacière Portable Isotherme Pacific 25 Litres',
    brand: 'Pacific',
    category: 'Ustensiles',
    price: 16400,
    specs: ['Capacité 25 Litres', 'Isolation longue durée', 'Poignée de transport robuste'],
    rating: 4.8,
    reviewCount: 4,
    stock: 10,
    image: IMG.fridgeHisense,
    localImage: '/images/products/ust-pacific-cooler-25l.webp',
    sheetCrop: { sheet: '/images/sheets/image_02dc61.jpg', col: 0, row: 1 },
  },
  {
    id: 146,
    sku: 'UST-MW-COVER',
    name: 'Cloche Micro-Ondes Anti-Éclaboussures avec Valve Vapeur',
    brand: 'QuickPrep',
    category: 'Ustensiles',
    price: 1400,
    specs: ['Valve vapeur réglable', 'Poignée anti-brûlure', 'Sans BPA • Transparente'],
    rating: 4.7,
    reviewCount: 200,
    stock: 38,
    image: IMG.microwaveSamsung,
    localImage: '/images/products/ust-microwave-cover.webp',
    sheetCrop: { sheet: '/images/sheets/image_02dc61.jpg', col: 1, row: 1 },
  },
  {
    id: 147,
    sku: 'UST-KET-2L-BF',
    name: 'Bouilloire Électrique 2L Inox Chauffe Rapide',
    brand: 'ElectroHome',
    category: 'Ustensiles',
    price: 2500,
    oldPrice: 3100,
    specs: ['Capacité 2 Litres', 'Base rotative 360°', 'Protection anti-chauffe à sec'],
    rating: 4.7,
    reviewCount: 422,
    stock: 27,
    badge: 'Black Fri',
    image: IMG.kettleInox,
    localImage: '/images/products/ust-2l-electric-kettle.webp',
    sheetCrop: { sheet: '/images/sheets/image_02dc61.jpg', col: 2, row: 1 },
  },
  {
    id: 148,
    sku: 'UST-REDBERRY-URN',
    name: 'Distributeur Thermos Café / Thé Redberry Inox',
    brand: 'Redberry',
    category: 'Ustensiles',
    price: 9700,
    specs: ['Robinet anti-goutte', 'Idéal événements & bureaux', 'Acier inoxydable isolé'],
    rating: 4.8,
    reviewCount: 5,
    stock: 8,
    image: IMG.ustDinnerFlask13,
    localImage: '/images/products/ust-redberry-urn.webp',
    sheetCrop: { sheet: '/images/sheets/image_02dc61.jpg', col: 3, row: 1 },
  },
  {
    id: 149,
    sku: 'UST-BOTTLE-3PC',
    name: 'Lot de 3 Gourdes Motivationnelles avec Paille',
    brand: 'Melody',
    category: 'Ustensiles',
    price: 3150,
    oldPrice: 3800,
    specs: ['3 tailles assorties', 'Plastique sans BPA givré', 'Idéal sport, école & bureau'],
    rating: 4.8,
    reviewCount: 5241,
    stock: 44,
    badge: 'Black Fri',
    image: IMG.ustThermalBottle,
    localImage: '/images/products/ust-3pc-water-bottles.webp',
    sheetCrop: { sheet: '/images/sheets/image_02dc9f.jpg', col: 0, row: 0 },
  },
  {
    id: 150,
    sku: 'UST-COOKIE-12',
    name: 'Lot de 12 Emporte-Pièces Biscuits en Inox',
    brand: 'BakeMaster',
    category: 'Ustensiles',
    price: 1400,
    specs: ['12 formes (cœur, étoile, fleur, rond)', 'Acier inoxydable alimentaire', 'Pour biscuits, œufs & fruits'],
    rating: 4.7,
    reviewCount: 92,
    stock: 35,
    image: IMG.ustCookieCutter,
    localImage: '/images/products/ust-12pc-cookie-cutter.webp',
    sheetCrop: { sheet: '/images/sheets/image_02dc9f.jpg', col: 1, row: 0 },
  },
  {
    id: 151,
    sku: 'UST-SPOON-12',
    name: 'Lot de 12 Cuillères de Table en Acier Inoxydable',
    brand: 'ChefInox',
    category: 'Ustensiles',
    price: 850,
    specs: ['12 cuillères solides', 'Finition brillante anti-rouille', 'Lavable au lave-vaisselle'],
    rating: 4.7,
    reviewCount: 150,
    stock: 60,
    image: IMG.ustCutlerySet,
    localImage: '/images/products/ust-12pc-spoons.webp',
    sheetCrop: { sheet: '/images/sheets/image_02dc9f.jpg', col: 2, row: 0 },
  },
  {
    id: 152,
    sku: 'UST-KIWI-2PC',
    name: 'Lot de 2 Couteaux de Cuisine KIWI Acier Inox',
    brand: 'KIWI',
    category: 'Ustensiles',
    price: 700,
    specs: ['2 couteaux forgés ultra-tranchants', 'Lames acier inoxydable', 'Manche ergonomique noir'],
    rating: 4.8,
    reviewCount: 43,
    stock: 55,
    image: IMG.ustChefKnives,
    localImage: '/images/products/ust-kiwi-2pc-knives.webp',
    sheetCrop: { sheet: '/images/sheets/image_02dc9f.jpg', col: 3, row: 0 },
  },
  {
    id: 153,
    sku: 'UST-CLOTH-PEVA',
    name: 'Nappe de Table Imperméable PEVA (137 × 274 cm)',
    brand: 'HomeStyle',
    category: 'Ustensiles',
    price: 1200,
    specs: ['Dimensions 137 × 274 cm', 'Anti-taches & imperméable', 'Essuyage instantané'],
    rating: 4.6,
    reviewCount: 110,
    stock: 40,
    image: IMG.ustTablecloth,
    localImage: '/images/products/ust-peva-tablecloth.webp',
    sheetCrop: { sheet: '/images/sheets/image_02dc9f.jpg', col: 0, row: 1 },
  },
  {
    id: 154,
    sku: 'UST-FLASK-HIP',
    name: 'Flasque de Poche en Acier Inoxydable Anti-Fuite',
    brand: 'ThermoGo',
    category: 'Ustensiles',
    price: 2000,
    specs: ['Acier inoxydable brossé', 'Bouchon à vis étanche attaché', 'Format poche compact'],
    rating: 4.6,
    reviewCount: 65,
    stock: 25,
    image: IMG.ustCoffeeTumbler,
    localImage: '/images/products/ust-hip-flask.webp',
    sheetCrop: { sheet: '/images/sheets/image_02dc9f.jpg', col: 1, row: 1 },
  },
  {
    id: 155,
    sku: 'UST-MATRIX-DLX4',
    name: 'Lot de 4 Marmites Isothermes Matrix Deluxe',
    brand: 'Matrix',
    category: 'Ustensiles',
    price: 9150,
    oldPrice: 11000,
    specs: ['4 plats isothermes Deluxe', 'Couvercles verrouillables', 'Garde au chaud longue durée'],
    rating: 4.8,
    reviewCount: 85,
    stock: 14,
    badge: 'Black Fri',
    image: IMG.ustMatrixHotpots,
    localImage: '/images/products/ust-matrix-deluxe-4pc.webp',
    sheetCrop: { sheet: '/images/sheets/image_02dc9f.jpg', col: 2, row: 1 },
  },
  {
    id: 156,
    sku: 'UST-LOAF-PAN',
    name: 'Moule à Cake / Pain Anti-Adhésif Rectangulaire',
    brand: 'BakeMaster',
    category: 'Ustensiles',
    price: 1300,
    specs: ['Revêtement anti-adhésif', 'Démoulage facile', 'Pour pain, cakes & brioches'],
    rating: 4.7,
    reviewCount: 261,
    stock: 32,
    image: IMG.ustLoafPan,
    localImage: '/images/products/ust-loaf-baking-tin.webp',
    sheetCrop: { sheet: '/images/sheets/image_02dc9f.jpg', col: 3, row: 1 },
  },

  /* ==================== CHAUSSURES (40 ITEMS) ==================== */
  {
    id: 201,
    sku: 'SHOE-SXC-BOOTW',
    name: 'Bottines Femme SXCHEN Souples à Fermeture Éclair',
    brand: 'SXCHEN',
    category: 'Chaussures',
    price: 6000,
    oldPrice: 7200,
    specs: ['Semelle crantée antidérapante', 'Fermeture latérale + lacets', 'Noir mat'],
    rating: 4.8,
    reviewCount: 2823,
    stock: 25,
    badge: 'Black Fri',
    image: IMG.timberlandBoot,
    localImage: '/images/products/shoe-sxchen-boots-w.webp',
    sheetCrop: { sheet: '/images/sheets/image_15bf3e.jpg', col: 0, row: 0 },
  },
  {
    id: 202,
    sku: 'SHOE-MEN-HIWHT',
    name: 'Baskets Montantes Homme Antidérapantes Blanc & Noir',
    brand: 'SportPro',
    category: 'Chaussures',
    price: 5500,
    oldPrice: 6500,
    specs: ['Maintien cheville montant', 'Semelle épaisse antidérapante', 'Design urbain'],
    rating: 4.7,
    reviewCount: 1896,
    stock: 22,
    badge: 'Black Fri',
    image: IMG.jordanHigh,
    localImage: '/images/products/shoe-men-high-white.webp',
    sheetCrop: { sheet: '/images/sheets/image_15bf3e.jpg', col: 1, row: 0 },
  },
  {
    id: 203,
    sku: 'SHOE-WMN-REDW',
    name: 'Baskets Femme Plateforme Blanc & Rouge',
    brand: 'FashionStep',
    category: 'Chaussures',
    price: 6000,
    oldPrice: 7000,
    specs: ['Semelle compensée légère', 'Respirantes & confortables', 'Style tendance'],
    rating: 4.7,
    reviewCount: 521,
    stock: 19,
    badge: 'Black Fri',
    image: IMG.nikeAF1,
    localImage: '/images/products/shoe-women-red-white.webp',
    sheetCrop: { sheet: '/images/sheets/image_15bf3e.jpg', col: 2, row: 0 },
  },
  {
    id: 204,
    sku: 'SHOE-SHJO-BLK',
    name: 'Baskets Casual Femme SHJO Noires à Scratch',
    brand: 'SHJO',
    category: 'Chaussures',
    price: 6200,
    oldPrice: 7400,
    specs: ['Fermeture velcro pratique', 'Semelle souple marche longue', 'Noir intégral'],
    rating: 4.7,
    reviewCount: 159,
    stock: 16,
    badge: 'Black Fri',
    image: IMG.adidasRun,
    localImage: '/images/products/shoe-shjo-black.webp',
    sheetCrop: { sheet: '/images/sheets/image_15bf3e.jpg', col: 3, row: 0 },
  },
  {
    id: 205,
    sku: 'SHOE-KID-BLU',
    name: 'Baskets Enfant Légères Antidérapantes Noir & Bleu',
    brand: 'KidsStep',
    category: 'Chaussures',
    price: 4500,
    oldPrice: 5400,
    specs: ['Ultra-légères pour enfants', 'Semelle crantée antidérapante', 'Scratch facile'],
    rating: 4.7,
    reviewCount: 240,
    stock: 30,
    badge: 'Black Fri',
    image: IMG.pumaSport,
    localImage: '/images/products/shoe-kids-blue.webp',
    sheetCrop: { sheet: '/images/sheets/image_15bf3e.jpg', col: 0, row: 1 },
  },
  {
    id: 206,
    sku: 'SHOE-SXC-FLIP',
    name: 'Tongs Homme SXCHEN Légères & Confortables',
    brand: 'SXCHEN',
    category: 'Chaussures',
    price: 1850,
    oldPrice: 2400,
    specs: ['Semelle souple antidérapante', 'Idéal plage & maison', 'Très résistantes'],
    rating: 4.6,
    reviewCount: 410,
    stock: 45,
    badge: 'Black Fri',
    image: IMG.converseAllStar,
    localImage: '/images/products/shoe-sxchen-flipflops.webp',
    sheetCrop: { sheet: '/images/sheets/image_15bf3e.jpg', col: 1, row: 1 },
  },
  {
    id: 207,
    sku: 'SHOE-SXC-WRK',
    name: 'Baskets de Travail & Ville Homme SXCHEN Noires',
    brand: 'SXCHEN',
    category: 'Chaussures',
    price: 3750,
    oldPrice: 4500,
    specs: ['Toile renforcée noire', 'Semelle épaisse robuste', 'Usage quotidien'],
    rating: 4.7,
    reviewCount: 315,
    stock: 28,
    badge: 'Nouveau',
    image: IMG.converseAllStar,
    localImage: '/images/products/shoe-sxchen-work.webp',
    sheetCrop: { sheet: '/images/sheets/image_15bf3e.jpg', col: 2, row: 1 },
  },
  {
    id: 208,
    sku: 'SHOE-BLD-GRY',
    name: 'Baskets Homme Baldur Grises & Orange (41–45)',
    brand: 'Baldur',
    category: 'Chaussures',
    price: 4600,
    oldPrice: 5500,
    specs: ['Pointures 41 – 45', 'Tige mesh respirante', 'Semelle sport amortissante'],
    rating: 4.8,
    reviewCount: 520,
    stock: 24,
    badge: 'Black Fri',
    image: IMG.nb550,
    localImage: '/images/products/shoe-baldur-grey.webp',
    sheetCrop: { sheet: '/images/sheets/image_15bf3e.jpg', col: 3, row: 1 },
  },
  {
    id: 209,
    sku: 'SHOE-KID-SND',
    name: 'Sandales Enfant Souples & Antidérapantes',
    brand: 'KidsStep',
    category: 'Chaussures',
    price: 2200,
    oldPrice: 2800,
    specs: ['Semelle souple anti-glisse', 'Brides velcro ajustables', 'Résistant à l’eau'],
    rating: 4.7,
    reviewCount: 1275,
    stock: 35,
    badge: 'Black Fri',
    image: IMG.pumaSport,
    localImage: '/images/products/shoe-kids-sandals.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c27e.jpg', col: 0, row: 0 },
  },
  {
    id: 210,
    sku: 'SHOE-BLD-DRV',
    name: 'Baskets Sport & Conduite Homme Baldur Noires',
    brand: 'Baldur',
    category: 'Chaussures',
    price: 3750,
    oldPrice: 4500,
    specs: ['Légères & respirantes', 'Semelle flexible antidérapante', 'Noir & Rouge'],
    rating: 4.8,
    reviewCount: 2423,
    stock: 30,
    badge: 'Black Fri',
    image: IMG.adidasRun,
    localImage: '/images/products/shoe-baldur-black.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c27e.jpg', col: 1, row: 0 },
  },
  {
    id: 211,
    sku: 'SHOE-ASSK-WSND',
    name: 'Sandales Femme ASSKLO Semelle Souple Grises',
    brand: 'ASSKLO',
    category: 'Chaussures',
    price: 4350,
    oldPrice: 5200,
    specs: ['Brides élastiques confort', 'Semelle plate ultra-douce', 'Marque officielle'],
    rating: 4.8,
    reviewCount: 1839,
    stock: 26,
    badge: 'Black Fri',
    image: IMG.nb550,
    localImage: '/images/products/shoe-assklo-women-sandals.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c27e.jpg', col: 2, row: 0 },
  },
  {
    id: 212,
    sku: 'SHOE-THOR-4047',
    name: 'Baskets Casual Homme ThorLarge Cuir PU (40–47)',
    brand: 'ThorLarge',
    category: 'Chaussures',
    price: 4150,
    oldPrice: 5000,
    specs: ['Grandes pointures 40 – 47', 'Cuir PU facile à nettoyer', 'Noir bande rouge'],
    rating: 4.8,
    reviewCount: 4662,
    stock: 32,
    badge: 'Top Vente',
    image: IMG.nikeAF1,
    localImage: '/images/products/shoe-thorlarge-pu.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c27e.jpg', col: 3, row: 0 },
  },
  {
    id: 213,
    sku: 'SHOE-SXC-OXF',
    name: 'Chaussures de Ville Oxford Homme SXCHEN Cuir Verni',
    brand: 'SXCHEN',
    category: 'Chaussures',
    price: 6000,
    oldPrice: 7200,
    specs: ['Style Business & Cérémonie', 'Finition cuir brillant noir', 'Boucle élégante'],
    rating: 4.8,
    reviewCount: 380,
    stock: 18,
    badge: 'Black Fri',
    image: IMG.leatherDerby,
    localImage: '/images/products/shoe-sxchen-oxfords.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c27e.jpg', col: 0, row: 1 },
  },
  {
    id: 214,
    sku: 'SHOE-THOR-HEEL',
    name: 'Escarpins Femme Thor Talons Élégants Noirs',
    brand: 'Thor',
    category: 'Chaussures',
    price: 5500,
    oldPrice: 6500,
    specs: ['Bout pointu avec boucle', 'Talon confortable bureau/soirée', 'Noir classique'],
    rating: 4.7,
    reviewCount: 290,
    stock: 15,
    badge: 'Black Fri',
    image: IMG.leatherDerby,
    localImage: '/images/products/shoe-thor-heels.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c27e.jpg', col: 1, row: 1 },
  },
  {
    id: 215,
    sku: 'SHOE-SXC-FISH',
    name: 'Sandales Femme SXCHEN Talon Carré Bout Ouvert',
    brand: 'SXCHEN',
    category: 'Chaussures',
    price: 4600,
    oldPrice: 5500,
    specs: ['Talon bloc stable', 'Bride cheville à boucle dorée', 'Cuir souple noir'],
    rating: 4.7,
    reviewCount: 210,
    stock: 20,
    badge: 'Black Fri',
    image: IMG.leatherDerby,
    localImage: '/images/products/shoe-sxchen-fishmouth.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c27e.jpg', col: 2, row: 1 },
  },
  {
    id: 216,
    sku: 'SHOE-BLD-WMN',
    name: 'Baskets Sport Femme Baldur Cuir PU Blanc & Rose',
    brand: 'Baldur',
    category: 'Chaussures',
    price: 4350,
    oldPrice: 5200,
    specs: ['Cuir PU respirant', 'Semelle amortissante', 'Blanc, Noir & Rose'],
    rating: 4.8,
    reviewCount: 415,
    stock: 22,
    badge: 'Vente Flash',
    image: IMG.nb550,
    localImage: '/images/products/shoe-baldur-women.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c27e.jpg', col: 3, row: 1 },
  },
  {
    id: 217,
    sku: 'SHOE-THOR-SLP',
    name: 'Claquettes Unisexe Thor Noires (40–45)',
    brand: 'Thor',
    category: 'Chaussures',
    price: 2100,
    oldPrice: 2600,
    specs: ['Pointures 40 – 45', 'Mousse EVA ultra-souple', 'Antidérapantes'],
    rating: 4.6,
    reviewCount: 11,
    stock: 40,
    badge: 'Black Fri',
    image: IMG.adidasRun,
    localImage: '/images/products/shoe-thor-slippers.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c2c2.jpg', col: 0, row: 0 },
  },
  {
    id: 218,
    sku: 'SHOE-SXC-WSLP',
    name: 'Claquettes Femme SXCHEN Double Boucle Blanches',
    brand: 'SXCHEN',
    category: 'Chaussures',
    price: 3250,
    specs: ['Double bride réglable', 'Semelle ergonomique légère', 'Blanc chic'],
    rating: 4.8,
    reviewCount: 967,
    stock: 30,
    badge: 'Officiel',
    image: IMG.nb550,
    localImage: '/images/products/shoe-sxchen-white-slippers.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c2c2.jpg', col: 1, row: 0 },
  },
  {
    id: 219,
    sku: 'SHOE-KID-PRIN',
    name: 'Sandales Princesse Fille à Nœud Pailleté',
    brand: 'KidsStep',
    category: 'Chaussures',
    price: 2050,
    specs: ['Semelle souple confortable', 'Nœud noir élégant', 'Bride cheville sécurisée'],
    rating: 4.7,
    reviewCount: 1223,
    stock: 32,
    image: IMG.converseAllStar,
    localImage: '/images/products/shoe-kids-princess.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c2c2.jpg', col: 2, row: 0 },
  },
  {
    id: 220,
    sku: 'SHOE-ASSK-MSND',
    name: 'Sandales Homme ASSKLO Originales Imperméables',
    brand: 'ASSKLO',
    category: 'Chaussures',
    price: 3900,
    oldPrice: 4800,
    specs: ['Résistantes à l’eau', 'Anti-odeur & antidérapantes', 'Grandes pointures'],
    rating: 4.8,
    reviewCount: 3717,
    stock: 38,
    badge: 'Black Fri',
    image: IMG.timberlandBoot,
    localImage: '/images/products/shoe-assklo-men-sandals.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c2c2.jpg', col: 3, row: 0 },
  },
  {
    id: 221,
    sku: 'SHOE-GLUE-60G',
    name: 'Colle Forte à Chaussures 60g Imperméable Séchage Rapide',
    brand: 'FixPro',
    category: 'Chaussures',
    price: 800,
    oldPrice: 1100,
    specs: ['Tube 60g réutilisable', 'Étanche & anti-bouchage', 'Pour cuir, toile & caoutchouc'],
    rating: 4.7,
    reviewCount: 540,
    stock: 60,
    badge: 'Vente Flash',
    image: IMG.converseAllStar,
    localImage: '/images/products/shoe-glue-60g.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c2c2.jpg', col: 0, row: 1 },
  },
  {
    id: 222,
    sku: 'SHOE-FREYR-LOAF',
    name: 'Mocassins Casual Homme Freyr Sans Lacets',
    brand: 'Freyr',
    category: 'Chaussures',
    price: 3250,
    oldPrice: 3900,
    specs: ['Enfilage rapide sans lacets', 'Semelle souple amortissante', 'Noir & Gris'],
    rating: 4.7,
    reviewCount: 410,
    stock: 25,
    badge: 'Vente Flash',
    image: IMG.leatherDerby,
    localImage: '/images/products/shoe-freyr-loafers.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c2c2.jpg', col: 1, row: 1 },
  },
  {
    id: 223,
    sku: 'SHOE-SXC-CNV',
    name: 'Baskets Toile Plate Femme / Étudiante SXCHEN Noires',
    brand: 'SXCHEN',
    category: 'Chaussures',
    price: 4600,
    specs: ['Toile respirante noire', 'Semelle caoutchouc souple', 'Idéal école & quotidien'],
    rating: 4.7,
    reviewCount: 280,
    stock: 29,
    image: IMG.converseAllStar,
    localImage: '/images/products/shoe-sxchen-canvas.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c2c2.jpg', col: 2, row: 1 },
  },
  {
    id: 224,
    sku: 'SHOE-SXC-SPT',
    name: 'Claquettes Sport Homme SXCHEN Blanc & Noir',
    brand: 'SXCHEN',
    category: 'Chaussures',
    price: 2750,
    oldPrice: 3400,
    specs: ['Semelle ergonomique sport', 'Intérieur & extérieur', 'Légères & lavables'],
    rating: 4.7,
    reviewCount: 330,
    stock: 34,
    badge: 'Black Fri',
    image: IMG.adidasRun,
    localImage: '/images/products/shoe-sxchen-sport-slides.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c2c2.jpg', col: 3, row: 1 },
  },
  {
    id: 225,
    sku: 'SHOE-ASSK-BOY',
    name: 'Sandales de Plage Garçon ASSKLO Originales',
    brand: 'ASSKLO',
    category: 'Chaussures',
    price: 2300,
    oldPrice: 2900,
    specs: ['Semelle antidérapante', 'Séchage rapide', 'Bleu, Noir & Rouge'],
    rating: 4.8,
    reviewCount: 1021,
    stock: 36,
    badge: 'Black Fri',
    image: IMG.pumaSport,
    localImage: '/images/products/shoe-assklo-boys.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c31c.jpg', col: 0, row: 0 },
  },
  {
    id: 226,
    sku: 'SHOE-FREYR-WHT',
    name: 'Baskets Running Femme Freyr Blanches & Rose',
    brand: 'Freyr',
    category: 'Chaussures',
    price: 4100,
    oldPrice: 4900,
    specs: ['Blanc éclatant facile à nettoyer', 'Légères pour sport & ville', 'Finition pompon'],
    rating: 4.8,
    reviewCount: 3715,
    stock: 27,
    badge: 'Black Fri',
    image: IMG.nikeAF1,
    localImage: '/images/products/shoe-freyr-white.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c31c.jpg', col: 1, row: 0 },
  },
  {
    id: 227,
    sku: 'SHOE-LCZ-BRN',
    name: 'Bottines Cuir Marron Homme Lacazette (+ 2 Paires Chaussettes)',
    brand: 'Lacazette',
    category: 'Chaussures',
    price: 11700,
    oldPrice: 13500,
    specs: ['Cuir marron finition soignée', '2 paires de chaussettes offertes', 'Style habillé & casual'],
    rating: 4.8,
    reviewCount: 134,
    stock: 12,
    badge: 'Cadeau Inclus',
    image: IMG.timberlandBoot,
    localImage: '/images/products/shoe-lacazette-brown.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c31c.jpg', col: 2, row: 0 },
  },
  {
    id: 228,
    sku: 'SHOE-SXC-HALF',
    name: 'Baskets Mules Homme SXCHEN Blanc & Gris',
    brand: 'SXCHEN',
    category: 'Chaussures',
    price: 3900,
    oldPrice: 4700,
    specs: ['Enfilage ultra-rapide sans talon', 'Semelle souple confort', 'Marque officielle'],
    rating: 4.7,
    reviewCount: 718,
    stock: 23,
    badge: 'Black Fri',
    image: IMG.nb550,
    localImage: '/images/products/shoe-sxchen-mules.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c31c.jpg', col: 3, row: 0 },
  },
  {
    id: 229,
    sku: 'SHOE-DP-SAFE',
    name: 'Chaussures de Sécurité Coque Acier Dong Peng',
    brand: 'Dong Peng',
    category: 'Chaussures',
    price: 7800,
    oldPrice: 9200,
    specs: ['Embout coqué en acier', 'Semelle anti-perforation & anti-glisse', 'Idéal chantiers & usines'],
    rating: 4.9,
    reviewCount: 412,
    stock: 16,
    badge: 'Sécurité',
    image: IMG.timberlandBoot,
    localImage: '/images/products/shoe-dongpeng-safety.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c31c.jpg', col: 0, row: 1 },
  },
  {
    id: 230,
    sku: 'SHOE-SXC-BALL',
    name: 'Ballerines Compensées Femme SXCHEN (Noir / Blanc)',
    brand: 'SXCHEN',
    category: 'Chaussures',
    price: 3250,
    oldPrice: 3900,
    specs: ['Semelle souple compensée', 'Très légères pour le bureau', 'Disponible en Noir & Blanc'],
    rating: 4.7,
    reviewCount: 285,
    stock: 24,
    badge: 'Black Fri',
    image: IMG.leatherDerby,
    localImage: '/images/products/shoe-sxchen-flats.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c31c.jpg', col: 1, row: 1 },
  },
  {
    id: 231,
    sku: 'SHOE-SLIP-CNV',
    name: 'Baskets Toile Homme Sans Lacets Confort Quotidien',
    brand: 'UrbanWalk',
    category: 'Chaussures',
    price: 5500,
    specs: ['Toile noire respirante', 'Semelle blanche vulcanisée', 'Enfilage facile'],
    rating: 4.7,
    reviewCount: 194,
    stock: 21,
    image: IMG.converseAllStar,
    localImage: '/images/products/shoe-men-slipon.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c31c.jpg', col: 2, row: 1 },
  },
  {
    id: 232,
    sku: 'SHOE-SXC-TACT',
    name: 'Bottes Tactiques Militaires Homme SXCHEN Noires',
    brand: 'SXCHEN',
    category: 'Chaussures',
    price: 3900,
    oldPrice: 4800,
    specs: ['Tige montante renforcée', 'Semelle crantée tout-terrain', 'Résistantes à l’usure'],
    rating: 4.8,
    reviewCount: 360,
    stock: 19,
    badge: 'Black Fri',
    image: IMG.timberlandBoot,
    localImage: '/images/products/shoe-sxchen-tactical.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c31c.jpg', col: 3, row: 1 },
  },
  {
    id: 233,
    sku: 'SHOE-KID-SUEDE',
    name: 'Bottines Enfant Ultimate Explorer Daim Tout-Terrain',
    brand: 'Ultimate Explorer',
    category: 'Chaussures',
    price: 6350,
    oldPrice: 7500,
    specs: ['Daim robuste couleur sable', 'Semelle cramponnée solide', 'Confort & maintien'],
    rating: 4.8,
    reviewCount: 88,
    stock: 15,
    badge: 'Black Fri',
    image: IMG.timberlandBoot,
    localImage: '/images/products/shoe-kids-suede.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c609.jpg', col: 0, row: 0 },
  },
  {
    id: 234,
    sku: 'SHOE-KID-WHT',
    name: 'Baskets Sport Enfant Blanches Antidérapantes',
    brand: 'KidsStep',
    category: 'Chaussures',
    price: 4050,
    oldPrice: 4800,
    specs: ['Fermeture velcro facile', 'Résistantes à l’usure', 'Garçons & Filles'],
    rating: 4.8,
    reviewCount: 1430,
    stock: 30,
    badge: 'Black Fri',
    image: IMG.nikeAF1,
    localImage: '/images/products/shoe-kids-white.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c609.jpg', col: 1, row: 0 },
  },
  {
    id: 235,
    sku: 'SHOE-SXC-DESERT',
    name: 'Bottes Désert Homme SXCHEN Couleur Sable',
    brand: 'SXCHEN',
    category: 'Chaussures',
    price: 8750,
    oldPrice: 10500,
    specs: ['Haute résistance tout-terrain', 'Fermeture éclair latérale + lacets', 'Marque officielle'],
    rating: 4.8,
    reviewCount: 1103,
    stock: 14,
    badge: 'Black Fri',
    image: IMG.timberlandBoot,
    localImage: '/images/products/shoe-sxchen-desert.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c609.jpg', col: 2, row: 0 },
  },
  {
    id: 236,
    sku: 'SHOE-THOR-WBOOT',
    name: 'Bottines Femme Thor à Talon Épais & Lacets',
    brand: 'Thor',
    category: 'Chaussures',
    price: 3900,
    oldPrice: 4800,
    specs: ['Talon bloc confortable', 'Style Martin chic', 'Noir velours'],
    rating: 4.7,
    reviewCount: 300,
    stock: 18,
    badge: 'Vente Flash',
    image: IMG.timberlandBoot,
    localImage: '/images/products/shoe-thor-women-boots.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c609.jpg', col: 3, row: 0 },
  },
  {
    id: 237,
    sku: 'SHOE-KID-LED',
    name: 'Baskets Lumineuses LED Enfant Rose Pailleté',
    brand: 'KidsStep',
    category: 'Chaussures',
    price: 4400,
    specs: ['Semelle lumineuse LED multicolore', 'Design étoiles & paillettes', 'Légères & confortables'],
    rating: 4.8,
    reviewCount: 215,
    stock: 22,
    image: IMG.pumaSport,
    localImage: '/images/products/shoe-kids-led.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c609.jpg', col: 0, row: 1 },
  },
  {
    id: 238,
    sku: 'SHOE-WMN-STIL',
    name: 'Sandales Femme Talons Aiguilles Cuir Noir',
    brand: 'GlamStep',
    category: 'Chaussures',
    price: 4450,
    oldPrice: 5200,
    specs: ['Bride fine à la cheville', 'Idéal soirées & cérémonies', 'Finition cuir noir'],
    rating: 4.7,
    reviewCount: 178,
    stock: 16,
    badge: 'Black Fri',
    image: IMG.leatherDerby,
    localImage: '/images/products/shoe-women-stiletto.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c609.jpg', col: 1, row: 1 },
  },
  {
    id: 239,
    sku: 'SHOE-GEL-INS',
    name: 'Paire de Talonnettes en Gel Silicone Confort',
    brand: 'ComfortStep',
    category: 'Chaussures',
    price: 1150,
    specs: ['Gel silicone absorbant les chocs', 'Soulage douleurs au talon', 'Lavables & réutilisables'],
    rating: 4.8,
    reviewCount: 46,
    stock: 50,
    image: IMG.adidasRun,
    localImage: '/images/products/shoe-gel-insoles.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c609.jpg', col: 2, row: 1 },
  },
  {
    id: 240,
    sku: 'SHOE-RAIN-GUM',
    name: 'Bottes de Pluie Noires Imperméables (Gumboots)',
    brand: 'RainGuard',
    category: 'Chaussures',
    price: 2750,
    specs: ['100% imperméables PVC', 'Semelle crantée anti-glisse', 'Idéal pluie & jardinage'],
    rating: 4.7,
    reviewCount: 190,
    stock: 35,
    image: IMG.timberlandBoot,
    localImage: '/images/products/shoe-gumboots.webp',
    sheetCrop: { sheet: '/images/sheets/image_15c609.jpg', col: 3, row: 1 },
  },

  /* ==================== FOURNITURES ==================== */
  {
    id: 48,
    sku: 'SCH-KIT-PRO',
    name: 'Kit scolaire complet (Primaire / Collège)',
    brand: 'BéninSchool',
    category: 'Fournitures',
    price: 12000,
    oldPrice: 15000,
    specs: ['Sac à dos résistant', '10 cahiers + trousse complète', 'Ensemble géométrie'],
    rating: 4.8,
    reviewCount: 151,
    stock: 40,
    badge: 'Rentrée',
    image: IMG.schoolKit,
    localImage: '/images/products/school-kit-complet.webp',
  },
  {
    id: 49,
    sku: 'SCH-NB200-10',
    name: 'Lot de 10 Cahiers 200 pages (Grands carreaux)',
    brand: 'Calligraphe',
    category: 'Fournitures',
    price: 4500,
    specs: ['Format 17×22 cm', 'Papier 70g haute blancheur', 'Couverture polypro'],
    rating: 4.7,
    reviewCount: 203,
    stock: 60,
    image: IMG.notebooks,
    localImage: '/images/products/cahiers-200p-lot10.webp',
  },

  /* ==================== ALIMENTAIRE ==================== */
  {
    id: 50,
    sku: 'FOOD-RICE-25',
    name: 'Riz parfumé long grain – Sac 25 kg',
    brand: 'Rizière Royale',
    category: 'Alimentaire',
    price: 18500,
    oldPrice: 21000,
    specs: ['Grain long non collant', '5% brisures max', 'Qualité supérieure'],
    rating: 4.9,
    reviewCount: 234,
    stock: 32,
    badge: 'Stock limité',
    image: IMG.rice25kg,
    localImage: '/images/products/riz-parfume-25kg.webp',
  },
  {
    id: 51,
    sku: 'FOOD-OIL-5L',
    name: 'Huile végétale raffinée – Bidon 5L',
    brand: 'Soleil d’Or',
    category: 'Alimentaire',
    price: 8500,
    specs: ['Enrichie en Vitamine A', 'Sans cholestérol', 'Bidon scellé 5 litres'],
    rating: 4.8,
    reviewCount: 178,
    stock: 45,
    image: IMG.oil5L,
    localImage: '/images/products/huile-vegetale-5l.webp',
  },
];

/* ------------------------------------------------------------------ */
/*  SAFE PRODUCT IMAGE (Auto-crops sheets + 3-stage fallback)         */
/* ------------------------------------------------------------------ */

interface ProductImageProps {
  localSrc: string;
  fallbackSrc: string;
  sheetCrop?: SheetCrop;
  alt: string;
  className?: string;
}

const ProductImage: React.FC<ProductImageProps> = ({
  localSrc,
  fallbackSrc,
  sheetCrop,
  alt,
  className = '',
}) => {
  const [sheetFailed, setSheetFailed] = useState(false);
  const [src, setSrc] = useState<string>(USE_LOCAL_ASSETS ? localSrc : fallbackSrc);

  useEffect(() => {
    setSrc(USE_LOCAL_ASSETS ? localSrc : fallbackSrc);
    setSheetFailed(false);
  }, [localSrc, fallbackSrc, sheetCrop]);

  if (sheetCrop && !sheetFailed) {
    const xPercent = (sheetCrop.col / 3) * 100;
    const yPercent = sheetCrop.row === 0 ? 4 : 62;

    return (
      <div
        role="img"
        aria-label={alt}
        className={`relative overflow-hidden bg-white ${className}`}
        style={{
          backgroundImage: `url(${sheetCrop.sheet})`,
          backgroundSize: '430% 340%',
          backgroundPosition: `${xPercent}% ${yPercent}%`,
          backgroundRepeat: 'no-repeat',
        }}
      >
        <img
          src={sheetCrop.sheet}
          alt=""
          className="hidden"
          onError={() => setSheetFailed(true)}
        />
      </div>
    );
  }

  const handleError = () => {
    if (src === localSrc && fallbackSrc !== localSrc) {
      setSrc(fallbackSrc);
    } else if (src !== SVG_FALLBACK) {
      setSrc(SVG_FALLBACK);
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={handleError}
      className={className}
    />
  );
};

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                    */
/* ------------------------------------------------------------------ */

const BeninEcommerce: React.FC = () => {
  const navigate = useNavigate();

  const [activeNav, setActiveNav] = useState<NavTabId>('top');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryName | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [promoOnly, setPromoOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toast, setToast] = useState<string | null>(null);

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  const cartCloseRef = useRef<HTMLButtonElement>(null);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  /* ---------------- actions ---------------- */

  // ✅ New function to go directly to checkout with cart items
  const goToCheckout = (): void => {
    navigate('/checkout', {
      state: {
        cartItems: cartItems,
      },
    });
  };

  const scrollToSection = (id: NavTabId): void => {
    setActiveNav(id);
    setMobileMenuOpen(false);
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePromoTabClick = (): void => {
    setPromoOnly(true);
    setSelectedCategory(null);
    setSelectedBrand(null);
    scrollToSection('produits');
    setActiveNav('promotions');
  };

  const addToCart = (product: Product): void => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setToast(`${product.name} ajouté au panier`);
  };

  const updateQuantity = (productId: number, delta: number): void => {
    setCartItems((prev) =>
      prev
        .map((i) =>
          i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (productId: number): void => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = (): void => setCartItems([]);

  const handleCategoryClick = (catName: CategoryName | null): void => {
    setSelectedCategory(catName);
    setSelectedBrand(null);
    setPromoOnly(false);
    scrollToSection('produits');
  };

  const resetFilters = (): void => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setPromoOnly(false);
    setSearchQuery('');
  };

  const closeCart = (): void => setCartOpen(false);

  /* ---------------- derived ---------------- */

  const availableBrands = useMemo(() => {
    const scope = selectedCategory
      ? products.filter((p) => p.category === selectedCategory)
      : products;
    return Array.from(new Set(scope.map((p) => p.brand))).sort();
  }, [selectedCategory]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (selectedBrand && p.brand !== selectedBrand) return false;
      if (promoOnly && !p.oldPrice) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.specs.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, selectedBrand, promoOnly, searchQuery]);

  const trustFeatures: TrustFeature[] = [
    { icon: <Truck size={30} />, title: 'Livraison rapide', desc: '24h à Cotonou & Calavi, 48h dans tout le Bénin.' },
    { icon: <CreditCard size={30} />, title: 'Paiement Mobile Money', desc: 'MTN MoMo, Moov Money ou paiement à la livraison.' },
    { icon: <ShieldCheck size={30} />, title: 'Achat sécurisé', desc: 'Vendeurs vérifiés et garantie constructeur.' },
    { icon: <Star size={30} />, title: 'Service client 7j/7', desc: 'Une équipe basée à Cotonou, à votre écoute.' },
  ];

  /* ---------------- effects ---------------- */

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // ignore storage quota errors
    }
  }, [cartItems]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCartOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [cartOpen]);

  useEffect(() => {
    if (cartOpen) cartCloseRef.current?.focus();
  }, [cartOpen]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---------------- render ---------------- */

  return (
    <div className={`min-h-screen bg-gray-50 text-gray-800 font-sans ${cartCount > 0 ? 'pb-24' : ''}`}>
      <style>{`@keyframes toast-enter{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.toast-enter{animation:toast-enter .25s ease}`}</style>

      {/* TOP BAR */}
      <div className="bg-emerald-800 text-white text-sm py-2 text-center px-4">
        🚚 Livraison gratuite à Cotonou dès 25 000 FCFA • Paiement MTN MoMo &amp; Moov Money accepté
      </div>

      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <a
            href="#top"
            className="flex items-center gap-2"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('top');
            }}
          >
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
              B
            </div>
            <span className="text-xl font-extrabold tracking-tight text-emerald-800">
              Bénin<span className="text-amber-500">Market</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            {NAV_LINKS.map((l) => {
              const isActive = activeNav === l.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() =>
                    l.id === 'promotions' ? handlePromoTabClick() : scrollToSection(l.id)
                  }
                  className={`px-3.5 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'text-gray-700 hover:text-emerald-700 hover:bg-gray-50'
                  }`}
                >
                  {l.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={goToCheckout}
              className="hidden sm:flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <CreditCard size={16} />
              <span>Commander</span>
            </button>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label={`Ouvrir le panier (${cartCount} article${cartCount > 1 ? 's' : ''})`}
              aria-expanded={cartOpen}
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-white text-[0.7rem] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100"
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 px-6 py-4 flex flex-col gap-2 text-sm font-medium">
            {NAV_LINKS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() =>
                  l.id === 'promotions' ? handlePromoTabClick() : scrollToSection(l.id)
                }
                className={`text-left px-3 py-2 rounded-lg ${
                  activeNav === l.id
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {l.label}
              </button>
            ))}
            <button
              type="button"
              onClick={goToCheckout}
              className="w-full mt-2 bg-emerald-700 text-white font-semibold py-2.5 rounded-lg"
            >
              Commander
            </button>
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="top" className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-center py-16 md:py-24">
          <div>
            <span className="inline-block bg-amber-400 text-emerald-900 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              N°1 au Bénin pour vos achats du quotidien
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
              Des iPhone aux Chaussures &amp; Smart TV,<br />
              <span className="text-amber-300">tout est livré chez vous.</span>
            </h1>
            <p className="text-emerald-100 text-base md:text-lg mb-8 max-w-lg">
              iPhone 11 → 17 Pro, Samsung, Tecno, Infinix, ordinateurs portables,
              chaussures, ustensiles, électroménager et TV QLED Hisense — commandez
              en FCFA et payez avec MTN MoMo ou Moov Money.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => scrollToSection('produits')}
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-emerald-900 font-bold px-6 py-3 rounded-lg transition-colors"
              >
                Commencer mes achats <ChevronRight size={18} />
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('categories')}
                className="inline-flex items-center border border-white/40 hover:bg-white/10 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Explorer les catégories
              </button>
            </div>

            <div className="flex flex-wrap gap-6 mt-10 text-sm">
              <div className="flex items-center gap-2 text-emerald-100">
                <Truck size={18} className="text-amber-300" /> Livraison 24h Cotonou
              </div>
              <div className="flex items-center gap-2 text-emerald-100">
                <ShieldCheck size={18} className="text-amber-300" /> Produits authentiques
              </div>
              <div className="flex items-center gap-2 text-emerald-100">
                <CreditCard size={18} className="text-amber-300" /> Mobile Money
              </div>
            </div>
          </div>

          <div className="hidden md:grid grid-cols-2 gap-4">
            <ProductImage localSrc="/images/products/iphone-15-256gb.webp" fallbackSrc={IMG.iphone15} alt="iPhone 15" className="w-full h-48 object-cover rounded-2xl shadow-lg" />
            <ProductImage localSrc="/images/products/macbook-air-m2.webp" fallbackSrc={IMG.macbookAirM2} alt="MacBook Air M2" className="w-full h-48 object-cover rounded-2xl shadow-lg mt-8" />
            <ProductImage localSrc="/images/products/shoe-sxchen-boots-w.webp" fallbackSrc={IMG.nikeAF1} alt="Chaussures" className="w-full h-48 object-cover rounded-2xl shadow-lg -mt-4" />
            <ProductImage localSrc="/images/products/hisense-55q5sken-qled.webp" fallbackSrc={IMG.hisense55Q5} alt="Hisense 55 QLED" className="w-full h-48 object-cover rounded-2xl shadow-lg mt-4" />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="py-14 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Nos catégories</h2>
            <p className="text-gray-500 mt-1">
              Cliquez sur un onglet pour filtrer instantanément le catalogue.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-9 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => handleCategoryClick(null)}
              className={`bg-white border rounded-xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all ${
                selectedCategory === null && !promoOnly
                  ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200'
                  : 'border-gray-100'
              }`}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-emerald-100 text-emerald-700">
                <LayoutGrid size={24} />
              </div>
              <span className="text-xs sm:text-sm font-semibold leading-tight text-gray-800">
                Tous ({products.length})
              </span>
            </button>

            {categories.map((cat) => {
              const isActive = selectedCategory === cat.name;
              const count = products.filter((p) => p.category === cat.name).length;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => handleCategoryClick(cat.name)}
                  className={`bg-white border rounded-xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all ${
                    isActive
                      ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200'
                      : 'border-gray-100'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${cat.colorClass}`}>
                    {cat.icon}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold leading-tight text-gray-800">
                    {cat.name}
                  </span>
                  <span className="text-[0.7rem] text-gray-400 mt-0.5">{count} articles</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="produits" className="py-6 sm:py-10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                {promoOnly
                  ? 'Offres & Promotions'
                  : selectedCategory
                  ? selectedCategory
                  : 'Catalogue produits'}
              </h2>
              <p className="text-gray-500 mt-1">
                {filteredProducts.length} sur {products.length} produits disponibles • Prix en FCFA.
              </p>
            </div>

            {/* SEARCH + PROMO TOGGLE */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setPromoOnly((prev) => !prev)}
                className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors whitespace-nowrap ${
                  promoOnly
                    ? 'bg-rose-600 border-rose-600 text-white'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Tag size={15} />
                Promos uniquement
              </button>

              <div className="relative w-full sm:w-72">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher modèle, marque, SKU..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* BRAND FILTER TABS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-5">
            <button
              type="button"
              onClick={() => setSelectedBrand(null)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedBrand === null
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Toutes les marques
            </button>
            {availableBrands.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => setSelectedBrand((prev) => (prev === brand ? null : brand))}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedBrand === brand
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>

          {/* ACTIVE FILTER BANNER */}
          {(selectedCategory || selectedBrand || promoOnly || searchQuery) && (
            <div className="flex items-center justify-between gap-3 flex-wrap bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-2.5 rounded-lg mb-5">
              <span>
                Filtres actifs :
                {selectedCategory && <strong className="ml-1.5">{selectedCategory}</strong>}
                {selectedBrand && <strong className="ml-1.5">• {selectedBrand}</strong>}
                {promoOnly && <strong className="ml-1.5 text-rose-600">• Promotions</strong>}
                {searchQuery && <strong className="ml-1.5">• &ldquo;{searchQuery}&rdquo;</strong>}
                <span className="ml-2 text-emerald-700">
                  ({filteredProducts.length} résultat{filteredProducts.length !== 1 ? 's' : ''})
                </span>
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 bg-white border border-emerald-200 text-emerald-700 font-semibold text-xs px-3 py-1 rounded-full hover:bg-emerald-100 transition-colors"
              >
                <X size={14} /> Réinitialiser
              </button>
            </div>
          )}

          {/* PRODUCT GRID */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white border border-dashed border-gray-200 rounded-xl">
              <p className="text-gray-500 mb-4">Aucun produit ne correspond à votre recherche.</p>
              <button
                type="button"
                onClick={resetFilters}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                Voir tous les produits
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProducts.map((product) => {
                const discount = getDiscountPercent(product.price, product.oldPrice);
                return (
                  <div
                    key={product.id}
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col group"
                  >
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <ProductImage
                        localSrc={product.localImage}
                        fallbackSrc={product.image}
                        sheetCrop={product.sheetCrop}
                        alt={`${product.brand} ${product.name}`}
                        className={`w-full h-full ${
                          USE_LOCAL_ASSETS ? 'object-contain p-3 bg-white' : 'object-cover'
                        } group-hover:scale-105 transition-transform duration-300`}
                      />
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {product.badge && (
                          <span className="bg-amber-500 text-white text-[0.7rem] font-bold px-2 py-0.5 rounded w-fit">
                            {product.badge}
                          </span>
                        )}
                        {discount && (
                          <span className="bg-rose-600 text-white text-[0.7rem] font-bold px-2 py-0.5 rounded w-fit">
                            -{discount}%
                          </span>
                        )}
                      </div>
                      <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-gray-800 text-[0.7rem] font-bold px-2 py-1 rounded">
                        {product.brand}
                      </span>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-[0.7rem] text-emerald-600 font-semibold uppercase tracking-wider">
                          {product.category}
                        </p>
                        <span className="text-[0.65rem] text-gray-400 font-mono">
                          {product.sku}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 leading-snug text-sm sm:text-base mb-1.5 line-clamp-2 min-h-[2.5rem]">
                        {product.name}
                      </h3>

                      <p className="text-xs text-gray-500 leading-snug mb-3 line-clamp-2 min-h-[2rem]">
                        {product.specs.join(' • ')}
                      </p>

                      <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                        <span className="text-base sm:text-lg font-extrabold text-emerald-700">
                          {formatPrice(product.price)}
                        </span>
                        {product.oldPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(product.oldPrice)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              fill={i < Math.round(product.rating) ? 'currentColor' : 'none'}
                            />
                          ))}
                          <span className="text-[0.7rem] text-gray-500 ml-1">
                            {product.rating.toFixed(1)} ({product.reviewCount})
                          </span>
                        </div>
                        {product.stock <= 5 && (
                          <span className="text-[0.65rem] font-semibold text-rose-600">
                            Plus que {product.stock}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        className="mt-auto w-full bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
                      >
                        <ShoppingCart size={16} />
                        Ajouter au panier
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* PROMO BANNER */}
      <section id="promotions" className="bg-amber-400 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-emerald-900">
              -15 % sur votre première commande
            </h3>
            <p className="text-emerald-800 mt-1">
              Utilisez le code{' '}
              <span className="font-bold bg-emerald-900 text-white px-2 py-0.5 rounded">BIENVENUE15</span>{' '}
              au moment du paiement.
            </p>
          </div>
          <button
            type="button"
            onClick={handlePromoTabClick}
            className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold px-6 py-3 rounded-lg whitespace-nowrap transition-colors"
          >
            Voir les promotions
          </button>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {trustFeatures.map((item) => (
            <div key={item.title} className="flex flex-col items-center">
              <div className="text-emerald-700">{item.icon}</div>
              <h4 className="font-bold text-gray-900 mt-3 mb-1 text-sm sm:text-base">{item.title}</h4>
              <p className="text-xs sm:text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="bg-emerald-900 text-emerald-100 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-emerald-900 font-bold">
                B
              </div>
              <span className="text-lg font-extrabold text-white">
                Bénin<span className="text-amber-400">Market</span>
              </span>
            </div>
            <p className="text-sm text-emerald-200 leading-relaxed">
              La marketplace de confiance au Bénin. Électronique, électroménager,
              TV, audio, chaussures, ustensiles et produits du quotidien, livrés rapidement à Cotonou et partout au Bénin.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-white mb-3">Navigation</h5>
            <ul className="space-y-2 text-sm text-emerald-200">
              {NAV_LINKS.slice(0, 4).map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() =>
                      l.id === 'promotions' ? handlePromoTabClick() : scrollToSection(l.id)
                    }
                    className="hover:text-amber-300"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white mb-3">Catégories</h5>
            <ul className="space-y-2 text-sm text-emerald-200">
              {categories.map((c) => (
                <li key={c.name}>
                  <button
                    type="button"
                    onClick={() => handleCategoryClick(c.name)}
                    className="hover:text-amber-300 text-left"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white mb-3">Contact</h5>
            <ul className="space-y-2 text-sm text-emerald-200">
              <li>📍 Cotonou, Bénin</li>
              <li>📞 +229 97 00 00 00</li>
              <li>✉️ contact@beninmarket.bj</li>
              <li>🕒 Lun – Sam : 8h – 20h</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-emerald-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-emerald-300 text-center sm:text-left">
            <p>© {new Date().getFullYear()} BéninMarket. Tous droits réservés.</p>
            <p>Paiements acceptés : MTN MoMo • Moov Money • Espèces à la livraison</p>
          </div>
        </div>
      </footer>

      {/* FLOATING CART BAR */}
      {cartCount > 0 && (
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.08)] z-40 hover:bg-gray-50 transition-colors text-left"
          aria-label="Voir le panier"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative text-emerald-700">
                <ShoppingCart size={24} />
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[0.7rem] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {cartCount} article{cartCount > 1 ? 's' : ''} • {formatPrice(cartTotal)}
                </p>
                <p className="text-xs text-gray-500">Appuyez pour voir le panier</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors">
              Voir le panier <ChevronRight size={16} />
            </span>
          </div>
        </button>
      )}

      {/* CART OVERLAY */}
      <div
        onClick={closeCart}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/50 z-[90] transition-opacity duration-300 ${
          cartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* CART DRAWER */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        aria-hidden={!cartOpen}
        className={`fixed inset-y-0 right-0 w-full max-w-[420px] bg-white z-[100] flex flex-col shadow-2xl transition-transform duration-300 ${
          cartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 id="cart-title" className="text-lg font-extrabold text-gray-900">
            Mon panier {cartCount > 0 && <span className="text-emerald-700 font-bold">({cartCount})</span>}
          </h3>
          <button
            ref={cartCloseRef}
            type="button"
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Fermer le panier"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {cartItems.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="inline-flex w-24 h-24 rounded-full bg-emerald-50 text-emerald-700 items-center justify-center mb-4">
                <ShoppingCart size={48} />
              </div>
              <p className="font-extrabold text-lg text-gray-900 mb-1.5">Votre panier est vide</p>
              <p className="text-sm text-gray-500 mb-6">
                Parcourez nos catégories et ajoutez vos produits préférés.
              </p>
              <button
                type="button"
                onClick={() => {
                  closeCart();
                  scrollToSection('produits');
                }}
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-emerald-900 font-bold px-5 py-3 rounded-lg transition-colors"
              >
                Découvrir les produits
              </button>
            </div>
          ) : (
            <ul>
              {cartItems.map(({ product, quantity }) => (
                <li
                  key={product.id}
                  className="flex gap-3.5 px-5 py-4 border-b border-gray-100"
                >
                  <ProductImage
                    localSrc={product.localImage}
                    fallbackSrc={product.image}
                    sheetCrop={product.sheetCrop}
                    alt={product.name}
                    className="w-20 h-20 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.7rem] font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">
                      {product.brand} • {product.sku}
                    </p>
                    <p className="text-sm font-bold text-gray-900 leading-tight mb-1 line-clamp-2">
                      {product.name}
                    </p>
                    <p className="text-sm font-extrabold text-emerald-700 mb-2">
                      {formatPrice(product.price)}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, -1)}
                          className="px-2.5 py-1.5 bg-white hover:bg-gray-100 text-gray-700 transition-colors"
                          aria-label="Retirer une unité"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-2.5 text-sm font-bold min-w-[28px] text-center">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, 1)}
                          className="px-2.5 py-1.5 bg-white hover:bg-gray-100 text-gray-700 transition-colors"
                          aria-label="Ajouter une unité"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(product.id)}
                        className="p-1.5 rounded-md text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                        aria-label={`Retirer ${product.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 px-5 py-4">
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 mb-3 transition-colors"
            >
              <Trash2 size={14} /> Vider le panier
            </button>

            <div className="flex items-center justify-between mb-1">
              <span className="text-base text-gray-900">Sous-total</span>
              <strong className="text-lg text-emerald-700">{formatPrice(cartTotal)}</strong>
            </div>
            <p className="text-xs text-gray-400 mb-3.5">
              Livraison calculée à l&apos;étape suivante.
            </p>

            <button
              type="button"
              onClick={goToCheckout}
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-lg transition-colors"
            >
              <CreditCard size={16} />
              Passer à la caisse
            </button>
          </div>
        )}
      </aside>

      {/* TOAST */}
      <div
        className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[120] pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        {toast && (
          <div
            onClick={() => setCartOpen(true)}
            className="toast-enter inline-flex items-center gap-2 bg-emerald-900 hover:bg-emerald-800 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg cursor-pointer pointer-events-auto max-w-[90vw]"
          >
            <CheckCircle2 size={18} className="text-amber-400 flex-shrink-0" />
            <span className="line-clamp-1">{toast}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeninEcommerce;