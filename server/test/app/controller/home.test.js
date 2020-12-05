'use strict'

const { app, assert } = require('egg-mock/bootstrap')

describe('test/app/controller/home.test.js', () => {
  it('should assert', () => {
    const pkg = require('../../../package.json')
    assert(app.config.keys.startsWith(pkg.name))

    // const ctx = app.mockContext({});
    // yield ctx.service.xx();
  })

  it('should GET /', () => {
    // eslint-disable-next-line newline-per-chained-call
    return app.httpRequest().get('/').expect('hi, egg').expect(200)
  })
})
