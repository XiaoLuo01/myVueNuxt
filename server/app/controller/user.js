'use strict'
const BaseController = require('./base')
const md5 = require('md5')

const HashSalt = ':Violet@good!@0122'
const createRule = {
  email: { type: 'email' },
  nickname: { type: 'string' },
  password: { type: 'string' },
  captcha: { type: 'string' },
}

class UserController extends BaseController {
  async login() {
    // 登录接口
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
      this.error('验证码错误')
    } else {
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
  }
}

module.exports = UserController
