const logger = {
  error: (message, error) => {
    console.error({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      error: error?.message || error,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    });
  },
  
  warn: (message, data = null) => {
    console.warn({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      data
    });
  },
  
  info: (message, data = null) => {
    console.info({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      data
    });
  }
};

module.exports = logger; 