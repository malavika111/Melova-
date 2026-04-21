'use client'

import { motion } from 'framer-motion'
import { 
    Youtube, 
    StickyNote, 
    UserCircle2, 
    Briefcase, 
    BrainCircuit, 
    ShieldCheck 
} from 'lucide-react'

const features = [
    {
        name: 'YouTube Synthesis',
        description: 'Bypass hours of footage with AI-generated summary matrices and timestamped insights.',
        icon: Youtube,
    },
    {
        name: 'Neural Notes',
        description: 'Secure, cloud-synced notes with built-in AI enhancement and formatting logic.',
        icon: StickyNote,
    },
    {
        name: 'Identity Matrix',
        description: 'Professionally synthesized resumes optimized for modern recruitment systems.',
        icon: UserCircle2,
    },
    {
        name: 'Node Search',
        description: 'Advanced job search algorithm that matches your skill matrix with global opportunities.',
        icon: Briefcase,
    },
    {
        name: 'Document Agent',
        description: 'Upload and interact with complex documents via a dedicated AI analysis agent.',
        icon: BrainCircuit,
    },
    {
        name: 'Secure Vault',
        description: 'Enter your own data hub with enterprise-grade encryption for all your academic assets.',
        icon: ShieldCheck,
    },
]

export function FeaturesSection() {
    return (
        <section className="py-24 bg-transparent relative z-10">
            <div className="container">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-[#E0F7FA] uppercase tracking-widest">
                        System Modules
                    </h2>
                    <p className="mt-4 text-lg text-[#B0E0E6]">
                        Melova extracts the noise and gives you exactly what you need to know for all your academic and career assets.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="relative flex flex-col p-6 bg-[#111111]/80 backdrop-blur-md rounded-none border border-[#B0E0E6]/20 shadow-sm hover:shadow-[0_0_20px_rgba(176, 224, 230, 0.2)] hover:border-[#B0E0E6]/50 transition-all group"
                        >
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#B0E0E6]" />
                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#B0E0E6]" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#B0E0E6]" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#B0E0E6]" />

                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-none bg-[#B0E0E6]/10 group-hover:bg-[#B0E0E6]/20 transition-colors border border-[#B0E0E6]/30">
                                <feature.icon className="h-6 w-6 text-[#B0E0E6]" aria-hidden="true" />
                            </div>
                            <h3 className="text-lg font-bold mb-2 text-[#E0F7FA]">{'>'} {feature.name}</h3>
                            <p className="text-[#B0E0E6] leading-relaxed flex-1 text-sm font-mono opacity-80 group-hover:opacity-100 transition-opacity">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
