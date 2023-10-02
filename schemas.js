const Joi = require('joi');

module.exports.postSchema = Joi.object({
        image: Joi.string().required(),
        caption: Joi.string().required()
});

module.exports.commentSchema = Joi.object({
    body: Joi.string().required()
})