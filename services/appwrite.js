import { Account, Client, Databases, Query, Storage } from 'appwrite';

// Appwrite Configuration
export const APPWRITE_CONFIG = {
  endpoint: 'https://sgp.cloud.appwrite.io/v1',
  projectId: '69299b090027358de2f2',
  databaseId: '692a998e0008678e1a62',

  // Collections
  usersCollectionId: 'users',
  coursesCollectionId: 'courses',
  contentsCollectionId: 'contents',
  paymentsCollectionId: 'payments',
  certificatesCollectionId: 'certificates',
  categoriesCollectionId: 'categories',
  enrollmentsCollectionId: 'enrollments', // You'll need to create this
  supportCollectionId: 'support', // You'll need to create this

  // Storage
  storageBucketId: 'certificates',
};

// Initialize Appwrite Client
const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

// Export services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export { ID } from 'appwrite';
export { Query };
