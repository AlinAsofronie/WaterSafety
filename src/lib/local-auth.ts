// Mock authentication for local development (bypasses AWS Cognito)

export interface LocalUser {
  email: string;
  name: string;
  id: string;
}

const DEFAULT_USER: LocalUser = {
  email: 'dev@localhost',
  name: 'Local Developer',
  id: 'local-dev-user',
};

class LocalAuthService {
  private currentUser: LocalUser | null = null;
  private isAuthenticated: boolean = false;

  constructor() {
    // Auto-login in local mode
    this.currentUser = DEFAULT_USER;
    this.isAuthenticated = true;
  }

  async getCurrentUser(): Promise<LocalUser> {
    return this.currentUser || DEFAULT_USER;
  }

  async signIn(email: string, password: string): Promise<LocalUser> {
    console.log('[Local Auth] Mock sign in for:', email);
    this.currentUser = {
      email,
      name: email.split('@')[0],
      id: `local-${Date.now()}`,
    };
    this.isAuthenticated = true;
    return this.currentUser;
  }

  async signOut(): Promise<void> {
    console.log('[Local Auth] Mock sign out');
    // Keep user logged in for development convenience
    // this.currentUser = null;
    // this.isAuthenticated = false;
  }

  async fetchAuthSession(): Promise<{ tokens?: { accessToken: string } }> {
    return {
      tokens: {
        accessToken: 'mock-local-token',
      },
    };
  }

  isSignedIn(): boolean {
    return this.isAuthenticated;
  }
}

export const localAuth = new LocalAuthService();

// Mock Amplify configuration for local development
export const configureLocalAuth = () => {
  console.log('[Local Auth] Using mock authentication - no AWS Cognito required');
};
