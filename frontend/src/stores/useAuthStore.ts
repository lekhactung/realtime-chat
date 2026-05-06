import { create } from 'zustand'
import { toast } from 'sonner'
import { authService } from '@/service/authService'
import type { AuthState } from '@/types/stores'

export const useAuthStore = create<AuthState>((set, get) => ({
    accessToken: null,
    user: null,
    loading: false,

    clearState: () => {
        set({ accessToken: null, user: null, loading: false })
    },


    signUp: async (username, password, email, firstName, lastName) => {
        try {
            set({ loading: true })

            await authService.signUp(username, password, email, firstName, lastName)

            toast.success("Sign up successful! ")
        } catch (error) {
            console.error(error)
            toast.error("Sign up failed!")
        } finally {
            set({ loading: false })
        }
    },

    signIn: async (username, password) => {
        try {
            set({ loading: true })
            const { accessToken } = await authService.signIn(username, password)
            get().setAccessToken(accessToken)


            await get().fetchMe()

            toast.success('Welcome back!')
        } catch (error) {
            console.error(error)
            toast.error('Sign in failed!')
        } finally {
            set({ loading: false })
        }
    },

    signOut: async () => {
        try {
            get().clearState()
            await authService.signOut()
            toast.success('Sign out succed')
        } catch (error) {
            console.error(error)
            toast.error('Sign out failed!')
        }
    },

    fetchMe: async () => {
        try {
            set({ loading: true })
            const user = await authService.fetchMe()

            set({ user })
        } catch (error) {
            console.error(error)
            set({ user: null, accessToken: null })
            toast.error("Error occured when getting user information, please try again!")
        } finally {
            set({ loading: false })
        }
    },

    refresh: async () => {
        try {
            set({ loading: true })
            const { user, fetchMe, setAccessToken } = get()
            const accessToken = await authService.refresh()
            setAccessToken(accessToken)
            if (!user) {
                await fetchMe()
            }
        } catch (error) {
            console.error(error)
            toast.error("Signin session expired, please signin!")
            get().clearState()
        } finally {
            set({ loading: false })
        }
    },

    setAccessToken: (accessToken) => {
        set({ accessToken })
    }
}))