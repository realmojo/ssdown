export interface Category {
  slug: string;
  name: string;
  nameEn: string;
  icon: string;
  aliases: string[];
}

export const CATEGORIES: Category[] = [
  {
    slug: "games",
    name: "게임",
    nameEn: "Games",
    icon: "Gamepad2",
    aliases: ["게임", "Games", "Game", "게임/엔터테인먼트"],
  },
  {
    slug: "browsers",
    name: "브라우저",
    nameEn: "Browsers",
    icon: "Globe",
    aliases: ["브라우저", "Browsers", "Browser", "웹 브라우저"],
  },
  {
    slug: "security",
    name: "보안 및 개인정보 보호",
    nameEn: "Security & Privacy",
    icon: "ShieldCheck",
    aliases: ["보안 및 개인정보 보호", "Security", "보안", "개인정보 보호", "Security & Privacy"],
  },
  {
    slug: "productivity",
    name: "생산성",
    nameEn: "Productivity",
    icon: "Lightbulb",
    aliases: ["생산성", "Productivity", "비즈니스/생산성", "업무"],
  },
  {
    slug: "internet",
    name: "인터넷 및 네트워크",
    nameEn: "Internet & Network",
    icon: "Wifi",
    aliases: ["인터넷 및 네트워크", "Internet", "Network", "인터넷", "네트워크", "Internet & Network"],
  },
  {
    slug: "multimedia",
    name: "멀티미디어",
    nameEn: "Multimedia",
    icon: "Play",
    aliases: ["멀티미디어", "Multimedia", "미디어", "Media", "사진/동영상"],
  },
  {
    slug: "development",
    name: "개발 및 IT",
    nameEn: "Development & IT",
    icon: "Monitor",
    aliases: ["개발 및 IT", "Development", "개발", "IT", "개발 도구", "Developer Tools", "Development & IT"],
  },
  {
    slug: "personalization",
    name: "개인화",
    nameEn: "Personalization",
    icon: "Pencil",
    aliases: ["개인화", "Personalization", "커스터마이징", "테마"],
  },
  {
    slug: "education",
    name: "교육 및 참조",
    nameEn: "Education & Reference",
    icon: "GraduationCap",
    aliases: ["교육 및 참조", "Education", "교육", "참조", "Education & Reference"],
  },
  {
    slug: "lifestyle",
    name: "라이프스타일",
    nameEn: "Lifestyle",
    icon: "Coffee",
    aliases: ["라이프스타일", "Lifestyle", "생활"],
  },
  {
    slug: "social",
    name: "소셜 및 커뮤니케이션",
    nameEn: "Social & Communication",
    icon: "Users",
    aliases: ["소셜 및 커뮤니케이션", "Social", "소셜", "커뮤니케이션", "Social & Communication", "SNS"],
  },
  {
    slug: "travel",
    name: "여행 및 탐색",
    nameEn: "Travel & Navigation",
    icon: "Plane",
    aliases: ["여행 및 탐색", "Travel", "여행", "탐색", "Travel & Navigation", "지도/내비게이션"],
  },
  {
    slug: "utilities",
    name: "유틸리티 및 도구",
    nameEn: "Utilities & Tools",
    icon: "Wrench",
    aliases: ["유틸리티 및 도구", "Utilities", "유틸리티", "도구", "Tools", "Utilities & Tools"],
  },
  {
    slug: "ai",
    name: "AI",
    nameEn: "AI",
    icon: "BrainCircuit",
    aliases: ["AI", "인공지능", "Artificial Intelligence", "AI 도구", "AI Tools", "AI/ML"],
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryByMain(main: string): Category | undefined {
  const normalized = main.trim().toLowerCase();
  return CATEGORIES.find((c) =>
    c.aliases.some((alias) => alias.toLowerCase() === normalized)
  );
}
