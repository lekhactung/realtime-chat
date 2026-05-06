export const authMe = async (req, res) => {
    try {
        const user = req.user
        return res.status(200).json({ user })
    } catch (error) {
        console.error('Error occured calling authMe', error)
        return res.status(500).json({ message: 'System fail' })
    }
}

export const test = async (req,res) => { 
    return res.sendStatus(204)
}