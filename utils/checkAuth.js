import jwt from 'jsonwebtoken';

export default (req, res, next) => {
    //если пришел токен или не пришел передается строка и из нее удаляется слово /Bearer и заменяется на пустую строку
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

    if (token) {
        try {
            const decoded = jwt.verify(token,'secret321');
            req.userId = decoded._id;
            next(); //все нормально, выполняй следующую функцию
        } catch (e) {
            return res.status(403).json({
                message: 'Нет доступа',
            });
        }
    } else {
       return res.status(403).json({
            message: 'Нет доступа',
        });
    }
};