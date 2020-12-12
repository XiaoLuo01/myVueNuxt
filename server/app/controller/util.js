'use strict'
const svgCaptcha = require('svg-captcha')
const BaseController = require('./base')
const fse = require('fs-extra')

class UtilController extends BaseController {
  async captcha() {
    const captcha = svgCaptcha.create({
      size: 4,
      fontSize: 50,
      width: 100,
      height: 40,
      noise: 3,
    })

    this.ctx.session.captcha = captcha.text
    this.ctx.response.type = 'image/svg+xml'
    this.ctx.body = captcha.data
  }

  async sendcode() {
    const { ctx } = this
    const email = ctx.query.email
    // 生成随机数
    const code = Math.random().toString().slice(2, 8)
    console.log(`邮箱：${email} 验证码：${code}`)
    // 存到session里面方便验证
    ctx.session.emailCode = code

    // 邮箱内容拼接
    const subject = '紫罗兰验证码'
    const text = ''
    const html = `<h2>小紫社区</h2><a href="http://github.com/XiaoLuo01"><span>${code}</span></a>`
    const hasSend = await this.service.tools.sendMail(
      email,
      subject,
      text,
      html
    )
    if (hasSend) {
      this.success('发送成功')
    } else {
      this.error('发送失败')
    }
  }

  async uploadfile() {
    const { ctx } = this
    const file = ctx.request.files[0]
    // const { name } = ctx.request.body

    await fse.move(file.filepath, this.config.UPLOAD_DIR + '/' + file.filename)
    this.success({
      url: `/public/${file.filename}`,
    })
  }
}

module.exports = UtilController
