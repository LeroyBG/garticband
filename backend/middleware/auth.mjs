// Extract user id from auth header
// Dummy function for now
export const getAuth = (req, res, next) => {
    req.userId = 'blah'
    next()
}