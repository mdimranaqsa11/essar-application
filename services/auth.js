import { OAuthProvider } from 'appwrite';
import { clearAuthData, saveAuthData } from '../utils/storage';
import { account, APPWRITE_CONFIG, databases, ID, Query } from './appwrite';

export const authService = {
  // Register new student with email/password
  async register(email, password, name, phone) {
    try {
      const accountResponse = await account.create(
        ID.unique(),
        email,
        password,
        name
      );

      const now = new Date().toISOString();
      const userDoc = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.usersCollectionId,
        ID.unique(),
        {
          email,
          name,
          phone: phone || '',
          role: 'student',
          createdAt: now,
          updatedAt: now,
        }
      );

      await account.createEmailPasswordSession(email, password);
      const session = await account.get();
      await saveAuthData(session.$id, userDoc);

      return { user: userDoc, session };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  },

  // Login with email/password
  async login(email, password) {
    try {
      try {
        await account.deleteSession('current');
      } catch (e) {
        // Ignore
      }

      await account.createEmailPasswordSession(email, password);
      const accountData = await account.get();

      const userDocs = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.usersCollectionId,
        [Query.equal('email', email)]
      );

      if (userDocs.documents.length === 0) {
        await account.deleteSession('current');
        throw new Error('User not found in database');
      }

      const user = userDocs.documents[0];

      if (user.role !== 'student') {
        await account.deleteSession('current');
        throw new Error('Only students can access this app');
      }

      await saveAuthData(accountData.$id, user);
      return { user, session: accountData };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  },

  // Google Sign-In (OAuth)
  async loginWithGoogle() {
    try {
      // Delete existing session if any
      try {
        await account.deleteSession('current');
      } catch (e) {
        // Ignore
      }

      // Create OAuth2 session with Google
      // This will open browser for Google authentication
      await account.createOAuth2Session(
        OAuthProvider.Google,
        'elearn://oauth', // Success redirect
        'elearn://oauth', // Failure redirect
      );

      // After redirect, get account info
      const accountData = await account.get();

      // Check if user exists in database
      let userDocs = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.usersCollectionId,
        [Query.equal('email', accountData.email)]
      );

      let user;

      if (userDocs.documents.length === 0) {
        // Create new user document for Google sign-in
        const now = new Date().toISOString();
        const userDoc = await databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.usersCollectionId,
          ID.unique(),
          {
            email: accountData.email,
            name: accountData.name,
            phone: '',
            role: 'student',
            createdAt: now,
            updatedAt: now,
          }
        );
        user = userDoc;
      } else {
        user = userDocs.documents[0];
      }

      if (user.role !== 'student') {
        await account.deleteSession('current');
        throw new Error('Only students can access this app');
      }

      await saveAuthData(accountData.$id, user);
      return { user, session: accountData };
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw new Error(error.message || 'Google sign-in failed');
    }
  },

  // Logout
  async logout() {
    try {
      await account.deleteSession('current');
      await clearAuthData();
    } catch (error) {
      console.error('Logout error:', error);
      await clearAuthData();
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const accountData = await account.get();

      const userDocs = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.usersCollectionId,
        [Query.equal('email', accountData.email)]
      );

      if (userDocs.documents.length === 0) {
        return null;
      }

      return userDocs.documents[0];
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Update profile
  async updateProfile(userId, name, phone) {
    try {
      const updated = await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.usersCollectionId,
        userId,
        {
          name,
          phone: phone || '',
          updatedAt: new Date().toISOString(),
        }
      );

      return updated;
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Update failed');
    }
  },

  // Check authentication status
  async checkAuth() {
    try {
      await account.get();
      return true;
    } catch (error) {
      return false;
    }
  },
};
