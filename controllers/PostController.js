import PostModel from '../models/Post.js';

export const getLastTags =  async (req, res) => {
  try {
    const posts = await PostModel.find().limit(5).exec(); //берем теги у последних 5-ти статей
    const tags = posts.map(obj => obj.tags).flat().slice(0, 5); //пробегаем по массиву постов, вытаскиваем из каждого последние 5 тегов

    res.json(tags);
  } catch (err) {
    console.log(err);
    res.status(500).json({
        message: 'Не удалось получить статьи',
    });
  }
}

export const getAll = async (req, res) => {
    try {
        const posts = await PostModel.find().populate('user').exec();

        res.json(posts);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить статьи',
        });
    }
}

export const getOne = async (req, res) => {

        const postId = req.params.id;

        PostModel.findOneAndUpdate(
            {
              _id: postId,
            },
            {
              $inc: { viewsCount: 1 }, //увеличиваем счетчик посещений на 1
            },
            {
              returnDocument: "after", //вернуть актуальный документ после обновления
            }
          )
            .then((doc) => {
              if (!doc) {
                return res.status(404).json({
                  message: "Статья не найдена",
                });
              }
      
              res.json(doc);
            })
            .catch((err) => {
              if (err) {
                console.log(err);
      
                return res.status(500).json({
                  message: "Не удалось получить статью",
                });
              }
}

export const remove = async (req, res) => {

    const postId = req.params.id;

    PostModel.findOneAndDelete(
        {
          _id: postId,
        }
      )
        .then((doc) => {
          if (!doc) {
            return res.status(404).json({
              message: "Статья не найдена",
            });
          }
  
          res.json({
            success: true,
          });
        })
        .catch((err) => {
          if (err) {
            console.log(err);
  
            return res.status(500).json({
              message: "Не удалось удалить статью",
            });
          }
        });
}

export const create = async (req, res) => {
    try {
        const doc = new PostModel({
            title: req.body.title,
            text: req.body.text,
            imageUrl: req.body.imageUrl,
            tags: req.body.tags,
            user: req.userId,
        });

        const post = await doc.save();

        res.json(post);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось создать статью',
        });
    }
};

export const update = async (req, res) => {
  const postId = req.params.id;

  PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        tags: req.body.tags,
        user: req.userId,
      },
    )
      .then((doc) => {
        if (!doc) {
          return res.status(404).json({
            message: "Статья не найдена",
          });
        }

        res.json({
          success: true,
        });
      })
      .catch((err) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            message: "Не удалось обновить статью",
          });
        }
      });
};