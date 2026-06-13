import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  city: z.string().min(2, { message: "Please specify your city." }),
  serviceRequired: z.enum([
    "CCTV Installation",
    "CCTV Maintenance",
    "Access Control",
    "Fire Alarm System",
    "Video Door Phone",
    "Biometric System",
    "AMC Service",
    "Technical Support",
    "Other"
  ]),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
})

type FormData = z.infer<typeof formSchema>

export default function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      city: "",
      serviceRequired: "CCTV Installation",
      message: "",
    }
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from("leads").insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        service_required: data.serviceRequired,
        message: data.message,
        status: "New",
      });

      if (error) throw error;

      setIsSubmitted(true)
      reset()
    } catch (err) {
      console.error("Failed to submit contact request:", err)
      alert("Failed to submit your request. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-6 py-16 md:py-24">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
          Get in Touch
        </h1>
        <p className="text-lg text-muted-foreground">
          Have questions or want to schedule a site survey? Reach out to our team of specialists today.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
        {/* Contact Info Sidebar */}
        <div className="space-y-8 lg:col-span-1">
          <div className="p-6 border rounded-2xl bg-card text-card-foreground shadow-sm">
            <h3 className="text-xl font-bold mb-6">Contact Information</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Phone</h4>
                  <p className="text-sm text-muted-foreground mt-1">+1 (555) 123-4567</p>
                  <p className="text-sm text-muted-foreground">+1 (555) 987-6543</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Email</h4>
                  <p className="text-sm text-muted-foreground mt-1">info@secureit-solutions.com</p>
                  <p className="text-sm text-muted-foreground">support@secureit-solutions.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Office Location</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    100 Security Plaza, Suite 400<br />
                    Tech Valley, CA 94012
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border border-dashed rounded-2xl bg-muted/40">
            <h4 className="font-semibold mb-2">Response Guarantee</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our support team reviews inquiries 24/7. Standard business queries receive a response within 2 hours.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center text-center p-12 border rounded-2xl bg-card shadow-sm h-full">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Thank you!</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                Your request has been successfully submitted. One of our engineers or sales managers will contact you shortly.
              </p>
              <Button onClick={() => setIsSubmitted(false)}>Send Another Message</Button>
            </div>
          ) : (
            <div className="p-8 border rounded-2xl bg-card shadow-sm">
              <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      className="w-full px-3.5 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-colors"
                      placeholder="John Doe"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      className="w-full px-3.5 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-colors"
                      placeholder="john@example.com"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-foreground">Phone Number</label>
                    <input
                      id="phone"
                      type="tel"
                      className="w-full px-3.5 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-colors"
                      placeholder="+1 (555) 000-0000"
                      {...register("phone")}
                    />
                    {errors.phone && (
                      <p className="text-xs text-destructive">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <label htmlFor="city" className="text-sm font-medium text-foreground">City</label>
                    <input
                      id="city"
                      type="text"
                      className="w-full px-3.5 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-colors"
                      placeholder="Silicon Valley"
                      {...register("city")}
                    />
                    {errors.city && (
                      <p className="text-xs text-destructive">{errors.city.message}</p>
                    )}
                  </div>
                </div>

                {/* Service Required */}
                <div className="space-y-2">
                  <label htmlFor="serviceRequired" className="text-sm font-medium text-foreground">Service Required</label>
                  <select
                    id="serviceRequired"
                    className="w-full px-3.5 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-colors"
                    {...register("serviceRequired")}
                  >
                    <option value="CCTV Installation">CCTV Installation</option>
                    <option value="CCTV Maintenance">CCTV Maintenance</option>
                    <option value="Access Control">Access Control Systems</option>
                    <option value="Fire Alarm System">Fire Alarm System</option>
                    <option value="Video Door Phone">Video Door Phone</option>
                    <option value="Biometric System">Biometric System</option>
                    <option value="AMC Service">Annual Maintenance Contract (AMC)</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Other">Other / General Inquiry</option>
                  </select>
                  {errors.serviceRequired && (
                    <p className="text-xs text-destructive">{errors.serviceRequired.message}</p>
                  )}
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-foreground">Message</label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-3.5 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-colors"
                    placeholder="Tell us about your security requirements..."
                    {...register("message")}
                  />
                  {errors.message && (
                    <p className="text-xs text-destructive">{errors.message.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Submitting..." : "Send Request"}
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
