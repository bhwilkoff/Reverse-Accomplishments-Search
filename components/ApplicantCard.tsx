import React from 'react';
import type { ApplicantProfile, SocialProfile } from '../types';
import { LinkedInIcon, TwitterIcon, InstagramIcon, TikTokIcon, GitHubIcon, WebsiteIcon } from './Icons';

const socialIconMap: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  linkedin: LinkedInIcon,
  twitter: TwitterIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  github: GitHubIcon,
  website: WebsiteIcon,
  personal: WebsiteIcon,
};

const SocialLink: React.FC<{ profile: SocialProfile }> = ({ profile }) => {
  const platformKey = profile.platform.toLowerCase().replace(/\s+/g, '');
  const Icon = Object.keys(socialIconMap).find(key => platformKey.includes(key)) 
    ? socialIconMap[Object.keys(socialIconMap).find(key => platformKey.includes(key))!] 
    : WebsiteIcon;

  return (
    <a
      href={profile.url}
      target="_blank"
      rel="noopener noreferrer"
      title={profile.platform}
      className="text-gray-400 hover:text-minerva-charcoal transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      <Icon className="w-6 h-6" />
    </a>
  );
};

const ApplicantCard: React.FC<{ applicant: ApplicantProfile }> = ({ applicant }) => {
  return (
    <div className="bg-minerva-snow rounded-lg shadow-lg overflow-hidden flex flex-col justify-between transform hover:scale-105 transition-transform duration-300 border border-minerva-ash">
      <div className="p-6 flex-grow">
        <div className="flex items-start space-x-4 mb-4">
          <img
            src={applicant.profileImageUrl}
            alt={applicant.name}
            className="w-16 h-16 rounded-full object-cover border-4 border-minerva-light-gray"
          />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-minerva-charcoal">{applicant.name}</h3>
            <p className="text-sm text-minerva-slate">{applicant.location}</p>
          </div>
        </div>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold text-gray-500 text-xs uppercase tracking-wider">Verifiable Source</h4>
          <a
            href={applicant.primarySourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block font-semibold text-minerva-charcoal hover:underline mt-1 text-base group"
          >
            {applicant.sourceTitle}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        <div className="space-y-3">
            <h4 className="font-semibold text-gray-800 text-sm">AI Summary & Reasoning:</h4>
            <p className="text-sm text-gray-700 italic">"{applicant.bio}"</p>
            <p className="text-gray-600 text-sm">{applicant.reasoning}</p>
        </div>
      </div>
      
      {applicant.socialProfiles && applicant.socialProfiles.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-minerva-ash flex items-center justify-end space-x-4">
          {applicant.socialProfiles.map((profile, index) => (
            <SocialLink key={`${profile.url}-${index}`} profile={profile} />
          ))}
        </div>
       )}
    </div>
  );
};

export default ApplicantCard;