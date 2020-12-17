'use strict'
const BaseController = require('./base')
const marked = require('marked')

class ArticalController extends BaseController {
  async index() {
    const { ctx } = this
    const articals = await ctx.model.Artical.find()
      .populate('author')
      .sort({ createdAt: -1 })

    this.success(articals)
  }
  async detail() {
    // 访问量统计
    const { ctx } = this
    const { id } = ctx.params
    const article = await ctx.model.Artical.findOneAndUpdate(
      { _id: id },
      { $inc: { views: 1 } }
    ).populate('author')
    this.success(article)
  }

  async create() {
    const { ctx } = this
    const { userid } = ctx.state
    const { content } = ctx.request.body

    const title = content.split('\n').find(v => {
      return v.indexOf('# ') === 0
    })

    const obj = {
      title: title.replace('# ', ''),
      artical: content, // 内部编辑的时候看的
      artical_html: marked(content), // 给外部显示看的
      author: userid,
    }

    const ret = await ctx.model.Artical.create(obj)
    console.log('ret', ret)
    if (ret._id) {
      this.success({
        id: ret._id,
        title: ret.title,
      })
    } else {
      this.error('创建失败')
    }
  }
}

module.exports = ArticalController
