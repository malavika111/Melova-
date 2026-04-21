import { Navbar } from '@/components/layout/Navbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { CyberBackground } from '@/components/ui/CyberBackground'
import { CyberCursor } from '@/components/ui/CyberCursor'

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col bg-transparent relative z-0">
            <CyberBackground />
            <CyberCursor />
            <Navbar />
            <main className="flex-1">
                <HeroSection />
                <FeaturesSection />
                <TestimonialsSection />
            </main>

            <footer className="border-t border-[#B0E0E6]/20 py-12 md:py-16 bg-[#0A0A0A]/80 backdrop-blur-sm relative z-10">
                <div className="container flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-[#B0E0E6] neon-text-glow">Melova</span>
                        <span className="text-sm text-[#B0E0E6]">© {new Date().getFullYear()}</span>
                    </div>
                    <p className="text-sm text-[#B0E0E6] text-center md:text-left">
                        Built for those who value their time.
                    </p>
                    <div className="flex gap-4 text-sm text-[#B0E0E6]">
                        <a href="#" className="hover:text-[#E0F7FA] transition-colors">Twitter</a>
                        <a href="#" className="hover:text-[#E0F7FA] transition-colors">GitHub</a>
                        <a href="#" className="hover:text-[#E0F7FA] transition-colors">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
