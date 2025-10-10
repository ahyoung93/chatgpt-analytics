import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST /api/detect-category - Use keyword matching to detect GPT category
export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();

    if (!name && !description) {
      return NextResponse.json(
        { error: 'Either name or description is required' },
        { status: 400 }
      );
    }

    const text = `${name || ''} ${description || ''}`.toLowerCase();

    // Keyword-based category detection
    const categoryRules = [
      {
        category: 'writing',
        keywords: ['write', 'writing', 'content', 'blog', 'article', 'copy', 'editor', 'essay', 'story', 'creative', 'author', 'copywriting', 'draft'],
        weight: 1
      },
      {
        category: 'productivity',
        keywords: ['productivity', 'task', 'todo', 'organize', 'schedule', 'calendar', 'reminder', 'workflow', 'project', 'management', 'planner', 'efficiency'],
        weight: 1
      },
      {
        category: 'research_analysis',
        keywords: ['research', 'analysis', 'analyze', 'data', 'insights', 'study', 'investigate', 'report', 'analytics', 'statistics', 'market', 'survey'],
        weight: 1
      },
      {
        category: 'education',
        keywords: ['education', 'learn', 'learning', 'teach', 'teaching', 'tutor', 'tutoring', 'study', 'student', 'course', 'lesson', 'training', 'academic', 'exam', 'homework'],
        weight: 1
      },
      {
        category: 'lifestyle',
        keywords: ['lifestyle', 'health', 'fitness', 'workout', 'exercise', 'cooking', 'recipe', 'meal', 'nutrition', 'travel', 'trip', 'vacation', 'wellness', 'meditation'],
        weight: 1
      },
      {
        category: 'dalle',
        keywords: ['dalle', 'image', 'picture', 'photo', 'visual', 'art', 'design', 'graphic', 'illustration', 'drawing', 'generate image', 'create image'],
        weight: 1
      },
      {
        category: 'programming',
        keywords: ['code', 'coding', 'programming', 'developer', 'development', 'software', 'debug', 'bug', 'api', 'function', 'script', 'algorithm', 'tech', 'engineer'],
        weight: 1
      }
    ];

    // Calculate scores for each category
    const scores: { [key: string]: number } = {};

    for (const rule of categoryRules) {
      let score = 0;
      for (const keyword of rule.keywords) {
        if (text.includes(keyword)) {
          score += rule.weight;
        }
      }
      if (score > 0) {
        scores[rule.category] = score;
      }
    }

    // Find category with highest score
    let bestCategory = 'other';
    let bestScore = 0;
    let confidence = 'low';

    for (const [category, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
      }
    }

    // Determine confidence based on score
    if (bestScore >= 3) {
      confidence = 'high';
    } else if (bestScore >= 2) {
      confidence = 'medium';
    } else if (bestScore >= 1) {
      confidence = 'low';
    }

    // Generate reasoning
    const reasoning = bestScore > 0
      ? `Detected keywords related to ${bestCategory.replace('_', ' ')}`
      : 'No specific keywords found, defaulting to other';

    return NextResponse.json({
      category: bestCategory,
      confidence,
      reasoning
    });

  } catch (error: any) {
    console.error('Category detection error:', error);

    // Fallback to "other" if detection fails
    return NextResponse.json({
      category: 'other',
      confidence: 'low',
      reasoning: 'Auto-detection failed, please select manually'
    });
  }
}
