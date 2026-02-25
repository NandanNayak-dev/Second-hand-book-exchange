const Joi=require('joi');   


module.exports.booklistingSchema=Joi.object({
   booklisting:Joi.object({
       title:Joi.string().required(),
       author:Joi.string().required(),
       description:Joi.string().required(),
       price:Joi.number().required(),
       image:Joi.string().required()
   }).required()
})

module.exports.reviewSchema=Joi.object({
    review:Joi.object({
        rating:Joi.number().required(),
        comment:Joi.string().required()
    }).required()
})