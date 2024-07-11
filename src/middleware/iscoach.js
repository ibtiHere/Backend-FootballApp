const isCoach = (req, res, next) => {
    if (req.user.role !== 'coach') {
        return res.status(403).json({ message: 'Not a Coach' });
    } else {
        next();
    }
};

module.exports = isCoach;
