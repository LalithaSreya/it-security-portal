import { useState } from "react"
import { Eye, ShieldCheck } from "lucide-react"

interface GalleryItem {
  id: number
  title: string
  category: "cctv" | "access" | "fire" | "network"
  image: string
  client: string
  location: string
}

const galleryItems: GalleryItem[] = [
  {
    id: 1,
    title: "Enterprise IP Camera Deployment",
    category: "cctv",
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80",
    client: "TechCorp Headquarters",
    location: "Silicon Valley, CA"
  },
  {
    id: 2,
    title: "Biometric & Turnstile Access Control",
    category: "access",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
    client: "Fintech Plaza",
    location: "San Francisco, CA"
  },
  {
    id: 3,
    title: "Addressable Fire Detection Install",
    category: "fire",
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=800&q=80",
    client: "Metro Logistics Park",
    location: "Oakland, CA"
  },
  {
    id: 4,
    title: "Structured Network Cabling & Server Rack Setup",
    category: "network",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    client: "Apex Data Center",
    location: "San Jose, CA"
  },
  {
    id: 5,
    title: "PTZ Dome Camera Outdoor Surveillance",
    category: "cctv",
    image: "https://images.unsplash.com/photo-1528319725582-ddc096101511?auto=format&fit=crop&w=800&q=80",
    client: "Highrise Apartment Complex",
    location: "Los Angeles, CA"
  },
  {
    id: 6,
    title: "Smart Card Reader & Lock Integration",
    category: "access",
    image: "https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?auto=format&fit=crop&w=800&q=80",
    client: "Innovate Coworking",
    location: "Palo Alto, CA"
  }
]

export default function Gallery() {
  const [filter, setFilter] = useState<string>("all")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const filteredItems = filter === "all" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === filter)

  return (
    <div className="container mx-auto px-6 py-16 md:py-24">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
          Our Project Gallery
        </h1>
        <p className="text-lg text-muted-foreground">
          Explore our portfolio of high-security installations, cabling solutions, and network deployments across commercial and residential sites.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
        {["all", "cctv", "access", "fire", "network"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
              filter === cat
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
            }`}
          >
            {cat === "all" ? "All Projects" : cat === "cctv" ? "CCTV Security" : cat === "access" ? "Access Control" : cat === "fire" ? "Fire Systems" : "Network & Racks"}
          </button>
        ))}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.map((item) => (
          <div 
            key={item.id}
            className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md"
          >
            {/* Image Container */}
            <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {/* Overlay */}
              <div 
                onClick={() => setSelectedImage(item.image)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/30 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                  <Eye className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Info details */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                  {item.category}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Certified
                </span>
              </div>
              <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors line-clamp-1">
                {item.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {item.client} &bull; {item.location}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Modal */}
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
              className="absolute -top-10 right-0 text-white hover:text-primary text-sm font-semibold bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm"
            >
              Close [✕]
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
