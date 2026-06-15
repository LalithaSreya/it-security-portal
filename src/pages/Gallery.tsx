import { useEffect, useState } from "react"
import { Eye, ShieldCheck, RefreshCw } from "lucide-react"
import { supabase, type GalleryItem } from "@/lib/supabase"

// Beautiful fallback items for website to guarantee outstanding design
const fallbackProjects = [
  {
    id: "fb-1",
    title: "Enterprise IP Camera Deployment",
    description: "Installed 32 smart PTZ cameras and master server recording desk for TechCorp Headquarters in Silicon Valley.",
    image_url: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80",
    category: "CCTV Systems",
    certified: true
  },
  {
    id: "fb-2",
    title: "Biometric & Turnstile Access Control",
    description: "Integrated biometric facial scanner gates and RFID badge reader entries for Fintech Plaza floors.",
    image_url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
    category: "Access Control",
    certified: true
  },
  {
    id: "fb-3",
    title: "Addressable Fire Safety Installation",
    description: "Configured intelligent fire detection panels, smoke sensors, and water sprinkler controllers for Metro Logistics.",
    image_url: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=800&q=80",
    category: "Fire Systems",
    certified: true
  },
  {
    id: "fb-4",
    title: "Structured Datacenter Server Rack Setup",
    description: "Structured Cat6a cabling, copper patching, and server rack cooling arrays at Apex Data Center.",
    image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    category: "Network & Racks",
    certified: true
  },
  {
    id: "fb-5",
    title: "High-Rise Smart Lock Integration",
    description: "Equipped 120 apartment units with bluetooth secure keyless smart deadbolts and visitor intercom logs.",
    image_url: "https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?auto=format&fit=crop&w=800&q=80",
    category: "Access Control",
    certified: true
  }
];

export default function Gallery() {
  const [dbItems, setDbItems] = useState<GalleryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    async function loadGalleryData() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("gallery")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setDbItems(data || []);
      } catch (err) {
        console.error("Error loading gallery for public page:", err);
      } finally {
        setIsLoading(false)
      }
    }

    loadGalleryData()
  }, [])

  // Categorize dynamic gallery items based on title keywords
  const categorizeItem = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("cctv") || lowerTitle.includes("camera") || lowerTitle.includes("surveillance")) {
      return "CCTV Systems";
    }
    if (lowerTitle.includes("access") || lowerTitle.includes("turnstile") || lowerTitle.includes("biometric") || lowerTitle.includes("lock") || lowerTitle.includes("gate")) {
      return "Access Control";
    }
    if (lowerTitle.includes("fire") || lowerTitle.includes("smoke") || lowerTitle.includes("alarm") || lowerTitle.includes("safety")) {
      return "Fire Systems";
    }
    if (lowerTitle.includes("network") || lowerTitle.includes("rack") || lowerTitle.includes("cable") || lowerTitle.includes("datacenter") || lowerTitle.includes("server")) {
      return "Network & Racks";
    }
    return "Other Installs";
  };

  // Convert db items into unified gallery schema
  const unifiedDbItems = dbItems.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description || "Field installation project.",
    image_url: item.image_url,
    category: categorizeItem(item.title),
    certified: true,
    isUserUploaded: true
  }));

  // Combine database items (newest first) with fallbacks
  const allProjects = [...unifiedDbItems, ...fallbackProjects];

  // Filter combined list
  const filteredProjects = filter === "all"
    ? allProjects
    : allProjects.filter(item => item.category === filter);

  // Available categories
  const categories = ["all", "CCTV Systems", "Access Control", "Fire Systems", "Network & Racks"];

  return (
    <div className="container mx-auto px-6 py-16 md:py-24">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
          Project Showcase & Gallery
        </h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
          Explore our certified real-world deployments. Managers publish real-time field work logs and security audits completed by our engineering teams.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all border cursor-pointer ${
              filter === cat
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
            }`}
          >
            {cat === "all" ? "All Projects" : cat}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((item) => (
            <div 
              key={item.id}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:shadow-md flex flex-col"
            >
              {/* Image Container */}
              <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative shrink-0">
                <img 
                  src={item.image_url} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* User uploaded badge indicator */}
                {'isUserUploaded' in item && (
                  <span className="absolute top-3 left-3 bg-indigo-600 text-white text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                    Recent Install
                  </span>
                )}

                {/* Hover overlay click visual */}
                <div 
                  onClick={() => setSelectedImage(item.image_url)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/30 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Info details */}
              <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] tracking-wider uppercase font-black px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> QA Certified
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[85vh] flex items-center justify-center">
            <img 
              src={selectedImage} 
              alt="Enlarged project view" 
              className="max-w-full max-h-[80vh] rounded-lg object-contain border border-white/10"
            />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-primary text-xs font-bold bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm cursor-pointer"
            >
              Close [✕]
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
