import React, { useState } from 'react';
import type { SearchFilters } from '../types';

interface SearchFormProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  isLoading: boolean;
}

const sourceTypes = ["GitHub", "Behance", "Dribbble", "Personal Blog", "Research Paper"];
const accomplishmentAreas = [
  "Competitions", "Technology & Innovation", "Jobs & Internships", 
  "Community Service & Activism", "Organization & Leadership", "Athletics", 
  "Arts & Performance", "Academics & Research", "Travel & Exchange", "Personal Growth"
];


const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedSourceTypes, setSelectedSourceTypes] = useState<string[]>([]);
  const [selectedAccomplishmentAreas, setSelectedAccomplishmentAreas] = useState<string[]>([]);

  const handleSourceTypeToggle = (type: string) => {
    setSelectedSourceTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleAccomplishmentToggle = (area: string) => {
    setSelectedAccomplishmentAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), { 
        location: location.trim(), 
        sourceTypes: selectedSourceTypes,
        accomplishmentAreas: selectedAccomplishmentAreas,
      });
    }
  };
  
  const exampleSearches = [
    "International Math Olympiad high school winner",
    "Student who built a clean water filter project",
    "Teenager develops popular mobile app",
    "Winner of Regeneron Science Talent Search"
  ];

  const handleExampleClick = (example: string) => {
    setQuery(example);
    // Reset filters for example searches for simplicity
    setLocation('');
    setSelectedSourceTypes([]);
    setSelectedAccomplishmentAreas([]);
    onSearch(example, { location: '', sourceTypes: [], accomplishmentAreas: [] });
  };


  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-minerva-snow p-6 rounded-lg shadow-md border border-minerva-ash">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., 'award-winning debater', 'science fair champion Texas'"
            className="w-full px-5 py-4 pr-16 text-gray-700 bg-minerva-snow border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-minerva-saffron transition-shadow"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-0 flex items-center justify-center w-14 h-full text-white bg-minerva-charcoal rounded-r-full hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>

        <div className="mt-6 border-t pt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">Refine Search (Optional)</h3>
          
          {/* Areas of Accomplishment */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-2 text-center">Areas of Accomplishment</label>
            <div className="flex flex-wrap gap-2 justify-center">
              {accomplishmentAreas.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => handleAccomplishmentToggle(area)}
                  disabled={isLoading}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors disabled:opacity-50 ${
                    selectedAccomplishmentAreas.includes(area)
                      ? 'bg-minerva-charcoal text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start mt-4 border-t pt-4">
            {/* Location Input */}
            <div>
               <label htmlFor="location" className="block text-xs font-medium text-gray-600 mb-1">Location</label>
               <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., California, around the world"
                className="w-full px-4 py-2 text-sm text-gray-700 bg-minerva-snow border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-minerva-saffron"
                disabled={isLoading}
              />
            </div>
            {/* Source Types */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Source Type</label>
              <div className="flex flex-wrap gap-2">
                {sourceTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleSourceTypeToggle(type)}
                    disabled={isLoading}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors disabled:opacity-50 ${
                      selectedSourceTypes.includes(type)
                        ? 'bg-minerva-charcoal text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
       <div className="text-center mt-4 text-sm text-gray-600">
        <p>Or try an example:</p>
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {exampleSearches.map((example) => (
            <button
              key={example}
              onClick={() => handleExampleClick(example)}
              disabled={isLoading}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors text-xs disabled:opacity-50"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchForm;