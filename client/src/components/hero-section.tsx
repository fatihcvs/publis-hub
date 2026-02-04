import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import type { Profile } from "@shared/schema";

interface HeroSectionProps {
  profile: Profile | null;
  isLoading: boolean;
}

export function HeroSection({ profile, isLoading }: HeroSectionProps) {
  if (isLoading) {
    return (
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="container px-4 z-10">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="w-32 h-32 rounded-full bg-muted animate-pulse" />
            <div className="h-10 w-64 bg-muted animate-pulse rounded-md" />
            <div className="h-6 w-40 bg-muted animate-pulse rounded-md" />
            <div className="h-20 w-96 max-w-full bg-muted animate-pulse rounded-md" />
          </div>
        </div>
      </section>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden" data-testid="section-hero">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <motion.div 
        className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute -bottom-20 -left-40 w-60 h-60 bg-primary/10 rounded-full blur-3xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5]
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="container px-4 z-10">
        <motion.div 
          className="flex flex-col items-center gap-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Avatar className="w-32 h-32 border-4 border-primary/20 shadow-xl">
              <AvatarImage src={profile.avatarUrl || undefined} alt={profile.name} />
              <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-2"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight" data-testid="text-profile-name">
              {profile.name}
            </h1>
            <p className="text-lg md:text-xl text-primary font-medium" data-testid="text-profile-title">
              {profile.title}
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-muted-foreground text-base md:text-lg max-w-2xl leading-relaxed"
            data-testid="text-profile-bio"
          >
            {profile.bio}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
