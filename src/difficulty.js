/**
 * Difficulty System - Adaptive difficulty assessment and recommendations
 * Tracks player performance and adjusts challenge recommendations
 */

export const DIFFICULTY_LEVELS = {
  BEGINNER: {
    id: 'beginner',
    name: 'Beginner',
    level: 1,
    description: 'New to redstone. Focus on basics and simple circuits.',
    xpMultiplier: 1.0,
    timeMultiplier: 2.0,
    hintBonus: 1.5,
    allowedTiers: ['apprentice'],
    recommendedChallenges: [1, 2, 3, 4, 5]
  },
  INTERMEDIATE: {
    id: 'intermediate',
    name: 'Intermediate',
    level: 2,
    description: 'Comfortable with basics. Ready for logic gates and simple memory.',
    xpMultiplier: 1.2,
    timeMultiplier: 1.5,
    hintBonus: 1.2,
    allowedTiers: ['apprentice', 'journeyman'],
    recommendedChallenges: [6, 7, 8, 9, 10, 11, 12]
  },
  ADVANCED: {
    id: 'advanced',
    name: 'Advanced',
    level: 3,
    description: 'Experienced with logic and memory. Ready for complex circuits.',
    xpMultiplier: 1.5,
    timeMultiplier: 1.2,
    hintBonus: 1.0,
    allowedTiers: ['journeyman', 'artisan'],
    recommendedChallenges: [13, 14, 15, 16, 17, 18, 19, 20]
  },
  EXPERT: {
    id: 'expert',
    name: 'Expert',
    level: 4,
    description: 'Mastery of most concepts. Ready for advanced computing and optimization.',
    xpMultiplier: 2.0,
    timeMultiplier: 1.0,
    hintBonus: 0.8,
    allowedTiers: ['artisan', 'master'],
    recommendedChallenges: [21, 22, 23, 24, 25, 26, 27]
  },
  MASTER: {
    id: 'master',
    name: 'Master',
    level: 5,
    description: 'Redstone virtuoso. Ready for grandmaster challenges and optimization.',
    xpMultiplier: 3.0,
    timeMultiplier: 0.8,
    hintBonus: 0.5,
    allowedTiers: ['master', 'grandmaster'],
    recommendedChallenges: [28, 29, 30, 31, 32, 33, 34]
  }
};

export class PerformanceMetrics {
  constructor() {
    this.challengesCompleted = 0;
    this.challengesAttempted = 0;
    this.averageStars = 0;
    this.averageTimeRatio = 1.0; // actualTime / parTime
    this.averageEfficiency = 1.0; // blocksUsed / parBlocks
    this.categoryPerformance = new Map(); // category -> { completed, avgStars, avgTime }
    this.streak = 0;
    this.bestStreak = 0;
    this.totalHintsUsed = 0;
    this.totalPossibleHints = 0;
    this.recentPerformance = []; // Last 10 challenge results
  }

  recordChallenge(result) {
    this.challengesAttempted++;

    if (result.completed) {
      this.challengesCompleted++;
      this.streak++;
      this.bestStreak = Math.max(this.streak, this.bestStreak);

      // Update averages
      const totalStars = this.averageStars * (this.challengesCompleted - 1) + result.stars;
      this.averageStars = totalStars / this.challengesCompleted;

      if (result.parTime > 0) {
        const timeRatio = result.timeMs / result.parTime;
        const totalTimeRatio = this.averageTimeRatio * (this.challengesCompleted - 1) + timeRatio;
        this.averageTimeRatio = totalTimeRatio / this.challengesCompleted;
      }

      if (result.parBlocks > 0) {
        const efficiency = result.blocksUsed / result.parBlocks;
        const totalEff = this.averageEfficiency * (this.challengesCompleted - 1) + efficiency;
        this.averageEfficiency = totalEff / this.challengesCompleted;
      }

      // Category performance
      const category = result.category || 'general';
      if (!this.categoryPerformance.has(category)) {
        this.categoryPerformance.set(category, { completed: 0, avgStars: 0, avgTime: 0 });
      }
      const catPerf = this.categoryPerformance.get(category);
      catPerf.completed++;
      catPerf.avgStars = (catPerf.avgStars * (catPerf.completed - 1) + result.stars) / catPerf.completed;
    } else {
      this.streak = 0;
    }

    // Track hints
    this.totalHintsUsed += result.hintsUsed || 0;
    this.totalPossibleHints += 3; // Assume 3 hints per challenge

    // Recent performance (last 10)
    this.recentPerformance.push({
      challengeId: result.challengeId,
      stars: result.stars,
      timeMs: result.timeMs,
      completed: result.completed,
      timestamp: Date.now()
    });
    if (this.recentPerformance.length > 10) {
      this.recentPerformance.shift();
    }
  }

