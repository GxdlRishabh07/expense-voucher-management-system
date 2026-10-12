import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/database.js';
import { config } from '../config/index.js';

export const authController = {
  // Register new user
  async register(req, res, next) {
    try {
      const { name, email, password, role = 'employee', department = 'General', employee_code } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Full name, email, and password are required.'
        });
      }

      const cleanEmail = email.toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address.'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.'
        });
      }

      const allowedRoles = ['employee', 'director', 'accounts'];
      const selectedRole = allowedRoles.includes(role) ? role : 'employee';

      // Check if email already exists
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please log in instead.'
        });
      }

      // Auto-generate employee code if missing
      const generatedCode = employee_code?.trim() || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
      const hashedPassword = bcrypt.hashSync(password, 10);

      const result = db.prepare(`
        INSERT INTO users (name, email, password, role, department, employee_code)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(name.trim(), cleanEmail, hashedPassword, selectedRole, department.trim() || 'General', generatedCode);

      const newUser = db.prepare('SELECT id, name, email, role, department, employee_code FROM users WHERE id = ?').get(result.lastInsertRowid);

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      res.status(201).json({
        success: true,
        message: 'Account created successfully! You can now log in with your email.',
        data: {
          token,
          user: newUser
        }
      });
    } catch (err) {
      next(err);
    }
  },

  // Login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Both email and password are required.'
        });
      }

      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. User with this email does not exist.'
        });
      }

      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. Incorrect password.'
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employee_code: user.employee_code
      };

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: safeUser
        }
      });
    } catch (err) {
      next(err);
    }
  },

  // Get current logged-in user profile
  async getCurrentUser(req, res) {
    res.status(200).json({
      success: true,
      data: req.user
    });
  },

  // Demo accounts helper for effortless evaluation
  async getDemoUsers(req, res, next) {
    try {
      const users = db.prepare('SELECT id, name, email, role, department, employee_code FROM users ORDER BY id ASC').all();
      res.status(200).json({
        success: true,
        data: users
      });
    } catch (err) {
      next(err);
    }
  }
};
