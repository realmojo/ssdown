"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  Shapes,
  Search,
  Lightbulb,
  CheckCircle2,
  Upload,
  Image as ImageIconLucide,
  Palette,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Adsense from "@/components/Adsense";

interface IconItem {
  name: string;
  unicode: string;
  style: "solid" | "regular" | "brands";
  search: string;
}

const ICONS: IconItem[] = [
  // Common UI
  { name: "Home", unicode: "\uf015", style: "solid", search: "home house" },
  { name: "User", unicode: "\uf007", style: "solid", search: "user person profile" },
  { name: "Heart", unicode: "\uf004", style: "solid", search: "heart love favorite" },
  { name: "Star", unicode: "\uf005", style: "solid", search: "star favorite rating" },
  { name: "Search", unicode: "\uf002", style: "solid", search: "search find magnify" },
  { name: "Check", unicode: "\uf00c", style: "solid", search: "check done ok" },
  { name: "Close", unicode: "\uf00d", style: "solid", search: "close x remove times" },
  { name: "Plus", unicode: "\uf067", style: "solid", search: "plus add new" },
  { name: "Minus", unicode: "\uf068", style: "solid", search: "minus subtract remove" },
  { name: "Gear", unicode: "\uf013", style: "solid", search: "gear settings cog" },
  { name: "Bell", unicode: "\uf0f3", style: "solid", search: "bell notification alert" },
  { name: "Envelope", unicode: "\uf0e0", style: "solid", search: "envelope email mail" },
  { name: "Phone", unicode: "\uf095", style: "solid", search: "phone call telephone" },
  { name: "Camera", unicode: "\uf030", style: "solid", search: "camera photo picture" },
  { name: "Image", unicode: "\uf03e", style: "solid", search: "image photo picture" },
  { name: "Video", unicode: "\uf03d", style: "solid", search: "video movie film" },
  { name: "Music", unicode: "\uf001", style: "solid", search: "music audio sound note" },
  { name: "Download", unicode: "\uf019", style: "solid", search: "download save" },
  { name: "Upload", unicode: "\uf093", style: "solid", search: "upload send" },
  { name: "Share", unicode: "\uf064", style: "solid", search: "share send forward" },
  { name: "Link", unicode: "\uf0c1", style: "solid", search: "link chain url" },
  { name: "Lock", unicode: "\uf023", style: "solid", search: "lock security password" },
  { name: "Unlock", unicode: "\uf09c", style: "solid", search: "unlock open" },
  { name: "Eye", unicode: "\uf06e", style: "solid", search: "eye view visible" },
  { name: "Eye Slash", unicode: "\uf070", style: "solid", search: "eye hidden invisible" },
  { name: "Trash", unicode: "\uf1f8", style: "solid", search: "trash delete remove bin" },
  { name: "Edit", unicode: "\uf044", style: "solid", search: "edit pen write" },
  { name: "Copy", unicode: "\uf0c5", style: "solid", search: "copy duplicate clone" },
  { name: "Clipboard", unicode: "\uf328", style: "solid", search: "clipboard paste" },
  { name: "Calendar", unicode: "\uf133", style: "solid", search: "calendar date schedule" },
  { name: "Clock", unicode: "\uf017", style: "solid", search: "clock time watch" },
  { name: "Map", unicode: "\uf279", style: "solid", search: "map location navigate" },
  { name: "Location Pin", unicode: "\uf3c5", style: "solid", search: "location pin marker map" },
  { name: "Globe", unicode: "\uf0ac", style: "solid", search: "globe world earth internet" },
  { name: "Comment", unicode: "\uf075", style: "solid", search: "comment chat bubble message" },
  { name: "Bookmark", unicode: "\uf02e", style: "solid", search: "bookmark save flag" },
  { name: "Tag", unicode: "\uf02b", style: "solid", search: "tag label price" },
  { name: "Fire", unicode: "\uf06d", style: "solid", search: "fire flame hot trending" },
  { name: "Bolt", unicode: "\uf0e7", style: "solid", search: "bolt lightning power flash" },
  { name: "Crown", unicode: "\uf521", style: "solid", search: "crown king queen premium" },
  { name: "Trophy", unicode: "\uf091", style: "solid", search: "trophy award winner" },
  { name: "Gift", unicode: "\uf06b", style: "solid", search: "gift present box" },
  { name: "Cart", unicode: "\uf07a", style: "solid", search: "cart shopping buy store" },
  { name: "Credit Card", unicode: "\uf09d", style: "solid", search: "credit card payment pay" },
  { name: "Wallet", unicode: "\uf555", style: "solid", search: "wallet money payment" },
  { name: "Briefcase", unicode: "\uf0b1", style: "solid", search: "briefcase work business job" },
  { name: "Lightbulb", unicode: "\uf0eb", style: "solid", search: "lightbulb idea tip" },
  { name: "Rocket", unicode: "\uf135", style: "solid", search: "rocket launch startup" },
  { name: "Code", unicode: "\uf121", style: "solid", search: "code programming develop" },
  { name: "Terminal", unicode: "\uf120", style: "solid", search: "terminal console command" },
  { name: "Database", unicode: "\uf1c0", style: "solid", search: "database storage server" },
  { name: "Cloud", unicode: "\uf0c2", style: "solid", search: "cloud storage upload" },
  { name: "Shield", unicode: "\uf3ed", style: "solid", search: "shield security protect" },
  { name: "Key", unicode: "\uf084", style: "solid", search: "key password access" },
  { name: "Flag", unicode: "\uf024", style: "solid", search: "flag country report" },
  { name: "Thumbs Up", unicode: "\uf164", style: "solid", search: "thumbs up like approve" },
  { name: "Thumbs Down", unicode: "\uf165", style: "solid", search: "thumbs down dislike" },
  { name: "Circle Check", unicode: "\uf058", style: "solid", search: "circle check done success" },
  { name: "Circle Info", unicode: "\uf05a", style: "solid", search: "circle info information" },
  { name: "Warning", unicode: "\uf071", style: "solid", search: "warning alert caution triangle" },
  { name: "Circle X", unicode: "\uf057", style: "solid", search: "circle x close error" },
  { name: "Question", unicode: "\uf128", style: "solid", search: "question help faq" },
  { name: "Arrow Right", unicode: "\uf061", style: "solid", search: "arrow right next forward" },
  { name: "Arrow Left", unicode: "\uf060", style: "solid", search: "arrow left back previous" },
  { name: "Arrow Up", unicode: "\uf062", style: "solid", search: "arrow up" },
  { name: "Arrow Down", unicode: "\uf063", style: "solid", search: "arrow down" },
  { name: "Rotate", unicode: "\uf2f1", style: "solid", search: "rotate refresh sync" },
  { name: "Spinner", unicode: "\uf110", style: "solid", search: "spinner loading" },
  { name: "Bars", unicode: "\uf0c9", style: "solid", search: "bars menu hamburger" },
  { name: "Ellipsis", unicode: "\uf141", style: "solid", search: "ellipsis dots more" },
  { name: "Sliders", unicode: "\uf1de", style: "solid", search: "sliders settings filter" },
  { name: "Filter", unicode: "\uf0b0", style: "solid", search: "filter sort funnel" },
  { name: "Expand", unicode: "\uf065", style: "solid", search: "expand fullscreen maximize" },
  { name: "Compress", unicode: "\uf066", style: "solid", search: "compress minimize shrink" },
  { name: "Print", unicode: "\uf02f", style: "solid", search: "print paper" },
  { name: "File", unicode: "\uf15b", style: "solid", search: "file document" },
  { name: "Folder", unicode: "\uf07b", style: "solid", search: "folder directory" },
  { name: "Paperclip", unicode: "\uf0c6", style: "solid", search: "paperclip attach" },
  { name: "Pen", unicode: "\uf304", style: "solid", search: "pen write" },
  { name: "Paint Brush", unicode: "\uf1fc", style: "solid", search: "paint brush art design" },
  { name: "Palette", unicode: "\uf53f", style: "solid", search: "palette color art" },
  { name: "Wand Magic", unicode: "\uf0d0", style: "solid", search: "wand magic sparkles" },
  { name: "Circle", unicode: "\uf111", style: "solid", search: "circle dot" },
  { name: "Square", unicode: "\uf0c8", style: "solid", search: "square box" },
  { name: "Moon", unicode: "\uf186", style: "solid", search: "moon night dark" },
  { name: "Sun", unicode: "\uf185", style: "solid", search: "sun day light bright" },
  { name: "Snowflake", unicode: "\uf2dc", style: "solid", search: "snowflake winter cold" },
  { name: "Droplet", unicode: "\uf043", style: "solid", search: "droplet water rain" },
  { name: "Leaf", unicode: "\uf06c", style: "solid", search: "leaf nature plant eco" },
  { name: "Tree", unicode: "\uf1bb", style: "solid", search: "tree nature forest" },
  { name: "Paw", unicode: "\uf1b0", style: "solid", search: "paw pet animal" },
  { name: "Cat", unicode: "\uf6be", style: "solid", search: "cat pet animal" },
  { name: "Dog", unicode: "\uf6d3", style: "solid", search: "dog pet animal" },
  { name: "Fish", unicode: "\uf578", style: "solid", search: "fish sea ocean" },
  { name: "Skull", unicode: "\uf54c", style: "solid", search: "skull death danger" },
  { name: "Robot", unicode: "\uf544", style: "solid", search: "robot ai machine" },
  { name: "Gamepad", unicode: "\uf11b", style: "solid", search: "gamepad game controller" },
  { name: "Puzzle", unicode: "\uf12e", style: "solid", search: "puzzle piece game" },
  { name: "Dice", unicode: "\uf522", style: "solid", search: "dice game random" },
  { name: "Chess", unicode: "\uf439", style: "solid", search: "chess game strategy" },
  { name: "Headphones", unicode: "\uf025", style: "solid", search: "headphones audio music" },
  { name: "Microphone", unicode: "\uf130", style: "solid", search: "microphone audio record" },
  { name: "Volume High", unicode: "\uf028", style: "solid", search: "volume sound speaker audio" },
  { name: "Volume Mute", unicode: "\uf6a9", style: "solid", search: "volume mute silent" },
  { name: "Play", unicode: "\uf04b", style: "solid", search: "play media start" },
  { name: "Pause", unicode: "\uf04c", style: "solid", search: "pause media stop" },
  { name: "Stop", unicode: "\uf04d", style: "solid", search: "stop media halt" },
  { name: "Forward", unicode: "\uf04e", style: "solid", search: "forward skip next" },
  { name: "Backward", unicode: "\uf04a", style: "solid", search: "backward skip previous" },
  { name: "Wifi", unicode: "\uf1eb", style: "solid", search: "wifi wireless internet" },
  { name: "Bluetooth", unicode: "\uf293", style: "brands", search: "bluetooth wireless" },
  { name: "Battery Full", unicode: "\uf240", style: "solid", search: "battery full charge" },
  { name: "Plug", unicode: "\uf1e6", style: "solid", search: "plug power electricity" },
  { name: "Utensils", unicode: "\uf2e7", style: "solid", search: "utensils food eat restaurant" },
  { name: "Mug Hot", unicode: "\uf7b6", style: "solid", search: "mug coffee tea hot drink" },
  { name: "Wine Glass", unicode: "\uf4e3", style: "solid", search: "wine glass drink alcohol" },
  { name: "Plane", unicode: "\uf072", style: "solid", search: "plane airplane travel flight" },
  { name: "Car", unicode: "\uf1b9", style: "solid", search: "car vehicle drive" },
  { name: "Bus", unicode: "\uf207", style: "solid", search: "bus transit transport" },
  { name: "Train", unicode: "\uf238", style: "solid", search: "train rail subway metro" },
  { name: "Bicycle", unicode: "\uf206", style: "solid", search: "bicycle bike cycle" },
  { name: "Ship", unicode: "\uf21a", style: "solid", search: "ship boat cruise" },
  { name: "Anchor", unicode: "\uf13d", style: "solid", search: "anchor ship marine" },
  { name: "Mountain", unicode: "\uf6fc", style: "solid", search: "mountain peak nature" },
  { name: "Umbrella", unicode: "\uf0e9", style: "solid", search: "umbrella rain weather" },
  { name: "Hand", unicode: "\uf256", style: "solid", search: "hand stop palm" },
  { name: "Handshake", unicode: "\uf2b5", style: "solid", search: "handshake deal agreement" },
  { name: "Graduation Cap", unicode: "\uf19d", style: "solid", search: "graduation cap education school" },
  { name: "Book", unicode: "\uf02d", style: "solid", search: "book read library" },
  { name: "Hospital", unicode: "\uf0f8", style: "solid", search: "hospital medical health" },
  { name: "Stethoscope", unicode: "\uf0f1", style: "solid", search: "stethoscope doctor medical" },
  { name: "Pill", unicode: "\uf484", style: "solid", search: "pill medicine drug" },
  { name: "Atom", unicode: "\uf5d2", style: "solid", search: "atom science physics" },
  { name: "Flask", unicode: "\uf0c3", style: "solid", search: "flask science chemistry lab" },
  { name: "Microscope", unicode: "\uf610", style: "solid", search: "microscope science research" },
  // Brands
  { name: "GitHub", unicode: "\uf09b", style: "brands", search: "github code repository" },
  { name: "Twitter", unicode: "\uf099", style: "brands", search: "twitter x social" },
  { name: "Facebook", unicode: "\uf09a", style: "brands", search: "facebook social meta" },
  { name: "Instagram", unicode: "\uf16d", style: "brands", search: "instagram photo social" },
  { name: "YouTube", unicode: "\uf167", style: "brands", search: "youtube video social" },
  { name: "TikTok", unicode: "\ue07b", style: "brands", search: "tiktok video social" },
  { name: "LinkedIn", unicode: "\uf08c", style: "brands", search: "linkedin professional social" },
  { name: "Discord", unicode: "\uf392", style: "brands", search: "discord chat gaming" },
  { name: "Slack", unicode: "\uf198", style: "brands", search: "slack chat work" },
  { name: "Apple", unicode: "\uf179", style: "brands", search: "apple mac ios" },
  { name: "Android", unicode: "\uf17b", style: "brands", search: "android google phone" },
  { name: "Windows", unicode: "\uf17a", style: "brands", search: "windows microsoft pc" },
  { name: "Linux", unicode: "\uf17c", style: "brands", search: "linux penguin open source" },
  { name: "Chrome", unicode: "\uf268", style: "brands", search: "chrome browser google" },
  { name: "Firefox", unicode: "\uf269", style: "brands", search: "firefox browser mozilla" },
  { name: "React", unicode: "\uf41b", style: "brands", search: "react javascript framework" },
  { name: "Node.js", unicode: "\uf3d3", style: "brands", search: "nodejs node javascript server" },
  { name: "Python", unicode: "\uf3e2", style: "brands", search: "python programming language" },
  { name: "Java", unicode: "\uf4e4", style: "brands", search: "java programming language" },
  { name: "AWS", unicode: "\uf375", style: "brands", search: "aws amazon cloud" },
  { name: "Docker", unicode: "\uf395", style: "brands", search: "docker container devops" },
  { name: "Spotify", unicode: "\uf1bc", style: "brands", search: "spotify music streaming" },
  { name: "PayPal", unicode: "\uf1ed", style: "brands", search: "paypal payment money" },
  { name: "Stripe", unicode: "\uf42a", style: "brands", search: "stripe payment processing" },
  { name: "Figma", unicode: "\uf799", style: "brands", search: "figma design ui" },
  { name: "Dribbble", unicode: "\uf17d", style: "brands", search: "dribbble design portfolio" },
];

