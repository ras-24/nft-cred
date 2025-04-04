interface CheckUserParams {
  wallet: string;
}

interface RegisterUserParams {
  wallet: string;
}

interface User {
  id: string;
  wallet: string;
}

export const userService = {
  checkUser: async (params: CheckUserParams): Promise<User> => {
    try {
      const response = await fetch(`/api/user?wallet=${params.wallet}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check user');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error checking user:', error);
      throw error;
    }
  },

  registerUser: async (params: RegisterUserParams): Promise<User> => {
    try {
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      });
      
      if (!response.ok) {
        throw new Error('Failed to register user');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },
};
