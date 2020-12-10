'use strict'
const { Service } = require('egg')
const nodemailer = require('nodemailer')

const userEmail = 'fuxiaoluo304@163.com'
const transporter = nodemailer.createTransport({
  service: '163',
  secureConnection: true,
  auth: {
    user: userEmail,
    pass: 'carol101', // 对应邮箱的授权码
  },
})

class ToolService extends Service {
  async sendMail(email, subject, text, html) {
    const mailOption = {
      from: `Carol<${userEmail}>`,
      cc: userEmail, // 抄送给自己
      to: email,
      subject,
      text,
      html,
    }

    try {
      await transporter.sendMail(mailOption)
      return true
    } catch (err) {
      console.log('email error', err)
      return false
    }
  }
}
module.exports = ToolService
