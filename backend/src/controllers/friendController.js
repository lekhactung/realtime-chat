import Friend from "../models/Friend.js"
import User from "../models/User.js"
import FriendRequest from "../models/FriendRequest.js"

export const sendFriendRequest = async (req, res) => {
    try {
        const { to, message } = req.body

        const from = req.user._id

        if (from === to) {
            return res.status(400).json({ message: "Can not send friend request to your self" })
        }

        const userExists = await User.exists({ _id: to })
        if (!userExists) {
            return res.status(400).json({ message: "User does not exists" })
        }

        let userA = from.toString()
        let userB = to.toString()

        if (userA > userB) {
            [userA, userB] = [userB, userA]
        }

        const [alreadyFriends, existingRequest] = await Promise.all([
            Friend.findOne({ userA, userB }),
            FriendRequest.findOne({
                $or: [
                    { from, to },
                    { from: to, to: from }
                ]
            })
        ])

        if (alreadyFriends) {
            return res.status(400).json({ message: "Already friend!" })
        }
        if (existingRequest) {
            return res.status(400).json({ message: "Already have friend request waiting for answer!" })
        }

        const request = await FriendRequest.create({ from, to, message })
        return res.status(201).json({ message: "Friend request sent!", request })
    } catch (error) {
        console.error("Error sending friend request!", error)
        return res.status(500).json({ message: "System failed!" })
    }
}

export const acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params
        const userId = req.user._id

        const request = await FriendRequest.findById(requestId)

        if (!request) {
            return res.status(400).json({ message: "Can not find friend request" })
        }
        if (request.to.toString() !== userId.toString()) {
            return res.status(400).json({ message: "You do not have permission to accept this request!" })
        }

        const friend = await Friend.create({
            userA: request.from,
            userB: request.to
        })

        await FriendRequest.findByIdAndDelete(requestId)

        const from = await User.findById(request.from).select("_id displayName avatarUrl").lean()

        return res.status(200).json({
            message: "Accepted friend request!",
            newFriend: {
                _id: from?._id,
                displayName: from?.displayName,
                avatarUrl: from?.avatarUrl
            }
        })
    } catch (error) {
        console.error("Error accept friend request!", error)
        return res.status(500).json({ message: "System failed!" })
    }
}

export const declineFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params
        const userId = req.user._id

        const request = await FriendRequest.findById(requestId)

        if (!request) {
            return res.status(404).json({ message: "Can not find friend request!" })
        }

        if (request.to.toString() != userId.toString()) {
            return res.status(403).json({ message: "You do not have permission to decline this request!" })
        }

        await FriendRequest.findByIdAndDelete(requestId)
        return res.sendStatus(204)
    } catch (error) {
        console.error("Error decline friend request!", error)
        return res.status(500).json({ message: "System failed!" })
    }
}

export const getAllFriends = async (req, res) => {
    try {
        const userId = req.user._id

        const friendships = await Friend.find({
            $or: [{
                userA: userId
            }, {
                userB: userId
            }]
        })
            .populate("userA", "_id displayName avatarUrl")
            .populate("userB", "_id displayName avatarUrl")
            .lean()

        if (!friendships.length) {
            return res.status(200).json({ friend: [] })
        }
        const friends = friendships.map((f) => 
            f.userA._id.toString() === userId.toString() 
            ? f.userB 
            : f.userA)

        return res.status(200).json({ friends })
    } catch (error) {
        console.error("Error get friend list!", error)
        return res.status(500).json({ message: "System failed!" })
    }
}

export const getFriendRequests = async (req, res) => {
    try {
        const userId = req.user._id
        const populateFields = "_id userName displayName avatarUrl"

        const [sent, received] = await Promise.all([
            FriendRequest.find({ from: userId }).populate("to", populateFields),
            FriendRequest.find({ to: userId }).populate("from", populateFields),
        ])

        res.status(200).json({sent,received})
    } catch (error) { 
        console.error("Error get friend reqest!", error)
        return res.status(500).json({ message: "System failed!" })
    }
}