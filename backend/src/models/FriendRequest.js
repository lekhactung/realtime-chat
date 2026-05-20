import mongoose, { MongooseError } from "mongoose";

const friendRequestSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    message: {
        type: String,
        maxLength: 300
    }
}, {
    timestamp: true
})

friendRequestSchema.index({ from: 1, to: 1 }, { unique: true })

friendRequestSchema.index({ from: 1 })
friendRequestSchema.index({ to: 1 })

const FriendRequest = mongoose.model("FriendRequest",friendRequestSchema)
export default FriendRequest