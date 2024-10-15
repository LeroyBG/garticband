import { getAuth } from 'firebase-admin/auth'

export const setAuthInResponse = async (req, res, next) => {
    const decodedToken = await getAuth().verifyIdToken()
    req.uid = decodedToken.uid
    next()
}