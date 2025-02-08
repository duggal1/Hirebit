

interface GithubUserData {
  name: string;
  login: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  avatar_url: string;
  html_url: string;
  created_at: string;
}

interface GithubRepo {
  name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

interface ContributionDay {
  date: string;
  count: number;
}

interface CommitStats {
  total_commits: number;
  contributions_this_year: number;
  streak_days: number;
  contribution_history: ContributionDay[];
}