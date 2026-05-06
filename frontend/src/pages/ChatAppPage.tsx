import SignOut from '@/components/auth/signout'
import api from '@/lib/axios'
import { useAuthStore } from '@/stores/useAuthStore'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

const ChatAppPage = () => {
  const user = useAuthStore((s) => s.user)
  console.log(user.username)

  const handleOncClick = async() =>{
    try {
      await api.get("/user/test", {withCredentials : true})
      toast.success("ok")
    } catch (error) {
      toast.error("that bai")
      console.log(error)
    }
  }
  return (
    <div>
      {user?.username}
      <SignOut/>

      <Button onClick={handleOncClick}>Test</Button>
    </div>
  )
}

export default ChatAppPage
