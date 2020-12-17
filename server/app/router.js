'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app
  const jwt = app.middleware.jwt({ app })

  router.get('/', controller.home.index)

  // 验证码接口
  router.get('/captcha', controller.util.captcha)
  router.get('/sendcode', controller.util.sendcode)
  // 文件上传接口
  router.post('/uploadfile', controller.util.uploadfile)
  router.post('/mergefile', controller.util.mergefile)
  router.post('/checkfile', controller.util.checkfile)

  router.group({ name: 'user', prefix: '/user' }, router => {
    const {
      register,
      login,
      verify,
      info,
      isfollow,
      follow,
      cancelFollow,
      following,
      followers,
      articleStatus,
      likeArticle,
      cancelLikeArticle,
    } = controller.user

    router.post('/register', register)
    router.post('/login', login)
    router.get('/verify', verify)
    router.get('/info', jwt, info)
    router.get('/detail', jwt, info)

    router.get('/follow/:id', jwt, isfollow)
    router.put('/follow/:id', jwt, follow)
    router.delete('/follow/:id', jwt, cancelFollow)

    router.get('/:id/following', following)
    router.get('/:id/followers', followers)
    router.get('/article/:id', jwt, articleStatus)

    // // .put点赞，。delete取消点赞
    router.put('/likearticle/:id', jwt, likeArticle)
    router.delete('/likearticle/:id', jwt, cancelLikeArticle)
  })

  router.group({ name: 'artical', prefix: '/artical' }, router => {
    const { index, create, detail } = controller.artical

    router.get('/', index)
    router.post('/create', jwt, create)
    router.get('/:id', detail)
  })
}
