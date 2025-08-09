// Authentication controller handles auth-related business logic
const authController = {
  // User login
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      
      // Mock authentication - replace with actual auth logic
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Mock token generation
      const token = 'mock-jwt-token-' + Date.now();
      
      res.status(200).json({
        success: true,
        data: {
          token,
          user: {
            id: 1,
            email,
            name: 'John Doe'
          }
        },
        message: 'Login successful'
      });
    } catch (error) {
      next(error);
    }
  },

  // User registration
  register: async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      
      // Mock registration - replace with actual registration logic
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required'
        });
      }

      const newUser = {
        id: Date.now(),
        name,
        email,
        createdAt: new Date()
      };

      res.status(201).json({
        success: true,
        data: newUser,
        message: 'Registration successful'
      });
    } catch (error) {
      next(error);
    }
  },

  // Logout
  logout: async (req, res, next) => {
    try {
      // Mock logout logic
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;