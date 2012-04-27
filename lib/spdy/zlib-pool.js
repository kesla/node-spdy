var zlibpool = exports,
    spdy = require('../spdy');

//
// ### function Pool ()
// Zlib streams pool
//
function Pool() {
  this.pool = {
    'spdy/2': [],
    'spdy/3': []
  };
}

//
// ### function create ()
// Returns instance of Pool
//
zlibpool.create = function create() {
  return new Pool();
};

var x = 0;
//
// ### function get ()
// Returns pair from pool or a new one
//
Pool.prototype.get = function get(version, callback) {
  var version_number = version.split(/\//)[1],
      dictionary = spdy.protocol[version_number].dictionary;

  if (this.pool[version].length > 0) {
    return this.pool[version].pop();
  } else {
    return {
      deflate: spdy.utils.createDeflate(dictionary),
      inflate: spdy.utils.createInflate(dictionary)
    };
  }
};

//
// ### function put (pair)
// Puts pair into pool
//
Pool.prototype.put = function put(version, pair) {
  var self = this,
      waiting = 2;

  spdy.utils.resetZlibStream(pair.inflate, done);
  spdy.utils.resetZlibStream(pair.deflate, done);

  function done() {
    if (--waiting === 0) {
      self.pool[version].push(pair);
    }
  }
};