  getCompletionRate() {
    return this.challengesAttempted > 0
      ? this.challengesCompleted / this.challengesAttempted
      : 0;
  }

  getRecentTrend() {
    if (this.recentPerformance.length < 3) return 'stable';

    const recent = this.recentPerformance.slice(-5);
    const avgStars = recent.reduce((sum, r) => sum + r.stars, 0) / recent.length;

    if (avgStars >= 2.5) return 'improving';
    if (avgStars <= 1.0) return 'struggling';
    return 'stable';
  }

  getWeakCategories() {
    const weak = [];
    for (const [category, perf] of this.categoryPerformance) {
      if (perf.avgStars < 1.5) {
        weak.push({ category, avgStars: perf.avgStars, completed: perf.completed });
      }
    }
    return weak.sort((a, b) => a.avgStars - b.avgStars);
  }

  getStrongCategories() {
    const strong = [];
    for (const [category, perf] of this.categoryPerformance) {
      if (perf.completed >= 3 && perf.avgStars >= 2.5) {
        strong.push({ category, avgStars: perf.avgStars, completed: perf.completed });
      }
    }
    return strong.sort((a, b) => b.avgStars - a.avgStars);
  }
}

export class DifficultyAssessment {
  constructor(metrics) {
    this.metrics = metrics;
    this.recommendedLevel = null;
    this.recommendations = [];
    this.reasoning = [];
    this.confidence = 0;
  }

  assess() {
    const m = this.metrics;
    let score = 0;
    let maxScore = 0;

    // Factor 1: Completion rate (20 points)
    maxScore += 20;
    const completionRate = m.getCompletionRate();
    if (completionRate >= 0.9) score += 20;
    else if (completionRate >= 0.7) score += 15;
    else if (completionRate >= 0.5) score += 10;
    else if (completionRate >= 0.3) score += 5;

    // Factor 2: Average stars (30 points)
    maxScore += 30;
    if (m.averageStars >= 2.5) score += 30;
    else if (m.averageStars >= 2.0) score += 24;
    else if (m.averageStars >= 1.5) score += 18;
    else if (m.averageStars >= 1.0) score += 12;
    else score += 6;

    // Factor 3: Time efficiency (15 points)
    maxScore += 15;
    if (m.averageTimeRatio <= 0.5) score += 15;
    else if (m.averageTimeRatio <= 0.75) score += 12;
    else if (m.averageTimeRatio <= 1.0) score += 9;
    else if (m.averageTimeRatio <= 1.5) score += 6;
    else score += 3;

    // Factor 4: Block efficiency (15 points)
    maxScore += 15;
    if (m.averageEfficiency <= 0.75) score += 15;
    else if (m.averageEfficiency <= 1.0) score += 12;
    else if (m.averageEfficiency <= 1.25) score += 9;
    else if (m.averageEfficiency <= 1.5) score += 6;
    else score += 3;

    // Factor 5: Streak (10 points)
    maxScore += 10;
    if (m.bestStreak >= 10) score += 10;
    else if (m.bestStreak >= 5) score += 7;
    else if (m.bestStreak >= 3) score += 4;
    else score += 1;

    // Factor 6: Hint independence (10 points)
    maxScore += 10;
    if (m.totalPossibleHints > 0) {
      const hintRatio = 1 - (m.totalHintsUsed / m.totalPossibleHints);
      if (hintRatio >= 0.8) score += 10;
      else if (hintRatio >= 0.6) score += 8;
      else if (hintRatio >= 0.4) score += 6;
      else if (hintRatio >= 0.2) score += 4;
      else score += 2;
    }

    // Map score to difficulty level
    const normalizedScore = score / maxScore;
    this.confidence = Math.min(1, m.challengesCompleted / 10); // More data = more confidence

    if (normalizedScore >= 0.9) {
      this.recommendedLevel = DIFFICULTY_LEVELS.MASTER;
      this.reasoning.push('Exceptional performance across all metrics');
    } else if (normalizedScore >= 0.75) {
      this.recommendedLevel = DIFFICULTY_LEVELS.EXPERT;
      this.reasoning.push('Strong performance with good efficiency');
    } else if (normalizedScore >= 0.5) {
      this.recommendedLevel = DIFFICULTY_LEVELS.ADVANCED;
      this.reasoning.push('Solid completion rate with room for improvement');
    } else if (normalizedScore >= 0.3) {
      this.recommendedLevel = DIFFICULTY_LEVELS.INTERMEDIATE;
      this.reasoning.push('Developing skills, focus on fundamentals');
    } else {
      this.recommendedLevel = DIFFICULTY_LEVELS.BEGINNER;
      this.reasoning.push('Building foundation, start with basics');
    }

    // Generate recommendations
    this.generateRecommendations();

    return this;
  }

