jest.mock('../configuration', () => ({ server: {} }))
jest.mock('../api', () => {})
jest.mock('../adldapClient', () => {})
// jest.mock('@kth/kth-node-monitor', () => {})

const systemCtrl = require('./systemCtrl')

describe('Not found', () => {
  test('Gets correct error code', done => {
    const req = { originalUrl: 'http://localhost' }

    const next = err => {
      expect(err).toBeInstanceOf(Error)
      expect(err.status).toBeDefined()
      expect(err.status).toEqual(404)
      expect(err.message).toMatch('http://localhost')
      done()
    }

    systemCtrl.notFound(req, {}, next)
  })
})

describe('System monitor', () => {
  test('Sends a correct monitor page', () => {
    const send = data =>
      expect(data).toEqual('APPLICATION_STATUS: OK\n\n\n\n- local system checks: OK\n\nHostname: LAPTOP-990TOHVI')
    const status = code => expect(code).toEqual(200)
    return systemCtrl.monitor({ headers: {} }, { status, type: () => ({ send }) })
  })
})
