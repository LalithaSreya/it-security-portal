import { Link } from "react-router-dom"
import { Shield, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, ShieldAlert } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-card border-t text-muted-foreground transition-colors duration-300">
      <div className="container mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Brief */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5 text-foreground">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm shadow-primary/20">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                SECURE<span className="text-primary">IT</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm">
              Providing enterprise-grade security systems, surveillance integrations, access controls, and maintenance contracts. Protecting your assets, safeguarding your future.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-muted hover:text-primary transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-muted hover:text-primary transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-muted hover:text-primary transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-foreground font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about-us" className="hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about-us/about" className="hover:text-primary transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/about-us/services" className="hover:text-primary transition-colors">Services Directory</Link>
              </li>
              <li>
                <Link to="/about-us/gallery" className="hover:text-primary transition-colors">Project Gallery</Link>
              </li>
              <li>
                <Link to="/about-us/contact" className="hover:text-primary transition-colors">Request a Quote</Link>
              </li>
            </ul>
          </div>

          {/* Featured Services */}
          <div>
            <h4 className="text-foreground font-semibold mb-4 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about-us/services/cctv-installation" className="hover:text-primary transition-colors">CCTV Installation</Link>
              </li>
              <li>
                <Link to="/about-us/services/access-control" className="hover:text-primary transition-colors">Access Control</Link>
              </li>
              <li>
                <Link to="/about-us/services/fire-alarm" className="hover:text-primary transition-colors">Fire Alarm Systems</Link>
              </li>
              <li>
                <Link to="/about-us/services/biometric-system" className="hover:text-primary transition-colors">Biometric Systems</Link>
              </li>
              <li>
                <Link to="/about-us/services/amc-service" className="hover:text-primary transition-colors">Annual Maintenance (AMC)</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-foreground font-semibold text-sm uppercase tracking-wider">Get in Touch</h4>
            <div className="space-y-3 text-sm">
              <a 
                href="https://maps.google.com/?q=100+Security+Plaza,+Suite+400,+Tech+Valley,+CA+94012" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-start gap-2.5 hover:text-primary transition-colors"
              >
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span>100 Security Plaza, Suite 400, Tech Valley, CA 94012</span>
              </a>
              <a 
                href="tel:+15551234567" 
                className="flex items-center gap-2.5 hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>+1 (555) 123-4567</span>
              </a>
              <a 
                href="mailto:info@secureit-solutions.com" 
                className="flex items-center gap-2.5 hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>info@secureit-solutions.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>&copy; {currentYear} SECUREIT Solutions Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <Link to="/portal" className="inline-flex items-center gap-1 text-primary hover:underline font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" />
              Employee Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
