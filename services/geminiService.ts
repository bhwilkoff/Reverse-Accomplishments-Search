import { GoogleGenAI } from "@google/genai";
import type { ApplicantProfile, SearchFilters } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// A helper to extract JSON from the text response
const extractJson = (text: string): any | null => {
  const match = text.match(/```json\n([\s\S]*?)\n```/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      console.error("Failed to parse JSON from response", e);
      return null;
    }
  }
  // Fallback for raw JSON, in case the model doesn't use markdown
  try {
    return JSON.parse(text);
  } catch (e) {
    // Not valid JSON
  }
  return null;
};

// A helper function to find the correct URL for a given page title
const findCorrectUrl = async (pageTitle: string): Promise<string | null> => {
    const prompt = `
        You are a URL finder. Perform a Google Search for a webpage with the exact title: "${pageTitle}".
        From the top search result, extract and return ONLY the public URL. Do not return any other text, explanation, or markdown. Just the URL.
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                // Make it fast and simple
                thinkingConfig: { thinkingBudget: 0 } 
            },
        });
        const url = response.text.trim();
        // A simple validation to ensure it's a URL-like string
        if (url.startsWith('http') && !url.includes(' ')) {
            return url;
        }
        console.warn(`Could not find a valid URL for title: "${pageTitle}". Got: "${url}"`);
        return null;
    } catch (error) {
        console.error(`Error during URL correction search for title: "${pageTitle}"`, error);
        return null;
    }
};


export const findApplicants = async (
  query: string,
  filters: SearchFilters,
  existingUrls: string[] = [] // Optional parameter to exclude already found results
): Promise<ApplicantProfile[]> => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const formattedDate = oneYearAgo.toISOString().split('T')[0]; // YYYY-MM-DD

  let exclusionPrompt = '';
  if (existingUrls.length > 0) {
    exclusionPrompt = `
      **IMPORTANT EXCLUSION CRITERIA:**
      You have already returned results from the following URLs. You MUST find completely new individuals from different web pages. DO NOT include any information from these sources:
      ${existingUrls.map(url => `- ${url}`).join('\n')}
    `;
  }

  let prompt = `
    You are an expert international talent scout with a special skill in crafting advanced, multilingual Google Search queries to uncover exceptional high school students for Minerva University from around the world.

    Your mission is to find verifiable online evidence of student accomplishments.

    **YOUR SEARCH STRATEGY (execute this mentally before searching):**

    1.  **Analyze the Location & Language:**
        - Identify the user's target location (e.g., "${filters.location}").
        - Determine the primary language(s) of that location. This is the most important step.
        - **If the location is non-English speaking (like China, Brazil, Japan), your search strategy MUST adapt.** A simple English query will fail.

    2.  **Formulate Multilingual & Context-Aware Queries:**
        - **Primary Strategy (Local Language):** Brainstorm 3-5 search queries using terms translated into the local language. For example, for "debate winner" in China, you must formulate queries in Chinese characters, like "高中生辩论赛冠军" (high school student debate champion) or "全国中学生辩论赛" (national high school debate competition).
        - **Secondary Strategy (International Events):** Formulate queries in English that look for students *from* that country who are participating in *international* events. For example, "Chinese student wins international debate tournament" or "Team China World Schools Debating Championships".
        - **Combine with User's Query:** Creatively weave the user's core query ("${query}") and accomplishment area focus ("${filters.accomplishmentAreas.join(', ')}") into these localized and internationalized searches.

    3.  **Execute and Analyze Results:**
        - Use your formulated queries to find web pages.
        - Analyze the content of the pages (even if they are in another language) to identify promising candidates.

    **CRITICAL RULES FOR ANALYSIS:**
    - **FOCUS ON HIGH SCHOOL STUDENTS:** Your primary goal is to find students currently in high school (e.g., Grade 11/Juniors, or the local equivalent like '高中生'). You MUST IGNORE and EXCLUDE any person identified as a university student ('大学生'), graduate, or professional.
    - **FILTER BY RECENCY:** This is crucial. Focus on web pages published or updated within the last year. Use search operators like "after:${formattedDate}" to find recent results.

    ${exclusionPrompt}

    **USER'S SEARCH REQUEST:**
    - **Query:** "${query}"
    ${filters.location ? `- **Location Focus:** "${filters.location}".` : ''}
    ${filters.sourceTypes.length > 0 ? `- **Source Type Focus:** ${filters.sourceTypes.join(', ')}.` : ''}
    ${filters.accomplishmentAreas.length > 0 ? `- **TOP PRIORITY - Accomplishment Areas:** **${filters.accomplishmentAreas.join(', ')}**.` : ''}

    **OUTPUT FORMAT:**
    After your analysis, for each individual you identify, create a JSON object. Each JSON object MUST include the source URL and title from the specific search result you used.

    - name: The person's full name.
    - location: Their city and state/country, if available from the source.
    - bio: A one-sentence summary of their key achievement from the source.
    - reasoning: A 1-2 sentence explanation of why this person is a strong candidate, based *only* on the provided source.
    - primarySourceUrl: The exact URL of the webpage where you found this person. This MUST be one of the URLs from the search results.
    - sourceTitle: The title of that webpage.
    - socialProfiles: An array of professional profiles (e.g., GitHub, LinkedIn) found on the page, like [{ "platform": "GitHub", "url": "..." }].
    - profileImageUrl: A placeholder image URL: 'https://picsum.photos/100'.

    Return ONLY a JSON array of these objects inside a markdown code block (\`\`\`json ... \`\`\`). If you find a page with multiple winners, you can return multiple JSON objects, each pointing to the same primarySourceUrl. If no relevant individuals are found after your thorough search, return an empty array [].
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const jsonText = response.text.trim();
    const applicantSummaries = extractJson(jsonText);
    
    if (!applicantSummaries || !Array.isArray(applicantSummaries)) {
      console.warn("Could not parse valid applicant JSON array from response:", jsonText);
      return [];
    }
    
    const initialProfiles: ApplicantProfile[] = applicantSummaries
      .filter(summary => summary.name && summary.primarySourceUrl && summary.sourceTitle) // Basic validation
      .map(summary => ({
        name: summary.name,
        location: summary.location || 'Unknown Location',
        bio: summary.bio || 'No bio generated.',
        reasoning: summary.reasoning || 'No reasoning provided.',
        socialProfiles: summary.socialProfiles || [],
        profileImageUrl: `https://picsum.photos/seed/${encodeURIComponent(summary.name)}/100`, // Use name for consistent placeholders
        primarySourceUrl: summary.primarySourceUrl,
        sourceTitle: summary.sourceTitle,
      }));

    // URL Verification and Correction Step
    const verifiedProfiles = await Promise.all(
      initialProfiles.map(async (profile) => {
        // The primary reason for bad URLs seems to be internal Google redirect links.
        if (profile.primarySourceUrl.includes('vertexaisearch.cloud.google.com')) {
          console.log(`Attempting to correct invalid URL for title: ${profile.sourceTitle}`);
          const correctedUrl = await findCorrectUrl(profile.sourceTitle);
          if (correctedUrl) {
            console.log(`Successfully corrected URL to: ${correctedUrl}`);
            return { ...profile, primarySourceUrl: correctedUrl };
          }
        }
        return profile;
      })
    );

    return verifiedProfiles;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to fetch applicant data from AI. Please check the console for more details.");
  }
};