  generateRecommendations() {
    const m = this.metrics;
    const weak = m.getWeakCategories();
    const trend = m.getRecentTrend();

    // Difficulty adjustment
    if (trend === 'improving' && m.challengesCompleted >= 5) {
      this.recommendations.push({
        type: 'increase_difficulty',
        message: 'Consider advancing to the next difficulty tier',
        confidence: 0.8
      });
    } else if (trend === 'struggling') {
      this.recommendations.push({
        type: 'decrease_difficulty',
        message: 'Focus on mastering current challenges before advancing',
        confidence: 0.9
      });
    }

    // Category focus
    for (const weakCat of weak.slice(0, 2)) {
      this.recommendations.push({
        type: 'practice_category',
        category: weakCat.category,
        message: `Practice ${weakCat.category} challenges to strengthen skills`,
        priority: weakCat.avgStars < 1.0 ? 'high' : 'medium'
      });
    }

    // Efficiency focus
    if (m.averageEfficiency > 1.3) {
      this.recommendations.push({
        type: 'improve_efficiency',
        message: 'Try to complete challenges using fewer blocks',
        target: 'Reduce block usage by 20%'
      });
    }

    // Speed focus
    if (m.averageTimeRatio > 1.5) {
      this.recommendations.push({
        type: 'improve_speed',
        message: 'Practice completing challenges faster',
        target: 'Aim for par time or better'
      });
    }

    // Hint usage
    if (m.totalPossibleHints > 0) {
      const hintRatio = m.totalHintsUsed / m.totalPossibleHints;
      if (hintRatio > 0.7) {
        this.recommendations.push({
          type: 'reduce_hints',
          message: 'Try solving challenges with fewer hints for better learning',
          target: 'Use at most 1 hint per challenge'
        });
      }
    }
  }
}

export class DifficultySystem {
  constructor() {
    this.playerMetrics = new Map(); // playerId -> PerformanceMetrics
    this.playerLevels = new Map(); // playerId -> current difficulty level
  }

  getPlayerMetrics(playerId) {
    if (!this.playerMetrics.has(playerId)) {
      this.playerMetrics.set(playerId, new PerformanceMetrics());
    }
    return this.playerMetrics.get(playerId);
  }

  getPlayerLevel(playerId) {
    if (!this.playerLevels.has(playerId)) {
      this.playerLevels.set(playerId, DIFFICULTY_LEVELS.BEGINNER);
    }
    return this.playerLevels.get(playerId);
  }

  setPlayerLevel(playerId, level) {
    const levelObj = typeof level === 'string'
      ? Object.values(DIFFICULTY_LEVELS).find(l => l.id === level)
      : level;

    if (!levelObj) {
      throw new Error(`Invalid difficulty level: ${level}`);
    }

    this.playerLevels.set(playerId, levelObj);
    return levelObj;
  }

  recordChallenge(playerId, result) {
    const metrics = this.getPlayerMetrics(playerId);
    metrics.recordChallenge(result);

    // Reassess difficulty every 3 challenges
    if (metrics.challengesCompleted % 3 === 0) {
      this.assessAndAdjust(playerId);
    }

    return metrics;
  }

  assessAndAdjust(playerId) {
    const metrics = this.getPlayerMetrics(playerId);
    const assessment = new DifficultyAssessment(metrics).assess();
    const currentLevel = this.getPlayerLevel(playerId);

    // Only adjust if confidence is high enough
    if (assessment.confidence >= 0.5) {
      const recommended = assessment.recommendedLevel;

      // Allow adjustment if difference is >= 2 levels or trending strongly
      const levelDiff = Math.abs(recommended.level - currentLevel.level);
      const trend = metrics.getRecentTrend();

      if ((levelDiff >= 2) || (levelDiff >= 1 && (trend === 'improving' || trend === 'struggling'))) {
        this.setPlayerLevel(playerId, recommended);
        return {
          adjusted: true,
          previousLevel: currentLevel,
          newLevel: recommended,
          reasoning: assessment.reasoning,
          recommendations: assessment.recommendations
        };
      }
    }

    return {
      adjusted: false,
      currentLevel,
      recommendations: assessment.recommendations,
      reasoning: assessment.reasoning
    };
  }

