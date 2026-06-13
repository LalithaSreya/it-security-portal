import { Link } from "react-router-dom"
import { 
  Camera, 
  Wrench, 
  Key, 
  Flame, 
  PhoneCall, 
  Fingerprint, 
  FileText, 
  Headphones 
} from "lucide-react"

export const servicesData = [
  {
    id: "cctv-installation",
    title: "CCTV Installation",
    description: "Professional surveillance system setup tailored to your residential or commercial space, providing 24/7 security monitoring.",
    icon: Camera,
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    id: "cctv-maintenance",
    title: "CCTV Maintenance",
    description: "Routine checkups, camera cleaning, wiring checks, and system troubleshooting to ensure uninterrupted coverage.",
    icon: Wrench,
    color: "text-teal-500 bg-teal-500/10",
  },
  {
    id: "access-control",
    title: "Access Control Systems",
    description: "Regulate entry into secure areas with advanced card readers, keypad locks, and computerized credential systems.",
    icon: Key,
    color: "text-amber-500 bg-amber-500/10",
  },
  {
    id: "fire-alarm",
    title: "Fire Alarm Systems",
    description: "Install and service state-of-the-art smoke detectors, alarm sounders, and central monitoring system integrations.",
    icon: Flame,
    color: "text-red-500 bg-red-500/10",
  },
  {
    id: "video-door-phone",
    title: "Video Door Phones",
    description: "Verify visitors at your doorstep before letting them in, using high-definition audio-visual intercom devices.",
    icon: PhoneCall,
    color: "text-purple-500 bg-purple-500/10",
  },
  {
    id: "biometric-system",
    title: "Biometric Systems",
    description: "Implement fingerprint, iris, or facial recognition systems for secure employee attendance and area entry.",
    icon: Fingerprint,
    color: "text-emerald-500 bg-emerald-500/10",
  },
  {
    id: "amc-service",
    title: "Annual Maintenance Contracts (AMC)",
    description: "Comprehensive annual maintenance packages covering all IT, security, and networking infrastructure.",
    icon: FileText,
    color: "text-indigo-500 bg-indigo-500/10",
  },
  {
    id: "technical-support",
    title: "Technical Support Services",
    description: "On-demand troubleshooting, network support, and tech consulting provided by our certified engineers.",
    icon: Headphones,
    color: "text-rose-500 bg-rose-500/10",
  },
]

export default function Services() {
  return (
    <div className="container mx-auto px-6 py-16 md:py-24">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
          Our Professional Services
        </h1>
        <p className="text-lg text-muted-foreground">
          We engineer, install, and maintain high-grade security and automation systems for homes, businesses, and industrial enterprises.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {servicesData.map((service) => {
          const IconComponent = service.icon
          return (
            <div 
              key={service.id} 
              className="group relative flex flex-col justify-between p-6 bg-card border rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50"
            >
              <div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${service.color}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {service.description}
                </p>
              </div>
              <Link 
                to={`/services/${service.id}`}
                className="inline-flex items-center text-sm font-semibold text-primary group-hover:underline"
              >
                Learn More
                <svg className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
