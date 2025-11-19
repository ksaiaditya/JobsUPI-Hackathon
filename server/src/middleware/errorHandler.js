function notFound(req, res, _next) {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` })
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500
  res.status(status).json({ message: err.message || 'Server error' })
}

module.exports = { notFound, errorHandler }