  getRecommendedChallenges(playerId, allChallenges) {
    const level = this.getPlayerLevel(playerId);
    const metrics = this.getPlayerMetrics(playerId);

    // Start with level-recommended challenges
    let recommendations = allChallenges.filter(c =>
      level.recommendedChallenges.includes(c.id)
    );

    // Adjust based on weak categories
    const weak = metrics.getWeakCategories();
    if (weak.length > 0) {
      const weakCategoryChallenges = allChallenges.filter(c =>
        c.category === weak[0].category &&
        !level.recommendedChallenges.includes(c.id)
      );
      recommendations = [...weakCategoryChallenges.slice(0, 2), ...recommendations.slice(0, 3)];
    }

    return recommendations.slice(0, 5);
  }

  getDailyChallengeDifficulty(playerId) {
    const level = this.getPlayerLevel(playerId);
    const metrics = this.getPlayerMetrics(playerId);

    // Base difficulty on player level
    let baseDifficulty = level.level;

    // Adjust based on recent performance
    const trend = metrics.getRecentTrend();
    if (trend === 'improving') {
      baseDifficulty = Math.min(5, baseDifficulty + 1);
    } else if (trend === 'struggling') {
      baseDifficulty = Math.max(1, baseDifficulty - 1);
    }

    return baseDifficulty;
  }

  calculateXPReward(playerId, baseXP, result) {
    const level = this.getPlayerLevel(playerId);
    let multiplier = level.xpMultiplier;

    // Bonus for good performance
    if (result.stars === 3) multiplier *= 1.5;
    else if (result.stars === 2) multiplier *= 1.2;

    // Streak bonus
    const metrics = this.getPlayerMetrics(playerId);
    if (metrics.streak >= 5) multiplier *= 1.3;
    else if (metrics.streak >= 3) multiplier *= 1.15;

    // Hint penalty
    if (result.hintsUsed >= 3) multiplier *= 0.7;
    else if (result.hintsUsed >= 2) multiplier *= 0.85;

    return Math.floor(baseXP * multiplier);
  }

  calculateTimeLimit(playerId, baseLimit) {
    const level = this.getPlayerLevel(playerId);
    return Math.floor(baseLimit * level.timeMultiplier);
  }

  shouldProvideHint(playerId, attempts) {
    const level = this.getPlayerLevel(playerId);
    const metrics = this.getPlayerMetrics(playerId);

    // Higher levels get fewer automatic hint suggestions
    const hintThreshold = 5 - level.level; // Master: 0 attempts, Beginner: 4 attempts

    return attempts >= hintThreshold;
  }

  getPlayerReport(playerId) {
    const metrics = this.getPlayerMetrics(playerId);
    const level = this.getPlayerLevel(playerId);

    return {
      playerId,
      currentLevel: level,
      metrics: {
        challengesCompleted: metrics.challengesCompleted,
        challengesAttempted: metrics.challengesAttempted,
        completionRate: metrics.getCompletionRate(),
        averageStars: metrics.averageStars,
        averageTimeRatio: metrics.averageTimeRatio,
        averageEfficiency: metrics.averageEfficiency,
        streak: metrics.streak,
        bestStreak: metrics.bestStreak,
        recentTrend: metrics.getRecentTrend()
      },
      weakCategories: metrics.getWeakCategories(),
      strongCategories: metrics.getStrongCategories(),
      recommendations: this.assessAndAdjust(playerId).recommendations
    };
  }

  exportPlayerData(playerId) {
    const metrics = this.getPlayerMetrics(playerId);
    const level = this.getPlayerLevel(playerId);

    return {
      playerId,
      levelId: level.id,
      metrics: {
        challengesCompleted: metrics.challengesCompleted,
        challengesAttempted: metrics.challengesAttempted,
        averageStars: metrics.averageStars,
        averageTimeRatio: metrics.averageTimeRatio,
        averageEfficiency: metrics.averageEfficiency,
        streak: metrics.streak,
        bestStreak: metrics.bestStreak,
        totalHintsUsed: metrics.totalHintsUsed,
        totalPossibleHints: metrics.totalPossibleHints,
        categoryPerformance: Object.fromEntries(metrics.categoryPerformance),
        recentPerformance: metrics.recentPerformance
      }
    };
  }

  importPlayerData(data) {
    const level = Object.values(DIFFICULTY_LEVELS).find(l => l.id === data.levelId);
    if (level) {
      this.playerLevels.set(data.playerId, level);
    }

    const metrics = new PerformanceMetrics();
    Object.assign(metrics, data.metrics);
    metrics.categoryPerformance = new Map(Object.entries(data.metrics.categoryPerformance || {}));
    this.playerMetrics.set(data.playerId, metrics);
  }
}

// Singleton instance
export const difficultySystem = new DifficultySystem();
