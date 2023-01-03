// This file is node red's. User should have these configurations, or make them by hand..

module.exports = {
  contextStorage: {
    default: "memoryOnly",
    memoryOnly: { module: 'memory' },
    file: { module: 'localfilesystem' }
  },
  logging: {
    console: {
      level:"debug",
      metrics: false,
      audit: false
    }
  }
}
