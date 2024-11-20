exports.authentication = async (req, res, next) => {
    try {
      let token;
      // Check if the token is in the cookies
      if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
      } else if(req.query || req.params){
         token = req.query.token || req.params.token
      } else {
        // Check if the token is in the Authorization header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.split(' ')[1];
        }
      }
  
      if (!token) {
        return res.status(401).json({success:false, message : "Please Sign in to your account"})
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Find the user by the id in the token
      const user = await userModel.findById(decoded.id);
  
      if (!user) {
        return res.status(401).render('login', {
          message: 'User not found. Please log in.'
        });
      }
  
      // Attach the user object to the request
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).render('login', {
        message: 'Invalid token. Please log in.'
      });
    }
  };