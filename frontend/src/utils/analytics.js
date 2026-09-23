export function calculateStatistics(history = []) {
  const totalInterviews = history.length;

  if (totalInterviews === 0) {
    return {
      totalInterviews: 0,
      averageScore: 0,
      bestScore: 0,
      totalReports: 0,
    };
  }

  const scores = history.map((item) => Number(item.overallScore) || 0);

  const averageScore = Math.round(
    scores.reduce((sum, score) => sum + score, 0) / totalInterviews
  );

  const bestScore = Math.max(...scores);

  return {
    totalInterviews,
    averageScore,
    bestScore,
    totalReports: totalInterviews,
  };
}

export function filterHistory(
  history = [],
  {
    search = "",
    role = "",
    status = "",
  } = {}
) {
  return history.filter((item) => {
    const matchesSearch =
      !search ||
      item.role?.toLowerCase().includes(search.toLowerCase()) ||
      item.level?.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      !role || item.role === role;

    const matchesStatus =
      !status || item.status === status;

    return matchesSearch && matchesRole && matchesStatus;
  });
}

export function paginateData(data = [], page = 1, pageSize = 10) {
  const totalPages = Math.ceil(data.length / pageSize);

  const startIndex = (page - 1) * pageSize;

  return {
    data: data.slice(startIndex, startIndex + pageSize),
    totalPages,
  };
}