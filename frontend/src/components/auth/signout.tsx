import { Button } from '../ui/button'
import { useAuthStore } from '@/stores/useAuthStore'
import { useNavigate } from 'react-router'

const SignOut = () => {
    const { signOut } = useAuthStore()
    const navigate = useNavigate()
    const handleSignout = async () => {
        try {
            await signOut()
            navigate("/signin")
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <Button onClick={handleSignout}>SignOut</Button>
    )
}

export default SignOut