import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protectedRoute = (req, res, next) => {
    try {
        //get token from header
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(" ")[1] //Bearer <token>

        if (!token) {
            return res.status(401).json({ message: 'can not find access token' })
        }
        //auth token
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodeUser) => {
            if (err) {
                console.error(err)
                return res.status(403).json({ message: "access token expired or not correct" })
            }
            //find user
            const user = await User.findById(decodeUser.userId).select('-hashedPassword')

            if (!user) {
                return res.status(404).json({ message: "user not exist" })
            }

            req.user = user
            next()
        })

        //return user to req
    } catch (error) {
        console.error('Error occured when authorize JWT in authMiddleWare', error)
        return res.status(500).json({ message: 'System Fail' })
    }
}