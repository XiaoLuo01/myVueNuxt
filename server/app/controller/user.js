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
        expiresIn: '3 days',
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

  async isfollow() {
    const { ctx } = this
    const me = await ctx.model.User.findById(ctx.state.userid)
    // 我的follow字段李，有没有传来的这个用户id
    const isFollow = !!me.following.find(id => id.toString() === ctx.params.id)
    this.success({ isFollow })
  }
  async follow() {
    const { ctx } = this

    const me = await ctx.model.User.findById(ctx.state.userid)
    const isFollow = !!me.following.find(id => id.toString() === ctx.params.id)
    if (!isFollow) {
      me.following.push(ctx.params.id)
      me.save()
      this.message('关注成功')
    }
  }
  async cancelFollow() {
    const { ctx } = this
    const me = await ctx.model.User.findById(ctx.state.userid)
    // 把用户从我的following数组中删掉
    const index = me.following.map(id => id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.following.splice(index, 1)
      me.save()
      this.message('取消成功')
    }
    // let isFollow = !!me.following.find(id=> id.toString()===ctx.params.id)
    // if(!isFollow){
    //   me.following.push(ctx.params.id)
    //   me.save()
    //   this.message('关注成功')
    // }
  }
  async following() {
    const { ctx } = this
    const users = await ctx.model.User.findById(ctx.params.id).populate(
      'following'
    )
    this.success(users.following)
  }
  async followers() {
    const { ctx } = this
    const users = await ctx.model.User.find({ following: ctx.params.id })
    this.success(users)
  }
  async likeArticle() {
    const { ctx } = this
    const me = await ctx.model.User.findById(ctx.state.userid)
    if (!me.likeArticle.find(id => id.toString() === ctx.params.id)) {
      me.likeArticle.push(ctx.params.id)
      me.save()
      await ctx.model.Artical.findByIdAndUpdate(ctx.params.id, {
        $inc: { like: 1 },
      })
      return this.message('点赞成功')
    }
  }
  async cancelLikeArticle() {
    const { ctx } = this
    const me = await ctx.model.User.findById(ctx.state.userid)
    const index = me.likeArticle.map(id => id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.likeArticle.splice(index, 1)
      me.save()
      await ctx.model.Artical.findByIdAndUpdate(ctx.params.id, {
        $inc: { like: -1 },
      })
      return this.message('取消点赞成功')
    }
  }
  async articleStatus() {
    const { ctx } = this
    const me = await ctx.model.User.findById(ctx.state.userid)
    console.log(me)
    const like = !!me.likeArticle.find(id => id.toString() === ctx.params.id)
    const dislike = !!me.disLikeArticle.find(
      id => id.toString() === ctx.params.id
    )
    this.success({
      like,
      dislike,
    })
  }
}

module.exports = UserController
