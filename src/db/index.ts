import PocketBase from 'pocketbase';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

export const POCKET_BASE_URL = 'http://127.0.0.1:8090';

export class DatabaseClient {
  // the instance of PocketBase
  client: PocketBase;

  constructor() {
    // instantiate PocketBase before we use
    this.client = new PocketBase(POCKET_BASE_URL);
  }

  // authenticate handles the authentication of the user
  async authenticate(email: string, password: string) {
    try {
      const result = await this.client
        .collection('users')
        .authWithPassword(email, password);
      // If there is no token in the result, it means something went wrong
      if (!result?.token) {
        throw new Error('Invalid email or password');
      }
      return result;
    } catch (err) {
      console.error(err);
      throw new Error('Invalid email or password');
    }
  }

  // register handles the creation of a new user
  async register(
    email: string,
    password: string,
    passwordConfirm: string,
    companyId: string,
    firstName: string,
    lastName: string
  ) {
    try {
      // We provide only the minimum required fields by user create method
      const result = await this.client.collection('users').create({
        email,
        password,
        passwordConfirm,
        companyId,
        firstName,
        lastName,
      });

      return result;
    } catch (err) {
      console.log('err', err);
    }
  }

  // isAuthenticated takes cookieStore from the request to check for the required tokens in the cookie
  async isAuthenticated(cookieStore: ReadonlyRequestCookies) {
    const cookie = cookieStore.get('pb_auth');
    if (!cookie) {
      return false;
    }

    // loadFromCookie applies the cookie data before checking the user is authenticated
    this.client.authStore.loadFromCookie(cookie?.value || '');
    return this.client.authStore.isValid || false;
  }

  // getUser is similar to isAuthenticated, the only difference is the returned data type
  async getUser(cookieStore: ReadonlyRequestCookies) {
    const cookie = cookieStore.get('pb_auth');
    if (!cookie) {
      return false;
    }

    this.client.authStore.loadFromCookie(cookie?.value || '');
    return this.client.authStore.model;
  }

  // Create a new company
  async createCompany(name: string, phone: string) {
    try {
      const result = await this.client.collection('companies').create({
        name,
        phone,
      });

      return result.id;
    } catch (err) {
      throw new Error('Failed to create company');
    }
  }

  // Get all companies
  async getCategories() {
    try {
      const result = await this.client
        .collection('productCategories')
        .getFullList({
          sort: '-created',
        });
      return result;
    } catch (err) {
      console.error('-----', err);
      throw new Error('Failed to get categories');
    }
  }

  // Get all products
  async getProducts() {
    try {
      const result = await this.client.collection('products').getFullList();
      return result;
    } catch (err) {
      console.error('-----', err);
      throw new Error('Failed to get products');
    }
  }

  // Subscribe to products
  async subscribeToProducts() {
    try {
      const result = await this.client
        .collection('products')
        .subscribe('*', (e) => {
          console.log('Event:', e);
        });
      return result;
    } catch (err) {
      console.error('-----', err);
      throw new Error('Failed to subscribe to products');
    }
  }

  // Unsubscribe from products
  async unsubscribeFromProducts() {
    try {
      const result = await this.client.collection('products').unsubscribe('*');
      return result;
    } catch (err) {
      console.error('-----', err);
      throw new Error('Failed to unsubscribe from products');
    }
  }

  // Create a new product
  async createProduct(
    name: string,
    description: string,
    unit_price: number,
    reorder_level: number,
    lead_time: number,
    category_id: string
  ) {
    try {
      const result = await this.client.collection('products').create({
        name,
        description,
        unit_price,
        category: category_id,
        reorder_level,
        lead_time,
      });

      return result;
    } catch (err) {
      console.error('-----', err);
      throw new Error('Failed to create product');
    }
  }

  // Get a single product
  async getProduct(id: string) {
    try {
      const result = await this.client.collection('products').getOne(id);
      return result;
    } catch (err) {
      console.error('-----', err);
      throw new Error('Failed to get product');
    }
  }

  // Update a product
  async updateProduct(
    id: string,
    name: string,
    description: string,
    unit_price: number,
    reorder_level: number,
    lead_time: number,
    category_id: string
  ) {
    try {
      const result = await this.client.collection('products').update(id, {
        name,
        description,
        unit_price,
        category: category_id,
        reorder_level,
        lead_time,
      });

      return result;
    } catch (err) {
      console.error('-----', err);
      throw new Error('Failed to update product');
    }
  }
}

// We create an instance of the DatabaseClient that can be used throughout the app.
export const db = new DatabaseClient();

export default db;
