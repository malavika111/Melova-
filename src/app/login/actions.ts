'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function signInWithEmail(formData: FormData) {
    const supabase = createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return redirect('/login?error=Please fill in all fields')
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }

    redirect('/')
}

export async function signUpWithEmail(formData: FormData) {
    const supabase = createClient()
    const origin = headers().get('origin')
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!email || !password || !confirmPassword) {
        return redirect('/login?mode=signup&error=Please fill in all fields')
    }

    if (password !== confirmPassword) {
        return redirect('/login?mode=signup&error=Passwords do not match')
    }

    if (password.length < 6) {
        return redirect('/login?mode=signup&error=Password must be at least 6 characters')
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/login`,
        },
    })

    if (error) {
        return redirect(`/login?mode=signup&error=${encodeURIComponent(error.message)}`)
    }

    redirect('/login?message=Check your email to confirm your account')
}



export async function resetPassword(formData: FormData) {
    const supabase = createClient()
    const origin = headers().get('origin')
    const email = formData.get('email') as string

    if (!email) {
        return redirect('/login?mode=forgot&error=Please enter your email')
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/login`,
    })

    if (error) {
        return redirect(`/login?mode=forgot&error=${encodeURIComponent(error.message)}`)
    }

    redirect('/login?message=Check your email for a password reset link')
}
