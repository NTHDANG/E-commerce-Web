const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      return res.status(500).json({
        message: error.message || "Internal Server Error",
        stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
        error,
      });
    }
  };
};
export default asyncHandler;
