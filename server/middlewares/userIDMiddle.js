const userIDMiddle = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        req.userId = authHeader.split(" ")[1]; // 提取 `userId`
    }

    if (!req.userId) {
        return res.status(400).json({ error: "Missing userId in Authorization header" });
    }

    next(); // 继续执行下一个中间件或路由
};

module.exports = userIDMiddle;
