import express from "express";
import fs from "fs";
import multer from "multer";
import cors from "cors";

import mongoose from "mongoose";

import { registerValidation, loginValidation, postCreateValidation } from './validations.js';
import { handleValidationErrors, checkAuth } from "./utils/index.js";
import { UserController, PostController } from './controllers/index.js'


mongoose
.connect('mongodb+srv://kovalevalex89:ClO4Nlm7Zq9Oxpih@cluster0.khvfrnb.mongodb.net/blog?retryWrites=true&w=majority')
.then(() => console.log('DB ok'))
.catch((err) => console.log('DB error', err));

const app = express();

//создание хранилища для загрузки картинок
const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        if(!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads');
        }
        cb(null, 'uploads');
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname); 
    },
});

const upload = multer({ storage });

app.use(express.json());
app.use(cors());
//говорим экспрессу, что если ему приходит 
//любой запрос на uploads, то из библиотеки 
//нужно взять функцию static проверить есть ли 
//в этой папке то, что я передаю 
app.use('/uploads', express.static('uploads'));

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login); //авторизация пользователя
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register); //регистрация пользователя
app.get('/auth/me', checkAuth, UserController.getMe); //получение информации о себе

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`,
    });
}); //загрузка изображений

app.get('/tags', PostController.getLastTags); 

app.get('/posts', PostController.getAll); //получить все статьи
app.get('/posts/tags', PostController.getLastTags); //получить теги
app.get('/posts/:id', PostController.getOne); //получить одну статью
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create); //создать статью
app.delete('/posts/:id', checkAuth, PostController.remove); //удалить статью
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, PostController.update); //обновить статью

app.listen(4444,(err)=>{
    if (err) {
        return console.log(err);
    }

    console.log('Server OK');
});