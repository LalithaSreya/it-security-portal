import { Link } from "react-router-dom"
import { 
  ShieldCheck, 
  Camera, 
  Key, 
  Flame, 
  ArrowRight, 
  Users, 
  Award, 
  Clock, 
  ThumbsUp,
  Star
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const featuredServices = [
    {
      id: "cctv-installation",
      title: "CCTV Surveillance Systems",
      desc: "High-definition, AI-powered security cameras with remote access and cloud storage solutions.",
      icon: Camera,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      id: "access-control",
      title: "Biometric & Access Control",
      desc: "Ensure only authorized access to your facilities using fingerprint, card, and face recognition readers.",
      icon: Key,
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      id: "fire-alarm",
      title: "Fire Protection & Alarms",
      desc: "State-of-the-art fire and smoke detection systems certified to meet safety regulations.",
      icon: Flame,
      color: "text-red-500 bg-red-500/10",
    },
  ]

  const benefits = [
    {
      title: "Certified Experts",
      desc: "Our engineers are factory-trained and fully certified in all security integrations.",
      icon: Award,
    },
    {
      title: "24/7 Monitoring & Support",
      desc: "Around-the-clock remote monitoring and priority technical support whenever you need it.",
      icon: Clock,
    },
    {
      title: "Customized Engineering",
      desc: "Tailored designs specifically fitted for your office, warehouse, or residential complex.",
      icon: ShieldCheck,
    },
    {
      title: "Reliable Quality",
      desc: "We source only industry-leading, grade-A security equipment with warranties.",
      icon: ThumbsUp,
    },
  ]

  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "Operations Director, Innovate Hub",
      quote: "SECUREIT upgraded our entire facility's access control and CCTV. The integration was seamless, and the manager-assigned technician was highly professional.",
      rating: 5,
    },
    {
      name: "Marcus Aurelius",
      role: "Security Head, Nexus Warehousing",
      quote: "Their annual maintenance contract (AMC) is the best decision we made. Fast response time, regular checkups, and zero downtime so far.",
      rating: 5,
    },
  ]

  return (
    <div className="flex flex-col gap-20 pb-20 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center border-b bg-gradient-to-br from-blue-50/50 via-background to-indigo-50/30 dark:from-slate-950/40 dark:via-background dark:to-indigo-950/30 py-20">
        {/* Decorative background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-600/10 pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/10 pointer-events-none" />

        <div className="container relative mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border bg-muted/50 text-xs font-semibold text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Next-Gen Protection & Automation
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-none text-foreground">
              Securing Your Business <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                Protecting Your Future
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              We design, install, and support advanced IT security systems, biometric access controls, and smart surveillance to keep your infrastructure safe and connected.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="rounded-full shadow-md shadow-primary/20" asChild>
                <Link to="/contact">
                  Schedule Free Site Survey
                  <ArrowRight className="w-4.5 h-4.5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full" asChild>
                <Link to="/services">Explore Our Services</Link>
              </Button>
            </div>

            {/* Quick stats banner */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t max-w-lg mx-auto lg:mx-0">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-foreground">99.9%</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Uptime Guarantee</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-foreground">500+</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Clients Protected</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-foreground">10+</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Years Experience</p>
              </div>
            </div>
          </div>

          {/* Hero Right Interactive Mockup / Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[420px] aspect-square rounded-3xl border bg-card/60 backdrop-blur-md p-6 shadow-2xl flex flex-col justify-between overflow-hidden group">
              {/* Decorative radial background */}
              <div className="absolute inset-0 bg-radial-gradient from-primary/10 via-transparent to-transparent pointer-events-none" />
              
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">SECURE-MONITOR // ACTIVE</span>
              </div>

              <div className="flex-grow flex flex-col justify-center items-center py-6 text-center">
                <div className="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 border border-primary/20 group-hover:scale-105 transition-transform duration-500">
                  <Camera className="w-12 h-12" />
                  <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-red-500 border-2 border-card rounded-full animate-ping" />
                  <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-red-500 border-2 border-card rounded-full" />
                </div>
                <h4 className="font-bold text-lg text-foreground">Front Lobby Camera (CAM-01)</h4>
                <p className="text-xs text-muted-foreground mt-1">Live Feed &bull; 1080p @ 60fps &bull; AI Tracking On</p>
              </div>

              <div className="border-t pt-4 flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span>IP: 192.168.1.104</span>
                <span>RSSI: -45dBm (Excellent)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COMPANY INTRODUCTION */}
      <section className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Who We Are
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Founded on the principles of trust, reliability, and advanced engineering, SECUREIT provides state-of-the-art surveillance, access control, and fire detection systems. We work closely with real estate, government, corporate, and residential clients to deliver tailor-made safety solutions.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our mission is to empower teams and families with technology, ensuring absolute safety, business continuity, and comprehensive oversight of physical environments.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" asChild>
                <Link to="/about">More About Our Team</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 border rounded-2xl bg-card text-center space-y-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-foreground">Expert Staff</h4>
              <p className="text-xs text-muted-foreground">Certified engineers at your disposal</p>
            </div>
            <div className="p-6 border rounded-2xl bg-card text-center space-y-2">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-foreground">Verified Safety</h4>
              <p className="text-xs text-muted-foreground">Compliant with all state guidelines</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED SERVICES */}
      <section className="bg-muted/30 border-y py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-3">
                Featured Services
              </h2>
              <p className="text-muted-foreground">
                Delivering industry-grade systems engineered to meet modern security threats.
              </p>
            </div>
            <Link to="/services" className="mt-4 md:mt-0 inline-flex items-center text-sm font-semibold text-primary hover:underline">
              View All Services
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredServices.map((service) => {
              const IconComponent = service.icon
              return (
                <div key={service.id} className="group p-6 border bg-card rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50 flex flex-col justify-between h-full">
                  <div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${service.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm mb-6">
                      {service.desc}
                    </p>
                  </div>
                  <Link to={`/services/${service.id}`} className="text-sm font-semibold text-primary inline-flex items-center group-hover:underline">
                    View System Details
                    <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US */}
      <section className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            Why Choose SECUREIT?
          </h2>
          <p className="text-lg text-muted-foreground">
            We go beyond simple installations. We architect resilient systems designed for maximum protection and ease of use.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon
            return (
              <div key={i} className="p-6 border rounded-2xl bg-card space-y-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-foreground">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="bg-muted/30 border-y py-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              Client Testimonials
            </h2>
            <p className="text-muted-foreground">
              What our business and residential clients say about our work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((t, i) => (
              <div key={i} className="p-8 border rounded-2xl bg-card shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-4 text-amber-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic leading-relaxed text-sm mb-6">
                    "{t.quote}"
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">{t.name}</h4>
                  <p className="text-xs text-primary">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CONTACT CTA */}
      <section className="container mx-auto px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 md:p-16 text-center shadow-xl">
          {/* Decorative shapes */}
          <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-white/15 blur-3xl" />

          <div className="relative max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              Ready to Upgrade Your Security Infrastructure?
            </h2>
            <p className="text-blue-100 md:text-lg leading-relaxed max-w-xl mx-auto">
              Contact us today to book your free on-site safety survey and customized system recommendation.
            </p>
            <div className="pt-2">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 rounded-full shadow-lg font-bold" asChild>
                <Link to="/contact">Get Started Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
