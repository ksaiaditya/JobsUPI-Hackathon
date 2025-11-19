function ping(_req, res) {
  res.json({ status: 'ok', api: 'v1', time: new Date().toISOString() })
}

module.exports = { ping }
