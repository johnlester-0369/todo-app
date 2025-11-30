import { CheckCircle, Zap, Shield, Smartphone } from 'lucide-react'
import PageHead from '@/components/common/PageHead'
import Button from '@/components/ui/Button'
import { BrandLogo } from '@/components/common/Brand'

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: <CheckCircle className="h-6 w-6" />,
    title: 'Simple Task Management',
    description:
      'Create, organize, and complete tasks with an intuitive interface designed for productivity.',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Lightning Fast',
    description:
      'Blazing fast performance ensures your workflow stays smooth and uninterrupted.',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Secure & Private',
    description:
      'Your data is protected with industry-standard security. Your tasks stay yours.',
  },
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: 'Access Anywhere',
    description:
      'Available on web and mobile. Your tasks sync seamlessly across all devices.',
  },
]

function FeatureCard({ icon, title, description }: Feature) {
  return (
    <div className="group rounded-2xl bg-surface-1 p-6 transition-all duration-300 hover:bg-surface-2 hover:shadow-soft-lg">
      <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary transition-colors duration-300 group-hover:bg-primary/20">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-headline">{title}</h3>
      <p className="text-sm leading-relaxed text-muted">{description}</p>
    </div>
  )
}

export default function Home() {
  return (
    <>
      <PageHead
        title="TaskFlow - Simple Task Management"
        description="TaskFlow helps you stay organized and boost productivity. Manage your tasks effortlessly across all your devices."
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-bg px-4 py-20 md:px-8 lg:px-12 lg:py-32 xl:px-32">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Logo badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-surface-1 px-4 py-2 shadow-soft">
            <BrandLogo size="sm" />
            <span className="text-sm font-medium text-muted">
              Task Management Made Simple
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-headline md:text-5xl lg:text-6xl">
            Organize Your Life,{' '}
            <span className="text-primary">One Task at a Time</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
            TaskFlow is the simple, powerful way to manage your tasks. Stay
            focused, get more done, and achieve your goals with ease.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                window.location.href = '/signup'
              }}
            >
              Get Started Free
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                window.location.href = '/login'
              }}
            >
              Sign In
            </Button>
          </div>

          {/* Social proof hint */}
          <p className="mt-8 text-sm text-muted">
            No credit card required • Free forever for personal use
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-surface-1 px-4 py-20 md:px-8 lg:px-12 lg:py-24 xl:px-32">
        <div className="mx-auto max-w-6xl">
          {/* Section header */}
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-headline md:text-4xl">
              Everything You Need to Stay Productive
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted">
              Powerful features wrapped in a simple interface. Focus on what
              matters most.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-bg px-4 py-20 md:px-8 lg:px-12 lg:py-24 xl:px-32">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-headline md:text-4xl">
            Ready to Get Organized?
          </h2>
          <p className="mb-8 text-lg text-muted">
            Join thousands of users who have simplified their task management
            with TaskFlow.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              window.location.href = '/signup'
            }}
          >
            Start Your Free Account
          </Button>
        </div>
      </section>
    </>
  )
}