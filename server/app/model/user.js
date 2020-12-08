'use strict'
module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const UserSchema = new Schema(
    {
      email: { type: 'String', required: true },
      nickname: { type: 'String', required: true },
      password: { type: 'String', required: true },
      avator: { type: 'String', required: false, default: '/user.png' },
    },
    { timestamps: true }
  )

  return mongoose.model('User', UserSchema)
}
