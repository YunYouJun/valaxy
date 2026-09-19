// Main/preload/renderer are bundled; Node tools live in extraResources.
// Returning false also disables electron-builder's workspace dependency scan.
module.exports = async () => false
