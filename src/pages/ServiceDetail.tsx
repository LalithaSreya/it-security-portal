import type { ComponentType } from "react"
import { useParams, Link } from "react-router-dom"
import { 
  Camera, Wrench, Key, Flame, PhoneCall, Fingerprint, FileText, Headphones,
  CheckCircle2, ArrowRight, HelpCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface ServiceDetail {
  title: string
  subtitle: string
  icon: ComponentType<{ className?: string }>
  color: string
  description: string
  benefits: string[]
  process: string[]
  features: string[]
  faqs: { q: string; a: string }[]
}

const serviceDetailsData: Record<string, ServiceDetail> = {
  "cctv-installation": {
    title: "CCTV Installation",
    subtitle: "High-definition video surveillance systems tailored for absolute coverage",
    icon: Camera,
    color: "text-blue-500 bg-blue-500/10",
    description: "Keep 24/7 vigil over your properties with our professional CCTV installation services. We analyze your premises to eliminate blind spots and install high-definition (HD), IP, and wireless cameras with cloud access, so you can monitor your home or business anytime, anywhere.",
    benefits: [
      "Deter property theft, vandalism, and unauthorized access.",
      "Monitor daily business operations and employee safety remotely.",
      "Collect high-definition evidence in the event of an incident.",
      "Reduce insurance premiums through certified surveillance systems."
    ],
    process: [
      "Site Survey & Blind Spot Analysis: We inspect your property to plan the optimal camera layout.",
      "Custom Design: We choose the right camera types (dome, bullet, PTZ) and network video recorders (NVR).",
      "Professional Installation: Neat routing of cables (PoE/Fiber) and secure mounting of equipment.",
      "Network Setup & Calibration: Configuring router settings, mobile apps, and cloud recording features.",
      "Training & Handover: We guide you through the app controls and settings interface."
    ],
    features: [
      "4K Ultra-HD Resolution & Night Vision",
      "Intelligent Motion Detection & Intrusion Alerts",
      "Remote Live Streaming via Mobile & Web Apps",
      "Weatherproof IP67-rated cameras for outdoor use"
    ],
    faqs: [
      { q: "Can I watch the camera feed on my phone?", a: "Yes, all our systems support secure, live streaming via iOS and Android apps with no additional subscription costs." },
      { q: "What happens if the internet goes down?", a: "Your system will still record locally to the NVR hard drive. Live remote view will resume once the internet connection is restored." },
      { q: "How long does a typical installation take?", a: "Residential installations take 1 day, while commercial setups depend on the size and typically take 2-5 days." }
    ]
  },
  "cctv-maintenance": {
    title: "CCTV Maintenance",
    subtitle: "Preventative care and repair to keep your security systems fully operational",
    icon: Wrench,
    color: "text-teal-500 bg-teal-500/10",
    description: "Surveillance systems need periodic maintenance to operate at peak reliability. Our maintenance service includes detailed cleaning of camera lenses, adjusting angles, checking wires for wear, updating firmware, and ensuring that your backup storage is performing optimally.",
    benefits: [
      "Maximize system uptime and avoid critical recording gaps.",
      "Extend the lifespan of your camera hardware and storage disks.",
      "Maintain crystal-clear image quality through routine lens cleaning.",
      "Identify and repair minor wiring issues before they cause total system failure."
    ],
    process: [
      "Physical Inspection: Check cameras for damage, lens cleanliness, and correct alignment.",
      "Connection & Cable Audit: Test video cables, PoE injectors, and power supplies.",
      "NVR/DVR Health Check: Verify hard drive health, formatting, and database integrity.",
      "Firmware Updates: Update camera and recorder software to patch security vulnerabilities.",
      "Performance Report: We provide a comprehensive checklist and status summary of each camera."
    ],
    features: [
      "Lens cleaning and refocusing",
      "NVR storage testing and bad sector checks",
      "Voltage and power supply stability testing",
      "Priority response for system-wide failures"
    ],
    faqs: [
      { q: "How often should CCTV systems be maintained?", a: "We recommend professional maintenance at least twice a year for commercial properties and once a year for residential systems." },
      { q: "Do you maintain systems installed by other companies?", a: "Yes! Our technicians are experienced with almost all major brands (Hikvision, Dahua, Axis, Hanwha, etc.) and can perform maintenance on existing systems." }
    ]
  },
  "access-control": {
    title: "Access Control Systems",
    subtitle: "Ensure secure entry points and manage personnel access seamlessly",
    icon: Key,
    color: "text-amber-500 bg-amber-500/10",
    description: "Manage who enters your premises, when they enter, and which areas they are allowed to access. Our electronic access control solutions replace traditional keys with keycards, RFID fobs, PIN pads, and mobile credentials, providing a detailed log of every entry event.",
    benefits: [
      "Eliminate the risk of lost keys and the need to rekey doors.",
      "Restricted access to sensitive areas like server rooms and stockrooms.",
      "Detailed, downloadable audit trails of all entries and exits.",
      "Instant revocation of credentials for former employees."
    ],
    process: [
      "Requirement Gathering: Map out the access levels of different user groups.",
      "Hardware Installation: Mounting electromagnetic locks, door controllers, and readers.",
      "Integration: Connecting the controllers to the central management server.",
      "Software Config: Setting up user profiles, access groups, and schedules.",
      "Testing: Rigorous testing of fail-safes and fire alarm integrations."
    ],
    features: [
      "RFID, Keypad, and Mobile App Credentials",
      "Integration with Fire Alarm Systems (Fail-Safe Release)",
      "Time-restricted access configurations",
      "Anti-passback protection"
    ],
    faqs: [
      { q: "What happens during a power outage?", a: "Our installations include backup battery units that keep the access control system working for up to 8-12 hours during an outage." },
      { q: "Can this system integrate with our fire alarms?", a: "Absolutely. In fact, it is required by safety codes. In the event of a fire alarm trigger, the locks automatically release to allow safe evacuation." }
    ]
  },
  "fire-alarm": {
    title: "Fire Alarm Systems",
    subtitle: "Certified smoke detection and fire alarm systems to protect life and property",
    icon: Flame,
    color: "text-red-500 bg-red-500/10",
    description: "Keep your workspace compliant and safe with advanced fire detection systems. We provide addressable and conventional fire alarm panels, smoke detectors, heat detectors, and manual call points that detect combustion at the earliest stage, notifying occupants and emergency responders immediately.",
    benefits: [
      "Compliance with local fire safety codes and building regulations.",
      "Early warning to minimize property damage and protect human lives.",
      "Integration with automated sprinklers, HVAC systems, and access control.",
      "Reduced business insurance premiums through certified installations."
    ],
    process: [
      "Blueprint Assessment: Evaluate building layout against national fire safety codes.",
      "System Design: Map the placement of detectors, sirens, strobe lights, and panels.",
      "Cabling & Installation: Use fire-rated cables and mount detectors in key locations.",
      "System Integration: Link the fire panel to HVAC dampers, elevators, and exit doors.",
      "Testing & Certification: Conduct official testing for authority sign-off."
    ],
    features: [
      "Addressable loops for pinpointing the exact location of a fire",
      "Dual-path fire alarm communicators (cellular & IP)",
      "Smoke, heat, and carbon monoxide sensing",
      "Strobe lights and high-decibel audio alarms"
    ],
    faqs: [
      { q: "What is the difference between conventional and addressable systems?", a: "Conventional systems tell you the general zone (e.g., 'Second Floor'), while addressable systems tell you the exact detector (e.g., 'Office 204 Smoke Detector') for faster response." },
      { q: "How often do fire alarms need testing?", a: "Most local regulations require monthly user testing and annual professional inspection/certification." }
    ]
  },
  "video-door-phone": {
    title: "Video Door Phones",
    subtitle: "See and speak with visitors at your door from anywhere in the world",
    icon: PhoneCall,
    color: "text-purple-500 bg-purple-500/10",
    description: "Video door phones bridge the gap between security and convenience. Whether for a luxury home, apartment complex, or commercial reception, our systems let you visually verify visitors, talk to them via intercom, and remotely unlock gates or doors through a wall monitor or mobile app.",
    benefits: [
      "Prevents package theft and unauthorized solicitations.",
      "Convenient mobile app integration for answering the door remotely.",
      "Snapshot storage of missed visitors who rang the bell.",
      "Locks integrate directly with the intercom for instant guest entry."
    ],
    process: [
      "Site Evaluation: Plan the gate/door station and interior display monitor placements.",
      "Wiring & Setup: Run Cat6 or multi-core cables from the outdoor gate to the indoor monitor.",
      "System Commissioning: Configure the camera angles, audio levels, and Wi-Fi link.",
      "App Setup: Connect residents' smartphones to the inter-connectivity hub.",
      "Testing: Verification of two-way audio, crystal-clear video, and electronic lock release."
    ],
    features: [
      "1080p Full-HD Camera with Wide-Angle Lens",
      "Two-way audio intercom with noise cancellation",
      "Electric strike/magnetic lock control from indoor monitor or mobile app",
      "Night vision infrared LEDs"
    ],
    faqs: [
      { q: "Can I open the gate remotely if I'm not at home?", a: "Yes. By linking the system to our cloud app, you can view the camera, speak to visitors, and unlock the door or gate from anywhere via internet." },
      { q: "Can multiple monitors be installed in one house?", a: "Yes, we can link multiple indoor monitors (e.g., one on each floor) so you can answer the door from different parts of your house." }
    ]
  },
  "biometric-system": {
    title: "Biometric Systems",
    subtitle: "High-security user authentication for time, attendance, and access control",
    icon: Fingerprint,
    color: "text-emerald-500 bg-emerald-500/10",
    description: "Upgrade your enterprise security with biometric systems that use unique physical traits—fingerprints, face structure, or iris patterns. This prevents 'buddy punching' (employees clocking in for others) and ensures that only authorized personnel can enter high-security rooms.",
    benefits: [
      "Unmatched security: biometric credentials cannot be copied, shared, or lost.",
      "Accurate time and attendance tracking with automated payroll integration.",
      "Fast verification speed, reducing queues at employee entrances.",
      "Modern, professional aesthetic that elevates corporate facilities."
    ],
    process: [
      "Infrastructure Mapping: Identify door locations and network requirements.",
      "Terminal Mounting: Install fingerprint scanners, facial scanners, and exit buttons.",
      "Database Configuration: Set up Central Management Software on a local server or cloud.",
      "User Enrollment: Capture and register initial biometric profiles for employees.",
      "System Handover: Train HR and IT staff on generating attendance reports."
    ],
    features: [
      "Optical/capacitive fingerprint sensors & AI facial recognition",
      "Real-time logging with TCP/IP network connection",
      "Backup battery support and USB offline data export",
      "Dual verification modes (card + finger, PIN + face)"
    ],
    faqs: [
      { q: "Are biometric templates secure? Is actual fingerprint data saved?", a: "No, the system does not store images of your fingerprints. It converts points of your print into a mathematical hash that cannot be reverse-engineered back to a fingerprint image." },
      { q: "Does facial recognition work in dark rooms?", a: "Yes, our facial recognition terminals use infrared illumination to accurately detect and match faces even in total darkness." }
    ]
  },
  "amc-service": {
    title: "Annual Maintenance Contracts (AMC)",
    subtitle: "Comprehensive maintenance agreements for all your security systems",
    icon: FileText,
    color: "text-indigo-500 bg-indigo-500/10",
    description: "Avoid unexpected repair bills and long system downtime with our Annual Maintenance Contracts. We offer comprehensive and non-comprehensive AMCs where we take full responsibility for the health of your CCTV, Access Control, Fire Alarm, and IT network infrastructure.",
    benefits: [
      "Regular preventive maintenance visits scheduled throughout the year.",
      "Priority customer support with guaranteed rapid turnaround times.",
      "Highly reduced rates (or zero cost in comprehensive) for spare parts replacement.",
      "Ensures maximum system lifespan and optimal security performance."
    ],
    process: [
      "Equipment Inventory: We audit all existing devices and assess their current state.",
      "Custom SLA Creation: Draft service-level agreements matching your operational hours.",
      "Initial Servicing: Standardize the state of all equipment under contract.",
      "Routine Visits: Quarterly preventive maintenance and checkups.",
      "24/7 Priority Support: Fast response and dispatch of technicians during emergency breakdowns."
    ],
    features: [
      "Custom SLA agreements (4hr, 8hr, 24hr response times)",
      "Comprehensive (includes parts) and Non-comprehensive options",
      "Scheduled preventive maintenance checklists",
      "Dedicated account manager and technical support team"
    ],
    faqs: [
      { q: "What is the difference between comprehensive and non-comprehensive AMC?", a: "Comprehensive AMC includes the cost of all spare parts and repairs. Non-comprehensive covers only service, labor, and preventive checks; any required replacement parts are billed extra." },
      { q: "Are emergency visits included in the AMC price?", a: "Yes, a specified number of emergency breakdown visits are included in all of our annual contracts at no additional charge." }
    ]
  },
  "technical-support": {
    title: "Technical Support Services",
    subtitle: "Expert IT helpdesk, remote troubleshooting, and on-site support",
    icon: Headphones,
    color: "text-rose-500 bg-rose-500/10",
    description: "Get the expert assistance you need when your network, cameras, or computers experience issues. Our team of certified engineers offers remote diagnostic support, on-site hardware troubleshooting, and configuration help for routers, VPNs, switches, and server appliances.",
    benefits: [
      "Minimize downtime with immediate remote troubleshooting assistance.",
      "Access to certified network engineers and security specialists.",
      "Flexible ticketing: request help via phone, email, or client portal.",
      "Clear documentation provided for all resolutions and work completed."
    ],
    process: [
      "Ticket Logging: Customer reports the issue via phone, email, or portal.",
      "Remote Triage: Our helpdesk connects securely (if possible) to diagnose the problem.",
      "On-site Dispatch: If the issue is hardware-related, an engineer is dispatched to your site.",
      "Issue Resolution: Hardware repair, re-cabling, configuration adjustment, or update.",
      "Sign-off & Closing: Verify system functions perfectly and close the ticket."
    ],
    features: [
      "24/7 Telephone and Email Helpdesk",
      "Secure remote assistance desktop streaming",
      "Certified network configuration (VLANS, Firewalls, Port forwarding)",
      "Detailed post-incident resolution reports"
    ],
    faqs: [
      { q: "Do you offer remote support outside of business hours?", a: "Yes, our team provides 24/7 urgent support lines for clients under critical SLA contracts." },
      { q: "What brands of routers and firewalls do you support?", a: "We support Cisco, Ubiquiti, Fortinet, Sophos, MikroTik, TP-Link, and other enterprise-grade devices." }
    ]
  }
}

export default function ServiceDetail() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const service = serviceId ? serviceDetailsData[serviceId] : null

  if (!service) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Service Not Found</h2>
        <p className="text-muted-foreground mb-8">The service page you are looking for does not exist.</p>
        <Button asChild>
          <Link to="/services">Back to All Services</Link>
        </Button>
      </div>
    )
  }

  const IconComponent = service.icon

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative overflow-hidden py-16 lg:py-24 border-b bg-gradient-to-br from-blue-50/50 via-background to-indigo-50/30 dark:from-slate-950/40 dark:via-background dark:to-indigo-950/30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="container relative mx-auto px-6">
          <Link 
            to="/services" 
            className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <svg className="w-4 h-4 mr-2 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Back to Services
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12">
            <div className="flex-1">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${service.color}`}>
                <IconComponent className="w-8 h-8" />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 text-foreground">
                {service.title}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
                {service.subtitle}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left / Middle: Details */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Service Overview</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {service.description}
              </p>
            </div>

            {/* Features list */}
            <div className="p-6 bg-card border rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold mb-4">Key System Features</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Work Process */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Our Process</h2>
              <div className="relative border-l border-border pl-6 space-y-8 ml-3">
                {service.process.map((step, i) => {
                  const [title, desc] = step.split(":")
                  return (
                    <div key={i} className="relative">
                      <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full border-4 border-background bg-primary ring-2 ring-primary/20" />
                      <h4 className="text-lg font-bold text-foreground mb-1">{title}</h4>
                      <p className="text-muted-foreground">{desc}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* FAQs */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {service.faqs.map((faq, i) => (
                  <div key={i} className="border-b pb-6 last:border-0 last:pb-0">
                    <h4 className="text-lg font-semibold text-foreground mb-2 flex items-start gap-2">
                      <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      {faq.q}
                    </h4>
                    <p className="text-muted-foreground pl-7">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Sidebar / Benefits */}
          <div>
            <div className="sticky top-24 space-y-6">
              <div className="p-6 border rounded-2xl bg-card text-card-foreground shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-foreground">Why You Need This</h3>
                <ul className="space-y-4">
                  {service.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 border rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
                <h3 className="text-xl font-bold mb-2">Need a Custom Quote?</h3>
                <p className="text-blue-100 text-sm mb-6">
                  Contact our security experts today to arrange a free site survey and consultation.
                </p>
                <Button variant="secondary" className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold" asChild>
                  <Link to="/contact">
                    Get in Touch
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
