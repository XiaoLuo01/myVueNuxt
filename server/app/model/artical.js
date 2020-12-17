'use strict'
module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const ArticalSchema = new Schema(
    {
      __v: { type: Number, select: false },
      title: { type: String, required: true },
      artical: { type: String, required: true, select: false },
      artical_html: { type: String, required: true },
      author: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
      },
      views: { type: Number, required: false, default: 1 },
      like: { type: Number, required: false, default: 0 },
      dislike: { type: Number, required: false, default: 0 },
    },
    { timestamps: true }
  )

  return mongoose.model('Artical', ArticalSchema)
}
