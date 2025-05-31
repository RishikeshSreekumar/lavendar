'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  getProfile,
  updateProfile,
  addExperience,
  updateExperience,
  deleteExperience,
  UserProfile,
  Experience,
  ExperienceCreateData,
  UserProfileUpdateData,
} from '@/services/api';
import Link from 'next/link'; // Import Link for navigation

// Helper to get token from localStorage
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileEditData, setProfileEditData] = useState<UserProfileUpdateData>({}); // Updated type
  const [handleError, setHandleError] = useState<string | null>(null); // For handle conflict error

  // Experience form state
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [currentExperience, setCurrentExperience] = useState<ExperienceCreateData | null>(null);
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);

  // Initial data fetch
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/signin');
      return;
    }
    fetchProfileData(token);
  }, [router]);

  const fetchProfileData = async (token: string) => {
    try {
      setIsLoading(true);
      const data = await getProfile(token);
      setProfile(data);
      setProfileEditData({ // Initialize edit form with fetched data
        handle: data.handle || '', // Add handle
        full_name: data.full_name || '',
        bio: data.bio || '',
        profile_picture_url: data.profile_picture_url || '',
        linkedin_url: data.linkedin_url || '',
        github_url: data.github_url || '',
        website_url: data.website_url || '',
      });
      setError(null);
      setHandleError(null); // Clear handle error on successful fetch
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile.');
      if (err.message.includes("401") || err.message.includes("validate credentials")) {
        localStorage.removeItem('token');
        router.push('/signin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    router.push('/signin');
  };

  // --- Profile Edit Form Handlers ---
  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileEditData(prev => ({ ...prev, [name]: value }));
    if (name === 'handle') { // Clear handle error when user types in handle field
      setHandleError(null);
    }
  };

  const handleProfileEditSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const token = getToken();
    if (!token || !profile) return;
    setHandleError(null); // Clear previous handle error

    try {
      const dataToUpdate: UserProfileUpdateData = {
        handle: profileEditData.handle, // Add handle
        full_name: profileEditData.full_name,
        bio: profileEditData.bio,
        profile_picture_url: profileEditData.profile_picture_url,
        linkedin_url: profileEditData.linkedin_url,
        github_url: profileEditData.github_url,
        website_url: profileEditData.website_url,
      };
      const updatedProfile = await updateProfile(dataToUpdate, token);
      setProfile(updatedProfile);
      setIsEditingProfile(false);
      setError(null); // Clear general error
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes("handle already taken")) {
        setHandleError("This handle is already taken. Please choose another.");
      } else {
        setError(err.message || 'Failed to update profile.');
      }
    }
  };

  // --- Experience Form Handlers ---
  const handleExperienceInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentExperience(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setCurrentExperience(prev => prev ? { ...prev, skills_used: skills } : null);
  };

  const openNewExperienceForm = () => {
    setCurrentExperience({ title: '', company_name: '', start_date: '', skills_used: [] });
    setEditingExperienceId(null);
    setShowExperienceForm(true);
  };

  const openEditExperienceForm = (exp: Experience) => {
    setCurrentExperience({ ...exp }); // All fields from Experience are in ExperienceCreateData
    setEditingExperienceId(exp.id);
    setShowExperienceForm(true);
  };

  const handleExperienceSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const token = getToken();
    if (!token || !currentExperience) return;

    try {
      if (editingExperienceId) {
        await updateExperience(editingExperienceId, currentExperience, token);
      } else {
        await addExperience(currentExperience, token);
      }
      setShowExperienceForm(false);
      setCurrentExperience(null);
      setEditingExperienceId(null);
      fetchProfileData(token); // Refresh profile to get updated experiences list
      setError(null);
    } catch (err: any) {
      setError(err.message || `Failed to ${editingExperienceId ? 'update' : 'add'} experience.`);
    }
  };

  const handleDeleteExperience = async (expId: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;
    const token = getToken();
    if (!token) return;

    try {
      await deleteExperience(expId, token);
      fetchProfileData(token); // Refresh
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete experience.');
    }
  };


  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-700 text-xl">Loading profile...</p></div>;
  }

  if (error && !profile) { // Critical error, can't load profile
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button onClick={handleSignOut} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Go to Sign In</button>
      </div>
    );
  }

  if (!profile) { // Should be covered by isLoading or error state, but as a fallback
     return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <p className="text-gray-700">No profile data available. Try signing out and in again.</p>
            <button onClick={handleSignOut} className="ml-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">Sign Out</button>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        <button
          onClick={handleSignOut}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition duration-150"
        >
          Sign Out
        </button>
      </header>

      {error && <p className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}

      {/* Profile Display Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex items-center mb-4">
          {profile.profile_picture_url ? (
            <img src={profile.profile_picture_url as string} alt={profile.full_name || 'Profile'} className="w-24 h-24 rounded-full mr-6 object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-300 mr-6 flex items-center justify-center text-gray-500 text-3xl">
              {profile.full_name ? profile.full_name.charAt(0) : '?'}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-semibold text-gray-700">{profile.full_name || 'N/A'}</h2>
            {profile.handle && <p className="text-md text-indigo-600">@{profile.handle}</p>}
            <p className="text-gray-600 mt-1">{profile.bio || 'No bio available.'}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
          <p><strong className="text-gray-600">User ID:</strong> <span className="text-gray-800">{profile.user_id}</span></p>
          <p><strong className="text-gray-600">LinkedIn:</strong> <a href={profile.linkedin_url as string} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{profile.linkedin_url || 'N/A'}</a></p>
          <p><strong className="text-gray-600">GitHub:</strong> <a href={profile.github_url as string} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{profile.github_url || 'N/A'}</a></p>
          <p><strong className="text-gray-600">Website:</strong> <a href={profile.website_url as string} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{profile.website_url || 'N/A'}</a></p>
        </div>
        <button
          onClick={() => {
            setIsEditingProfile(true);
            setHandleError(null); // Clear handle error when opening form
            // Ensure edit form data is up-to-date with current profile state
            setProfileEditData({
              handle: profile.handle || '',
              full_name: profile.full_name || '',
              bio: profile.bio || '',
              profile_picture_url: profile.profile_picture_url || '',
              linkedin_url: profile.linkedin_url || '',
              github_url: profile.github_url || '',
              website_url: profile.website_url || '',
            });
          }}
          className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition duration-150"
        >
          Edit Profile
        </button>
        {/* "Preview Public Profile" Button */}
        {profile.handle ? (
          <Link
            href={`/p/${profile.handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 ml-4 inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition duration-150"
          >
            Preview Public Profile
          </Link>
        ) : (
          <button
            disabled
            title="Set a handle in 'Edit Profile' to enable public profile preview."
            className="mt-6 ml-4 inline-block bg-gray-400 text-white font-semibold py-2 px-4 rounded-md shadow-sm cursor-not-allowed"
          >
            Preview Public Profile (Set Handle First)
          </button>
        )}
      </div>

      {/* Profile Edit Form (Modal/Inline) */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-screen overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Edit Your Profile</h3>
            <form onSubmit={handleProfileEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="handle" className="block text-sm font-medium text-gray-700">Handle</label>
                <input
                  type="text"
                  name="handle"
                  id="handle"
                  value={profileEditData.handle || ''}
                  onChange={handleProfileInputChange}
                  className="mt-1 block w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="youruniquehandle"
                />
                {handleError && <p className="mt-1 text-xs text-red-600">{handleError}</p>}
              </div>
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" name="full_name" id="full_name" value={profileEditData.full_name || ''} onChange={handleProfileInputChange} className="mt-1 block w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-md shadow-sm sm:text-sm" />
              </div>
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea name="bio" id="bio" value={profileEditData.bio || ''} onChange={handleProfileInputChange} rows={3} className="mt-1 block w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-md shadow-sm sm:text-sm"></textarea>
              </div>
              <div>
                <label htmlFor="profile_picture_url" className="block text-sm font-medium text-gray-700">Profile Picture URL</label>
                <input type="url" name="profile_picture_url" id="profile_picture_url" value={profileEditData.profile_picture_url || ''} onChange={handleProfileInputChange} className="mt-1 block w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-md shadow-sm sm:text-sm" />
              </div>
              <div>
                <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                <input type="url" name="linkedin_url" id="linkedin_url" value={profileEditData.linkedin_url || ''} onChange={handleProfileInputChange} className="mt-1 block w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-md shadow-sm sm:text-sm" />
              </div>
              <div>
                <label htmlFor="github_url" className="block text-sm font-medium text-gray-700">GitHub URL</label>
                <input type="url" name="github_url" id="github_url" value={profileEditData.github_url || ''} onChange={handleProfileInputChange} className="mt-1 block w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-md shadow-sm sm:text-sm" />
              </div>
              <div>
                <label htmlFor="website_url" className="block text-sm font-medium text-gray-700">Website URL</label>
                <input type="url" name="website_url" id="website_url" value={profileEditData.website_url || ''} onChange={handleProfileInputChange} className="mt-1 block w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-md shadow-sm sm:text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setIsEditingProfile(false); setHandleError(null); } } className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Experiences Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Work Experience</h3>
          <button
            onClick={openNewExperienceForm}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-md shadow-sm text-sm transition duration-150"
          >
            + Add Experience
          </button>
        </div>
        {profile.experiences && profile.experiences.length > 0 ? (
          <ul className="space-y-6">
            {profile.experiences.map((exp) => (
              <li key={exp.id} className="border border-gray-200 p-4 rounded-md hover:shadow-lg transition-shadow">
                <h4 className="text-lg font-semibold text-indigo-700">{exp.title}</h4>
                <p className="text-md text-gray-700">{exp.company_name} <span className="text-sm text-gray-500">({exp.location || 'N/A'})</span></p>
                <p className="text-sm text-gray-500">{exp.start_date} – {exp.end_date || 'Present'}</p>
                <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{exp.description || 'No description.'}</p>
                {exp.skills_used && exp.skills_used.length > 0 && (
                    <p className="mt-2 text-xs text-gray-500">Skills: <span className="font-medium text-gray-600">{exp.skills_used.join(', ')}</span></p>
                )}
                <div className="mt-3 flex gap-3">
                  <button onClick={() => openEditExperienceForm(exp)} className="text-xs px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md">Edit</button>
                  <button onClick={() => handleDeleteExperience(exp.id)} className="text-xs px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No work experience added yet.</p>
        )}
      </div>

      {/* Add/Edit Experience Form (Modal/Inline) */}
      {showExperienceForm && currentExperience && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-screen overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">{editingExperienceId ? 'Edit' : 'Add New'} Experience</h3>
            <form onSubmit={handleExperienceSubmit}>
              {/* Common form fields for Experience */}
              <div className="mb-3">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title*</label>
                <input type="text" name="title" id="title" value={currentExperience.title} onChange={handleExperienceInputChange} required className="mt-1 block w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-md shadow-sm sm:text-sm" />
              </div>
              <div className="mb-3">
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">Company Name*</label>
                <input type="text" name="company_name" id="company_name" value={currentExperience.company_name} onChange={handleExperienceInputChange} required className="mt-1 block w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-md shadow-sm sm:text-sm" />
              </div>
              <div className="mb-3">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                <input type="text" name="location" id="location" value={currentExperience.location || ''} onChange={handleExperienceInputChange} className="mt-1 block w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-md shadow-sm sm:text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Start Date*</label>
                  <input type="text" name="start_date" id="start_date" placeholder="YYYY-MM-DD" value={currentExperience.start_date} onChange={handleExperienceInputChange} required className="mt-1 block w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">End Date</label>
                  <input type="text" name="end_date" id="end_date" placeholder="YYYY-MM-DD or Present" value={currentExperience.end_date || ''} onChange={handleExperienceInputChange} className="mt-1 block w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" id="description" value={currentExperience.description || ''} onChange={handleExperienceInputChange} rows={4} className="mt-1 block w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-md shadow-sm sm:text-sm"></textarea>
              </div>
               <div className="mb-4">
                <label htmlFor="skills_used" className="block text-sm font-medium text-gray-700">Skills Used (comma-separated)</label>
                <input type="text" name="skills_used" id="skills_used" value={(currentExperience.skills_used || []).join(', ')} onChange={handleSkillsChange} className="mt-1 block w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-md shadow-sm sm:text-sm" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowExperienceForm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">{editingExperienceId ? 'Save Changes' : 'Add Experience'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Education section would follow a similar pattern */}
    </div>
  );
}