const SIZE_OPTIONS = [64, 128, 256, 512, 1024];
const COLOR_PRESETS = [
  { label: "Black", value: "#000000" },
  { label: "White", value: "#FFFFFF" },
  { label: "Red", value: "#EF4444" },
  { label: "Blue", value: "#3B82F6" },
  { label: "Green", value: "#10B981" },
];

export function IconToPngClient({ dict }: { dict?: any }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<IconItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [size, setSize] = useState(256);
  const [iconColor, setIconColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("transparent");
  const [bgTransparent, setBgTransparent] = useState(true);
  const [padding, setPadding] = useState(10);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load Font Awesome fonts
  useEffect(() => {
    const loadFonts = async () => {
      try {
        const solidFont = new FontFace(
          "Font Awesome 6 Free",
          "url(https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-solid-900.woff2)",
          { weight: "900" }
        );
        const regularFont = new FontFace(
          "Font Awesome 6 Free",
          "url(https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-regular-400.woff2)",
          { weight: "400" }
        );
        const brandsFont = new FontFace(
          "Font Awesome 6 Brands",
          "url(https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-brands-400.woff2)",
          { weight: "400" }
        );

        const [solid, regular, brands] = await Promise.all([
          solidFont.load(),
          regularFont.load(),
          brandsFont.load(),
        ]);

        document.fonts.add(solid);
        document.fonts.add(regular);
        document.fonts.add(brands);
        setFontsLoaded(true);
      } catch (err) {
        console.error("Failed to load Font Awesome fonts:", err);
      }
    };
    loadFonts();
  }, []);

  // Canvas rendering
  useEffect(() => {
    if (!selectedIcon || !fontsLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const paddingPx = Math.round(size * (padding / 100));
    const totalSize = size + paddingPx * 2;

    canvas.width = totalSize;
    canvas.height = totalSize;

    ctx.clearRect(0, 0, totalSize, totalSize);

    if (!bgTransparent) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, totalSize, totalSize);
    }

    const fontFamily =
      selectedIcon.style === "brands"
        ? "Font Awesome 6 Brands"
        : "Font Awesome 6 Free";
    const fontWeight = selectedIcon.style === "solid" ? "900" : "400";

    ctx.font = `${fontWeight} ${size}px "${fontFamily}"`;
    ctx.fillStyle = iconColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(selectedIcon.unicode, totalSize / 2, totalSize / 2);

    setPreviewUrl(canvas.toDataURL("image/png"));
  }, [selectedIcon, fontsLoaded, size, iconColor, bgColor, bgTransparent, padding]);

  const filteredIcons = ICONS.filter(
    (icon) =>
      icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      icon.search.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = () => {
    if (!previewUrl || !selectedIcon) return;
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = `${selectedIcon.name.toLowerCase().replace(/ /g, "-")}-${size}px.png`;
    link.click();
  };

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-6xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 mb-6">
          <Shapes className="w-10 h-10 text-orange-600 dark:text-orange-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.icon_to_png?.title || "Icon to PNG"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.icon_to_png?.subtitle ||
            "Convert Font Awesome icons to PNG images. Choose from 150+ popular icons, customize colors, size, and download instantly."}
        </p>

        <Adsense slotId="7759160077" />

        {!fontsLoaded ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading fonts...</span>
          </div>
        ) : (
          <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search icons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:border-gray-700"
              />
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-[400px] overflow-y-auto p-4 border rounded-xl dark:border-gray-800">
              {filteredIcons.map((icon) => (
                <button
                  key={icon.name}
                  onClick={() => setSelectedIcon(icon)}
                  className={`group flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedIcon?.name === icon.name
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700"
                  }`}
                  title={icon.name}
                >
                  <span
                    style={{
                      fontFamily:
                        icon.style === "brands"
                          ? '"Font Awesome 6 Brands"'
                          : '"Font Awesome 6 Free"',
                      fontWeight: icon.style === "solid" ? 900 : 400,
                      fontSize: "24px",
                    }}
                    className={
                      selectedIcon?.name === icon.name
                        ? "text-orange-600"
                        : "text-gray-700 dark:text-gray-300"
                    }
                  >
                    {icon.unicode}
                  </span>
                  <span className="text-xs mt-1 text-center text-muted-foreground truncate w-full group-hover:text-foreground">
                    {icon.name}
                  </span>
                </button>
              ))}
            </div>

            {selectedIcon && (
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="border-orange-100 dark:border-orange-900/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Customize Icon</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="text-sm font-medium mb-3 block">
                        Size (px)
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {SIZE_OPTIONS.map((s) => (
                          <button
                            key={s}
                            onClick={() => setSize(s)}
                            className={`px-3 py-2 rounded-lg border font-medium transition-all ${
                              size === s
                                ? "bg-orange-500 text-white border-orange-500"
                                : "border-gray-300 dark:border-gray-700 hover:border-orange-300"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-3 block">
                        Icon Color
                      </label>
                      <div className="flex gap-2 mb-2">
                        {COLOR_PRESETS.map((preset) => (
                          <button
                            key={preset.value}
                            onClick={() => setIconColor(preset.value)}
                            className={`w-10 h-10 rounded-lg border-2 transition-all ${
                              iconColor === preset.value
                                ? "border-orange-500 scale-110"
                                : "border-gray-300 dark:border-gray-700"
                            }`}
                            style={{ backgroundColor: preset.value }}
                            title={preset.label}
                          />
                        ))}
                      </div>
                      <input
                        type="color"
                        value={iconColor}
                        onChange={(e) => setIconColor(e.target.value)}
                        className="w-full h-10 rounded-lg border cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium">
                          Background
                        </label>
                        <button
                          onClick={() => setBgTransparent(!bgTransparent)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                            bgTransparent
                              ? "bg-orange-500 text-white"
                              : "bg-gray-200 dark:bg-gray-700"
                          }`}
                        >
                          {bgTransparent ? "Transparent" : "Solid"}
                        </button>
                      </div>
                      {!bgTransparent && (
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-full h-10 rounded-lg border cursor-pointer"
                        />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium">
                          Padding: {padding}%
                        </label>
                      </div>
                      <Slider
                        value={[padding]}
                        onValueChange={(val) => setPadding(val[0])}
                        min={0}
                        max={30}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-orange-100 dark:border-orange-900/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="flex items-center justify-center p-8 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 mb-4"
                      style={{
                        background: bgTransparent
                          ? "repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%) 50% / 20px 20px"
                          : bgColor,
                      }}
                    >
                      {previewUrl && (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-w-full"
                          style={{ imageRendering: "crisp-edges" }}
                        />
                      )}
                    </div>
                    <Button
                      onClick={handleDownload}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PNG
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}
      </div>

      <div className="w-full max-w-6xl mx-auto mt-12 px-4 space-y-16">
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.icon_to_png?.guide_title || "How to Convert Icons to PNG"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {dict?.icon_to_png?.guide_desc ||
                "Create custom PNG icons in 3 simple steps."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title: dict?.icon_to_png?.step1_title || "Select Icon",
                desc:
                  dict?.icon_to_png?.step1_desc ||
                  "Browse and search through 150+ Font Awesome icons. Click to select your favorite.",
                icon: Search,
              },
              {
                step: 2,
                title: dict?.icon_to_png?.step2_title || "Customize",
                desc:
                  dict?.icon_to_png?.step2_desc ||
                  "Choose size, icon color, background, and padding to match your design needs.",
                icon: Palette,
              },
              {
                step: 3,
                title:
                  dict?.icon_to_png?.step3_title || "Download PNG",
                desc:
                  dict?.icon_to_png?.step3_desc ||
                  "Download your customized icon as a high-quality PNG with transparency support.",
                icon: ImageIconLucide,
              },
            ].map((step) => (
              <Card
                key={step.step}
                className="border-orange-100 dark:border-orange-900/50"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 text-white font-bold">
                      {step.step}
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.icon_to_png?.tips_title || "Icon Conversion Tips"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.icon_to_png?.tips_desc ||
                "Get the best results from your icon conversions."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title:
                  dict?.icon_to_png?.tip1_title || "Choose the Right Size",
                desc:
                  dict?.icon_to_png?.tip1_desc ||
                  "Use 64px for favicons, 128-256px for UI elements, and 512-1024px for high-resolution displays or print.",
                icon: Upload,
              },
              {
                title:
                  dict?.icon_to_png?.tip2_title || "Transparent Background",
                desc:
                  dict?.icon_to_png?.tip2_desc ||
                  "Enable transparent background for versatile icons that work on any background color or pattern.",
                icon: CheckCircle2,
              },
              {
                title: dict?.icon_to_png?.tip3_title || "Add Padding",
                desc:
                  dict?.icon_to_png?.tip3_desc ||
                  "Use 10-15% padding for breathing room around icons, especially for buttons or touch targets.",
                icon: Shapes,
              },
              {
                title:
                  dict?.icon_to_png?.tip4_title || "Color Contrast",
                desc:
                  dict?.icon_to_png?.tip4_desc ||
                  "Ensure good contrast between icon and background colors for accessibility and visibility.",
                icon: Palette,
              },
            ].map((tip, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
              >
                <div className="flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.qna_icon_to_png?.title || "Icon to PNG FAQ"}
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
              {dict?.qna_icon_to_png?.desc ||
                "Common questions about converting icons to PNG."}
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {[1, 2, 3, 4, 5].map((num) => (
                <AccordionItem key={num} value={`item-${num}`}>
                  <AccordionTrigger>
                    {dict?.qna_icon_to_png?.[`faq_${num}_q`] ||
                      `Question ${num}`}
                  </AccordionTrigger>
                  <AccordionContent>
                    {dict?.qna_icon_to_png?.[`faq_${num}_a`] ||
                      `Answer to question ${num}`}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </div>
    </div>
  );
}
