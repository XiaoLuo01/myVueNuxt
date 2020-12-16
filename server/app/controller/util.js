'use strict'
const svgCaptcha = require('svg-captcha')
const BaseController = require('./base')
const fse = require('fs-extra')
const path = require('path')

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
    /**
     * 模拟上传文件报错
     */
    if (Math.random() > 0.3) {
      return (this.ctx.status = 500)
    }
    const { ctx } = this
    const file = ctx.request.files[0]
    const { hash, name } = ctx.request.body
    const chunkPath = path.resolve(this.config.UPLOAD_DIR, hash)

    // 没有就要先创建这个目录
    if (!fse.existsSync(chunkPath)) {
      fse.mkdir(chunkPath)
    }

    await fse.move(file.filepath, `${chunkPath}/${name}`)
    this.message('切片上传成功')
  }

  async mergefile() {
    const { ext, hash, size } = this.ctx.request.body
    // 文件最终合并的路径
    const filePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`)
    await this.ctx.service.tools.mergeFile(filePath, hash, size)
    this.success({
      url: `/public/${hash}.${ext}`,
    })
  }

  async checkfile() {
    const { ctx } = this
    const { hash, ext } = ctx.request.body
    const filePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`)

    let uploaded = false
    let uploadedList = []

    if (fse.existsSync(filePath)) {
      // 文件存在
      uploaded = true
    } else {
      uploadedList = await this.getUploadedList(
        path.resolve(this.config.UPLOAD_DIR, hash)
      )
    }

    this.success({
      uploaded,
      uploadedList,
    })
  }

  async getUploadedList(dirPath) {
    return fse.existsSync(dirPath)
      ? (await fse.readdir(dirPath)).filter(name => name[0] !== '.')
      : []
  }
}

module.exports = UtilController
