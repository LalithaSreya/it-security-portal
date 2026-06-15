import { useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { Shield, Menu } from "lucide-react"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { name: "Home", to: "/about-us" },
    { name: "About Us", to: "/about-us/about" },
    { name: "Services", to: "/about-us/services" },
    { name: "Gallery", to: "/about-us/gallery" },
    { name: "Contact", to: "/about-us/contact" },
  ]

  const activeClassName = "text-primary font-semibold"
  const inactiveClassName = "text-muted-foreground hover:text-foreground transition-colors font-medium"

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/about-us" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm shadow-primary/30 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-foreground">
            SECURE<span className="text-primary">IT</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? activeClassName : inactiveClassName)}
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button asChild className="hidden md:inline-flex rounded-full">
            <Link to="/about-us/contact">Request Quote</Link>
          </Button>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] flex flex-col justify-between p-6">
              <div>
                <SheetHeader className="border-b pb-4 mb-6">
                  <SheetTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <span>SECUREIT Portal</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) => 
                        `text-lg py-2 ${isActive ? activeClassName : inactiveClassName}`
                      }
                    >
                      {link.name}
                    </NavLink>
                  ))}
                </nav>
              </div>

              <div className="border-t pt-4">
                <Button asChild className="w-full rounded-xl" onClick={() => setIsOpen(false)}>
                  <Link to="/about-us/contact">Get a Free Quote</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
