export async function searchJobs(query: string, location: string = '', remote: string = 'all') {
  let fullQuery = query;
  if (location) fullQuery += ` in ${location}`;
  if (remote === 'remote') fullQuery += ` remote`;
  if (remote === 'office') fullQuery += ` on-site`;

  const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(fullQuery)}&num_pages=1`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '',
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();

    if (result.status === 'OK') {
      return result.data.map((job: any) => ({
        id: job.job_id,
        title: job.job_title,
        company: job.employer_name,
        location: `${job.job_city || ''} ${job.job_country || ''}`.trim() || 'Remote',
        salary: job.job_salary_currency ? `${job.job_salary_currency}${job.job_min_salary || ''}` : 'Competitive',
        type: job.job_employment_type || 'Full-time',
        posted: job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc).toLocaleDateString() : 'Recent',
        matchScore: Math.floor(Math.random() * 30) + 70, // Simulated AI Match
        logo: job.employer_logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${job.employer_name}`,
        description: job.job_description,
        applyLink: job.job_apply_link
      }));
    }
    return [];
  } catch (error) {
    console.error('RapidAPI Error:', error);
    return [];
  }
}
