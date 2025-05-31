'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter }
from 'next/navigation';
import { getPublicProfileByHandle, UserProfile, Experience, Education } from '@/services/api';
import Link from 'next/link'; // For navigation links

// Helper component for displaying a single experience
const ExperienceCard: React.FC<{ experience: Experience }> = ({ experience }) => (
  <div className="mb-6 p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
    <h3 className="text-xl font-semibold text-indigo-700">{experience.title}</h3>
    <p className="text-md text-gray-800">{experience.company_name}
      {experience.location && <span className="text-sm text-gray-500"> ({experience.location})</span>}
    </p>
    <p className="text-sm text-gray-500">
      {new Date(experience.start_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })} –
      {experience.end_date ? new Date(experience.end_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Present'}
    </p>
    {experience.description && <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{experience.description}</p>}
    {experience.skills_used && experience.skills_used.length > 0 && (
      <p className="mt-2 text-xs text-gray-500">
        Skills: <span className="font-medium text-gray-700">{experience.skills_used.join(', ')}</span>
      </p>
    )}
  </div>
);

// Helper component for displaying a single education item
const EducationCard: React.FC<{ education: Education }> = ({ education }) => (
  <div className="mb-6 p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
    <h3 className="text-xl font-semibold text-indigo-700">{education.degree}</h3>
    <p className="text-md text-gray-800">{education.institution_name}</p>
    {education.field_of_study && <p className="text-sm text-gray-600">{education.field_of_study}</p>}
    <p className="text-sm text-gray-500">
      {new Date(education.start_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })} –
      {education.end_date ? new Date(education.end_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Present'}
    </p>
    {education.description && <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{education.description}</p>}
  </div>
);


export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const handle = params?.handle as string | undefined;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (handle) {
      setLoading(true);
      setError(null);
      getPublicProfileByHandle(handle)
        .then((data) => {
          setProfile(data);
        })
        .catch((err: any) => {
          console.error("Failed to fetch profile:", err);
          setError(err.message?.includes("404") || err.message?.toLowerCase().includes("not found")
            ? "Profile not found."
            : "Failed to load profile. Please try again later.");
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (!params?.handle && typeof window !== 'undefined') { // Handle not available in params yet (dev server sometimes)
        // This case might be less relevant with App Router if params are guaranteed server-side first
        // but good for robustness during dev.
        const pathHandle = window.location.pathname.split('/').pop();
        if (pathHandle && pathHandle !== "[handle]") {
            router.replace(`/p/${pathHandle}`); // Trigger re-render with handle in params
        }
    }
  }, [handle, params, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-700 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <p className="text-2xl text-red-600 mb-4">{error}</p>
        <Link href="/" className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
          Go to Homepage
        </Link>
      </div>
    );
  }

  if (!profile) {
    // This case should ideally be covered by error state if profile not found
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-500">Profile data is not available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <header className="bg-white shadow-md rounded-lg p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center">
            {profile.profile_picture_url ? (
              <img
                src={profile.profile_picture_url}
                alt={profile.full_name || profile.handle || 'Profile'}
                className="w-32 h-32 rounded-full object-cover mr-0 sm:mr-8 mb-4 sm:mb-0 border-4 border-indigo-500 shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-indigo-500 text-white flex items-center justify-center text-5xl font-bold mr-0 sm:mr-8 mb-4 sm:mb-0 shadow-lg">
                {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : (profile.handle ? profile.handle.charAt(0).toUpperCase() : '?')}
              </div>
            )}
            <div className="text-center sm:text-left">
              <h1 className="text-4xl font-bold text-gray-900">{profile.full_name || 'Anonymous User'}</h1>
              {profile.handle && <p className="text-xl text-indigo-600 mt-1">@{profile.handle}</p>}
              {profile.bio && <p className="mt-3 text-md text-gray-600">{profile.bio}</p>}
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap justify-center sm:justify-start gap-4">
            {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 transition-colors">LinkedIn</a>}
            {profile.github_url && <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 transition-colors">GitHub</a>}
            {profile.website_url && <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 transition-colors">Website</a>}
          </div>
        </header>

        {/* Experiences Section */}
        {profile.experiences && profile.experiences.length > 0 && (
          <section className="mb-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-indigo-500">Work Experience</h2>
            <div>
              {profile.experiences.map(exp => <ExperienceCard key={exp.id} experience={exp} />)}
            </div>
          </section>
        )}

        {/* Education Section */}
        {profile.education_history && profile.education_history.length > 0 && (
          <section>
            <h2 className="text-3xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-indigo-500">Education</h2>
            <div>
              {profile.education_history.map(edu => <EducationCard key={edu.id} education={edu} />)}
            </div>
          </section>
        )}

        {(profile.experiences.length === 0 && profile.education_history.length === 0) && (
             <div className="text-center text-gray-500 py-10">
                <p>This profile doesn't have any experiences or education history shared yet.</p>
            </div>
        )}

      </div>
    </div>
  );
}
