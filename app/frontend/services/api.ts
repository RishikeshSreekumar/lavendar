const API_BASE_URL = '/api/backend'; // Using the Next.js proxy path

interface ApiOptions extends RequestInit {
  token?: string | null;
  isFormData?: boolean;
}

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const headers: HeadersInit = options.isFormData ? {} : { 'Content-Type': 'application/json' };
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const config: RequestInit = {
    method: options.method || 'GET',
    headers: { ...headers, ...options.headers },
  };

  if (options.body) {
    config.body = options.isFormData ? (options.body as FormData) : JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) { // No Content
    return null as T;
  }
  return response.json();
}

// --- Profile API ---
export interface Experience {
  id: string;
  title: string;
  company_name: string;
  location?: string;
  start_date: string;
  end_date?: string;
  description?: string;
  skills_used?: string[];
}

export interface Education {
  id: string;
  institution_name: string;
  degree: string;
  field_of_study?: string;
  start_date: string;
  end_date?: string;
  description?: string;
}

export interface UserProfile {
  user_id: number;
  handle?: string; // New field
  full_name?: string;
  bio?: string;
  profile_picture_url?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  experiences: Experience[];
  education_history: Education[];
}

// For updating, we send the core profile fields. Experiences/Education are separate.
export type UserProfileUpdateData = { // Changed from UserProfileCreateUpdateData for clarity
  handle?: string;
  full_name?: string;
  bio?: string;
  profile_picture_url?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  // Note: experiences and education_history are not part of the PUT /profiles/me/ payload
  // They are managed by their own dedicated endpoints.
};

export type ExperienceCreateData = Omit<Experience, 'id'>;


export const getProfile = (token: string): Promise<UserProfile> => {
  return request<UserProfile>('/profiles/me/', { token });
};

export const updateProfile = (data: UserProfileUpdateData, token: string): Promise<UserProfile> => {
  return request<UserProfile>('/profiles/me/', {
    method: 'PUT',
    body: data,
    token,
  });
};

// --- Experience API ---
export const addExperience = (data: ExperienceCreateData, token: string): Promise<Experience> => {
  return request<Experience>('/profiles/me/experiences/', {
    method: 'POST',
    body: data,
    token,
  });
};

export const updateExperience = (id: string, data: ExperienceCreateData, token: string): Promise<Experience> => {
  return request<Experience>(`/profiles/me/experiences/${id}`, {
    method: 'PUT',
    body: data,
    token,
  });
};

export const deleteExperience = (id: string, token: string): Promise<null> => {
  return request<null>(`/profiles/me/experiences/${id}`, {
    method: 'DELETE',
    token,
  });
};

// --- Public Profile API ---
export const getPublicProfileByHandle = (handle: string): Promise<UserProfile> => {
  return request<UserProfile>(`/profiles/handle/${handle}`);
};

// Placeholder for Education API functions if needed later
// export const addEducation = ...
// export const updateEducation = ...
// export const deleteEducation = ...
