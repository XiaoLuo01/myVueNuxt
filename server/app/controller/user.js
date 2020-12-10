'use strict'
const BaseController = require('./base')
const md5 = require('md5')
const jwt = require('jsonwebtoken')

const HashSalt = ':Violet@good!@0122'
const createRule = {
  email: { type: 'email' },
  nickname: { type: 'string' },
  password: { type: 'string' },
  captcha: { type: 'string' },
  emailcode: { type: 'string' },
}

class UserController extends BaseController {
  async login() {
    // 登录接口
    const { ctx, app } = this
    // 获取数据
    const { email, password, captcha, emailCode } = ctx.request.body

    // 校验图片验证码是否正确
    console.log('captcha => ' + ctx.session.captcha, captcha.toUpperCase())
    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      return this.error('验证码错误')
    }

    // 校验邮箱验证码是否正确
    if (emailCode !== ctx.session.emailCode) {
      return this.error('邮箱验证码错误')
    }

    // 去数据库查找
    const user = await ctx.model.User.findOne({
      email,
      password: md5(password + HashSalt),
    })
    if (!user) {
      return this.error('用户名或密码错误')
    }
    // 找到了把用户信息加密成 token 返回
    const token = jwt.sign(
      {
        _id: user._id,
        email,
      },
      app.config.jwt.secret,
      {
        expiresIn: '1h',
      }
    )
    this.success({ token, email, nickname: user.nickname })
  }

  async register() {
    // 注册接口
    const { ctx } = this

    try {
      // 校验
      ctx.validate(createRule)
    } catch (e) {
      return this.error('参数校验失败', -1, e.errors)
    }

    // 获取数据
    const { email, nickname, password, captcha } = ctx.request.body

    // 校验验证码是否正确
    console.log('captcha => ' + ctx.session.captcha, captcha.toUpperCase())
    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      return this.error('验证码错误')
    }

    // 检查邮箱是不是已经存在
    if (await this.checkEmail(email)) {
      this.error('邮箱重复啦')
    } else {
      const ret = await ctx.model.User.create({
        email,
        nickname,
        password: md5(password + HashSalt),
      })
      if (ret._id) {
        this.message('注册成功')
      }
    }
  }

  async checkEmail(email) {
    const user = await this.ctx.model.User.findOne({ email })
    return user
  }

  async verify() {
    // 验证用户名是否存在
  }

  async info() {
    // 获取用户信息接口
    const { ctx } = this
    // 通过中间件解析token，获取到当前登录的是哪一个邮箱
    const { email } = ctx.state
    const user = await this.checkEmail(email)
    this.success(user)
  }
}

module.exports = UserController
