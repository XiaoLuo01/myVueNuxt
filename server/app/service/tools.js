'use strict'
const { Service } = require('egg')
const nodemailer = require('nodemailer')
const path = require('path')
const fse = require('fs-extra')

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

  async mergeFile(filePath, hash, size) {
    // 切片的文件夹
    const chunkDir = path.resolve(this.config.UPLOAD_DIR, hash)
    // 拿到切片文件夹下面的所以切片hash
    let chunks = await fse.readdir(chunkDir)
    // 切片按顺序排列
    chunks.sort((a, b) => a.split('-')[1] - b.split('-')[1])
    // 路径加全
    chunks = chunks.map(cp => path.resolve(chunkDir, cp))
    await this.mergeChunks(chunks, filePath, size)
  }

  async mergeChunks(files, dest, size) {
    const pipStream = (filePath, writeStream) =>
      new Promise(resolve => {
        const readStream = fse.createReadStream(filePath)
        readStream.on('end', () => {
          fse.unlinkSync(filePath)
          resolve()
        })
        readStream.pipe(writeStream)
      })

    await Promise.all(
      // eslint-disable-next-line array-callback-return
      files.map((file, index) => {
        pipStream(
          file,
          fse.createWriteStream(dest, {
            start: index * size,
            end: (index + 1) * size,
          })
        )
      })
    )
  }
}
module.exports = ToolService
