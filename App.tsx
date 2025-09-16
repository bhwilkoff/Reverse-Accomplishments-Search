import React, { useState } from 'react';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import ApplicantCard from './components/ApplicantCard';
import { findApplicants } from './services/geminiService';
import type { ApplicantProfile, SearchFilters } from './types';
import { SearchStatus } from './types';

const App: React.FC = () => {
  const [applicants, setApplicants] = useState<ApplicantProfile[]>([]);
  const [status, setStatus] = useState<SearchStatus>(SearchStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentFilters, setCurrentFilters] = useState<SearchFilters | null>(null);
  const [isFindingMore, setIsFindingMore] = useState(false);
  const [noMoreResults, setNoMoreResults] = useState(false);

  const handleSearch = async (query: string, filters: SearchFilters) => {
    setStatus(SearchStatus.LOADING);
    setApplicants([]);
    setError(null);
    setNoMoreResults(false);
    setCurrentQuery(query);
    setCurrentFilters(filters);

    try {
      const results = await findApplicants(query, filters);
      setApplicants(results);
      if (results.length === 0) {
        setNoMoreResults(true);
      }
      setStatus(SearchStatus.SUCCESS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setStatus(SearchStatus.ERROR);
    }
  };
  
  const handleFindMore = async () => {
    if (!currentQuery || !currentFilters) return;

    setIsFindingMore(true);
    setError(null);
    try {
      const existingUrls = applicants.map(a => a.primarySourceUrl);
      const newResults = await findApplicants(currentQuery, currentFilters, existingUrls);
      
      if (newResults.length > 0) {
        setApplicants(prev => [...prev, ...newResults]);
      } else {
        setNoMoreResults(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching more results.');
    } finally {
      setIsFindingMore(false);
    }
  };


  const renderContent = () => {
    switch (status) {
      case SearchStatus.IDLE:
        return (
          <div className="text-center text-minerva-slate mt-12">
            <h2 className="text-2xl font-semibold">Welcome</h2>
            <p className="mt-2">Enter keywords above to discover promising future Minerva students.</p>
          </div>
        );
      case SearchStatus.LOADING:
         return (
          <div className="flex flex-col items-center justify-center text-center text-minerva-slate mt-12">
              <svg className="animate-spin h-10 w-10 text-minerva-charcoal mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <h2 className="text-xl font-semibold">Analyzing search results...</h2>
              <p className="mt-1">The AI is summarizing top sources. This may take a moment.</p>
          </div>
        );
      case SearchStatus.ERROR:
        return (
          <div className="text-center text-red-600 bg-red-100 p-6 rounded-lg mt-12 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold">Search Failed</h2>
            <p className="mt-2">{error}</p>
          </div>
        );
      case SearchStatus.SUCCESS:
        if (applicants.length === 0) {
          return (
            <div className="text-center text-minerva-slate mt-12">
              <h2 className="text-2xl font-semibold">No Verifiable Results Found</h2>
              <p className="mt-2">The AI couldn't find and summarize relevant sources. Try broadening your search terms.</p>
            </div>
          );
        }
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-12">
              {applicants.map((applicant, index) => (
                <ApplicantCard key={`${applicant.primarySourceUrl}-${index}`} applicant={applicant} />
              ))}
            </div>
            <div className="text-center mt-12">
              {noMoreResults ? (
                <p className="text-minerva-slate italic">No more results found for this query.</p>
              ) : (
                <button
                  onClick={handleFindMore}
                  disabled={isFindingMore}
                  className="bg-minerva-charcoal text-white font-bold py-3 px-8 rounded-full hover:bg-opacity-90 transition-all transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                >
                  {isFindingMore ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Finding More...
                    </>
                  ) : (
                    'Find More Results'
                  )}
                </button>
              )}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen font-sans">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Discover Exceptional Applicants</h2>
            <p className="mt-2 text-minerva-slate max-w-3xl mx-auto">This tool uses AI to scan the public web for high school students with remarkable accomplishments, providing a reverse search to find candidates who align with Minerva's values.</p>
        </div>
        <SearchForm onSearch={handleSearch} isLoading={status === SearchStatus.LOADING} />
        {renderContent()}
      </main>
      <footer className="text-center py-4 text-sm text-minerva-slate border-t border-minerva-ash mt-12">
        <p>&copy; {new Date().getFullYear()} Minerva University | Internal Enrollment Tool</p>
      </footer>
    </div>
  );
};

export default App;