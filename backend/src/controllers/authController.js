import bcrypt from "bcrypt"
import User from "../models/User.js"
import jwt from 'jsonwebtoken'
import Session from "../models/Session.js"
import crypto from "crypto"
const ACCESS_TOKEN_TTL = '30m'
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000
export const signUp = async (req, res) => {
    try {
        const { username, password, email, firstName, lastName } = req.body;

        if (!username || !password || !email || !firstName || !lastName) {
            return res.status(400).json({ message: "Can not empty user name, password, email, firstname, lastname" })
        }

        const duplicate = await User.findOne({ userName: username })
        if (duplicate) {
            return res.status(409).json({ message: "username existed" })
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password, 10) // salt = 10

        //create user
        await User.create({
            userName: username,
            hashedPassword,
            email,
            displayName: `${firstName} ${lastName}`
        })

        //return
        return res.sendStatus(201)
    } catch (error) {
        console.error("Error calling signUp", error)
        return res.status(500).json({ message: "System failed" })
    }
}

export const signIn = async (req, res) => {
    try {
        //get username , password
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "missed username or password" })
        }
        //get hashedPassword from db to compare
        const user = await User.findOne({ userName: username });

        if (!user) {
            return res
                .status(401)
                .json({ message: " username or password is incorrect" })
        }

        const passwordCorrect = await bcrypt.compare(password, user.hashedPassword)
        if (!passwordCorrect) {
            return res
                .status(401)
                .json({ message: " username or password is incorrect" })

        }
        //create accessToken with JWT
        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: ACCESS_TOKEN_TTL })
        //create refresh token
        const refreshToken = crypto.randomBytes(64).toString('hex')
        //create new session to store refresh token
        await Session.create({
            userId: user._id,
            refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
        })
        //return refresh token back to cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: REFRESH_TOKEN_TTL,
        })
        //return refresh token to res
        return res.status(200).json({ message: `User ${user.displayName}Logged In`, accessToken })
    } catch (error) {
        console.error("Error calling signIn", error)
        return res.status(500).json({ message: "System failed" })
    }
}

export const signOut = async (req, res) => {
    try {
        //get refresh token from cookie
        const token = req.cookies?.refreshToken
        //clear refresh token
        if (!token) {
            return res.status(401).json({ message: "No refresh token found" })
        }
        await Session.deleteOne({ refreshToken: token })
        res.clearCookie("refreshToken")
        //clear cookie
        return res.status(204).send()
    } catch (error) {
        console.error("Error calling signOut", error)
        return res.status(500).json({ message: "System failed" })
    }
}

//create new accesstoken from refreshtoken
export const refreshToken = async (req, res) => {
    try {
        //get refresh token from cookies
        const token = req.cookies?.refreshToken
        if (!token) {
            return res.status(401).json({ message: "Token not exist" })
        }
        //cmp to refreshtoken in db
        const session = await Session.findOne({ refreshToken: token })
        if (!session) {
            return res.status(403).json({ message: "Session not found or expired" })
        }
        //check exp
        if (session.expiresAt < new Date()) {
            await Session.deleteOne({ refreshToken: token })
            return res.status(403).json({ message: "Token expired" })
        }
        //create new accesstoken
        const accessToken = jwt.sign(
            { userId: session.userId },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: ACCESS_TOKEN_TTL }
        )
        //return
        return res.status(200).json({ accessToken })

    } catch (error) {
        console.error("Error occured when calling refreshToken", error)
        return res.status(500).json({ message: "System error" })
    }
}