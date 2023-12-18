import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel from '../models/User.js';

export const register = async (req, res) => {
    try {
    
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
    
        const doc = new UserModel({
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            passwordHash: hash,
        });
    
        const user = await doc.save();
    
        const token = jwt.sign(
            {
                _id: user._id,
            },
            'secret321',
            {
                expiresIn: '30d',
            }
        );
    
        //скрываем пароль пользователя из ответа сервера с помощью деструктуризации
        const {passwordHash, ...userData} = user._doc;
    
        res.json({
            ...userData,
            token,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось зарегистрироваться',
        });
    }
};

export const login = async (req, res) => {
    try {
        //проверяем есть ли пользователь в БД
        const user = await UserModel.findOne({ email: req.body.email });

        //но лучше писать обобщенно "Неверный логин или пароль", чтобы злоумышленнику было тяжелее овладеть информацией
        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
            });
        }

        //библиотека сравнивает пароль введенный пользователем с тем, который есть в документе у пользователя
        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

        //если пароли различаются
        if (!isValidPass){
            return res.status(400).json({
                message: 'Неверный логин или пароль',
            });
        }

        //если пароли совпадают
        const token = jwt.sign(
            {
                _id: user._id,
            },
            'secret321',
            {
                expiresIn: '30d',
            }
        );

        //скрываем пароль пользователя из ответа сервера с помощью деструктуризации
        const {passwordHash, ...userData} = user._doc;

        res.json({
            ...userData,
            token
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось авторизоваться',
        });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);

        //если пользователь не найден
        if(!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
            });
        }

        //если пользователь найден
        const {passwordHash, ...userData} = user._doc;

        res.json(userData);
    } catch (err){
            console.log(err);
            res.status(500).json({
            message: 'Нет доступа',
        });
    }
};