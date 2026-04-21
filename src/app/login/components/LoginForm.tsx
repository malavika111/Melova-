'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInWithEmail, signUpWithEmail, resetPassword } from '../actions'
import { createClient } from '@/lib/supabase/client'
import { LogIn, UserPlus, Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react'

type AuthMode = 'signin' | 'signup' | 'forgot'

export default function LoginForm() {
    const searchParams = useSearchParams()
    const initialMode = (searchParams.get('mode') as AuthMode) || 'signin'
    const errorMessage = searchParams.get('error')
    const successMessage = searchParams.get('message')

    const [mode, setMode] = useState<AuthMode>(initialMode)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)

    useEffect(() => {
        const modeParam = searchParams.get('mode') as AuthMode
        if (modeParam) setMode(modeParam)
    }, [searchParams])

    const handleEmailSubmit = async (formData: FormData) => {
        setIsLoading(true)
        try {
            if (mode === 'signin') {
                await signInWithEmail(formData)
            } else if (mode === 'signup') {
                await signUpWithEmail(formData)
            } else {
                await resetPassword(formData)
            }
        } catch {
            // Redirect happens in server action
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: 'http://localhost:3000',
                },
            })
            if (error) {
                console.error('Google OAuth error:', error)
                setIsGoogleLoading(false)
            }
        } catch {
            setIsGoogleLoading(false)
        }
    }

    const getTitle = () => {
        switch (mode) {
            case 'signup': return 'Create Account'
            case 'forgot': return 'Reset Password'
            default: return 'Welcome Back'
        }
    }

    const getSubtitle = () => {
        switch (mode) {
            case 'signup': return 'Sign up to start summarizing videos'
            case 'forgot': return 'Enter your email to receive a reset link'
            default: return 'Sign in to access your dashboard'
        }
    }

    return (
        <div className="w-full max-w-md space-y-8 relative z-10">
            {/* Logo */}
            <div className="text-center">
                <Link href="/" className="inline-block group">
                    <h1 className="text-4xl font-extrabold tracking-tight text-[#B0E0E6] neon-text-glow transition-all duration-300 group-hover:scale-105">
                        Melova
                    </h1>
                </Link>
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground transition-all duration-300">
                    {getTitle()}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    {getSubtitle()}
                </p>
            </div>

            {/* Error / Success Messages */}
            {errorMessage && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 backdrop-blur-sm">
                    <span className="font-medium">⚠ </span>{decodeURIComponent(errorMessage)}
                </div>
            )}
            {successMessage && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 backdrop-blur-sm">
                    <span className="font-medium">✓ </span>{decodeURIComponent(successMessage)}
                </div>
            )}

            <Card className="border-[#B0E0E6]/20 bg-card/80 backdrop-blur-xl shadow-[0_0_30px_rgba(176, 224, 230, 0.05)]">
                <CardHeader className="space-y-1 pb-4">
                    {/* Mode Tabs */}
                    {mode !== 'forgot' && (
                        <div className="flex rounded-lg bg-muted/50 p-1 mb-4">
                            <button
                                type="button"
                                onClick={() => setMode('signin')}
                                className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all duration-300 ${
                                    mode === 'signin'
                                        ? 'bg-[#B0E0E6] text-black shadow-md shadow-[#B0E0E6]/20'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <LogIn size={16} />
                                Sign In
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('signup')}
                                className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all duration-300 ${
                                    mode === 'signup'
                                        ? 'bg-[#B0E0E6] text-black shadow-md shadow-[#B0E0E6]/20'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <UserPlus size={16} />
                                Sign Up
                            </button>
                        </div>
                    )}

                    {mode === 'forgot' && (
                        <button
                            type="button"
                            onClick={() => setMode('signin')}
                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                            Back to Sign In
                        </button>
                    )}

                    <CardTitle className="text-xl text-center">
                        {mode === 'signin' && 'Sign in to your account'}
                        {mode === 'signup' && 'Create your account'}
                        {mode === 'forgot' && 'Forgot your password?'}
                    </CardTitle>
                    <CardDescription className="text-center text-muted-foreground">
                        {mode === 'signin' && 'Enter your credentials or use Google'}
                        {mode === 'signup' && 'Fill in your details to get started'}
                        {mode === 'forgot' && 'We\'ll send you a reset link'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-5">
                    {/* Email / Password Form */}
                    <form action={handleEmailSubmit} className="space-y-4">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    className="pl-10 h-11 bg-background/50 border-[#B0E0E6]/20 focus:border-[#B0E0E6]/50 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Password Field (not in forgot mode) */}
                        {mode !== 'forgot' && (
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                        className="pl-10 pr-10 h-11 bg-background/50 border-[#B0E0E6]/20 focus:border-[#B0E0E6]/50 transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Confirm Password (signup only) */}
                        {mode === 'signup' && (
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                                    Confirm Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                        className="pl-10 pr-10 h-11 bg-background/50 border-[#B0E0E6]/20 focus:border-[#B0E0E6]/50 transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Forgot Password Link (signin only) */}
                        {mode === 'signin' && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setMode('forgot')}
                                    className="text-xs text-[#B0E0E6]/70 hover:text-[#B0E0E6] transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-11 bg-[#B0E0E6] text-black font-semibold hover:bg-[#B0E0E6]/90 shadow-md shadow-[#B0E0E6]/20 hover:shadow-[#B0E0E6]/30 transition-all duration-300"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    {mode === 'signin' && (
                                        <>
                                            <LogIn className="mr-2 h-4 w-4" />
                                            Sign In
                                        </>
                                    )}
                                    {mode === 'signup' && (
                                        <>
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Create Account
                                        </>
                                    )}
                                    {mode === 'forgot' && (
                                        <>
                                            <Mail className="mr-2 h-4 w-4" />
                                            Send Reset Link
                                        </>
                                    )}
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Divider (not in forgot mode) */}
                    {mode !== 'forgot' && (
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-[#B0E0E6]/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-3 text-muted-foreground tracking-wider">
                                    or continue with
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Google Login (not in forgot mode) */}
                    {mode !== 'forgot' && (
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isGoogleLoading}
                            onClick={handleGoogleSignIn}
                            className="w-full h-11 relative border-[#B0E0E6]/20 hover:border-[#B0E0E6]/40 hover:bg-[#B0E0E6]/5 transition-all duration-300"
                        >
                            {isGoogleLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <svg
                                        className="mr-2 h-5 w-5 absolute left-4"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                        <path d="M1 1h22v22H1z" fill="none" />
                                    </svg>
                                    <span className="flex-1 font-semibold">Continue with Google</span>
                                </>
                            )}
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Footer text */}
            <p className="text-center text-xs text-muted-foreground">
                By continuing, you agree to our{' '}
                <a href="#" className="text-[#B0E0E6]/70 hover:text-[#B0E0E6] underline underline-offset-4 transition-colors">
                    Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-[#B0E0E6]/70 hover:text-[#B0E0E6] underline underline-offset-4 transition-colors">
                    Privacy Policy
                </a>
            </p>
        </div>
    )
}
