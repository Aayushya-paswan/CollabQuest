"""
Pure-Python compatibility scoring.

This module provides `get_compatibility_score()` without any heavy ML dependencies.
It uses simple exact-match and category-overlap heuristics to produce a 0-100 score
and a short human-readable explanation.
"""

from typing import List, Union, Tuple


def get_compatibility_score(member1_skills: Union[List, dict], member2_skills: Union[List, dict]) -> Tuple[float, str]:
    """
    Calculate compatibility score (0-100) between two members based on their skills.
    Uses simple keyword similarity and overlap analysis.

    Args:
        member1_skills: list or dict of skills
        member2_skills: list or dict of skills

    Returns:
        Tuple of (compatibility_score, explanation)
    """
    try:
        # Convert to lists if dict
        if isinstance(member1_skills, dict):
            skills1 = list(member1_skills.keys())
        else:
            skills1 = member1_skills or []

        if isinstance(member2_skills, dict):
            skills2 = list(member2_skills.keys())
        else:
            skills2 = member2_skills or []

        # Ensure they're lists
        if not isinstance(skills1, list):
            skills1 = list(skills1) if skills1 else []
        if not isinstance(skills2, list):
            skills2 = list(skills2) if skills2 else []

        # Convert all skills to lowercase strings for comparison
        skills1 = [str(s).lower().strip() for s in skills1 if s]
        skills2 = [str(s).lower().strip() for s in skills2 if s]

        # If both have no skills, return neutral score
        if not skills1 and not skills2:
            return 50, "Both users have no skills listed yet"

        # If one has no skills
        if not skills1 or not skills2:
            return 40, f"One user has no skills, limited collaboration potential"

        # Skill categorization (group related skills)
        def categorize_skill(skill: str) -> str:
            skill = skill.lower()

            # Programming languages
            if any(lang in skill for lang in [
                'python', 'java', 'c++', 'javascript', 'typescript', 'rust', 'go', 'kotlin', 'swift', 'r', 'matlab', 'ruby', 'php'
            ]):
                return 'programming'

            # Web technologies
            if any(web in skill for web in [
                'react', 'vue', 'angular', 'html', 'css', 'node', 'express', 'django', 'flask', 'fastapi', 'web'
            ]):
                return 'web'

            # Data & AI
            if any(ai in skill for ai in [
                'ml', 'machine learning', 'deep learning', 'neural', 'ai', 'nlp', 'data', 'analytics', 'pandas', 'numpy', 'tensorflow', 'pytorch'
            ]):
                return 'data_ai'

            # Database
            if any(db in skill for db in ['sql', 'mysql', 'postgres', 'mongodb', 'firebase', 'database', 'redis']):
                return 'database'

            # DevOps/Cloud
            if any(devops in skill for devops in [
                'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'devops', 'ci', 'cd', 'git', 'github'
            ]):
                return 'devops'

            # Mobile
            if any(mobile in skill for mobile in ['android', 'ios', 'flutter', 'react native', 'mobile']):
                return 'mobile'

            return 'other'

        # Categorize all skills
        categories1 = [categorize_skill(s) for s in skills1]
        categories2 = [categorize_skill(s) for s in skills2]

        # Count exact matches
        exact_matches = len(set(skills1) & set(skills2))

        # Count category overlaps
        cat_matches = len(set(categories1) & set(categories2))
        total_categories = len(set(categories1) | set(categories2))

        # Calculate score
        # 50% for exact matches
        # 40% for category overlap
        # 10% for complementarity bonus

        exact_match_ratio = exact_matches / max(len(skills1), len(skills2)) if max(len(skills1), len(skills2)) > 0 else 0
        category_overlap_ratio = cat_matches / total_categories if total_categories > 0 else 0

        # Complementarity bonus: more skills = better for collaboration
        complementarity = min(50, (len(skills1) + len(skills2)) / 2) / 50

        score = (exact_match_ratio * 50) + (category_overlap_ratio * 40) + (complementarity * 10)
        score = max(0, min(100, score))

        # Generate explanation
        if exact_matches > 0:
            reason = f"{exact_matches} exact skill match{'es' if exact_matches != 1 else ''} • Good collaboration fit"
        elif cat_matches > 0:
            reason = f"Strong in {cat_matches} skill categor{'ies' if cat_matches != 1 else ''} • Complementary strengths"
        else:
            reason = f"Diverse skill sets • Can learn from each other"

        return round(score, 1), reason

    except Exception as e:
        print(f"Error in compatibility scoring: {e}")
        # Simple fallback
        try:
            if isinstance(member1_skills, dict):
                skills1 = list(member1_skills.keys())
            else:
                skills1 = member1_skills or []

            if isinstance(member2_skills, dict):
                skills2 = list(member2_skills.keys())
            else:
                skills2 = member2_skills or []

            common = len(set(skills1) & set(skills2))
            total = len(set(skills1) | set(skills2))

            if total > 0:
                score = 40 + (common / total) * 50
                reason = f"{common} common skill{'s' if common != 1 else ''}"
            else:
                score = 50
                reason = "No skills to compare"

            return round(score, 1), reason
        except:
            return 50, "Compatibility calculation unavailable"


if __name__ == "__main__":
    # Test the function
    alice = ["Python", "Machine Learning", "Data Analysis"]
    bob = ["Python", "Web Development", "React"]
    charlie = ["Java", "C++", "Embedded Systems"]

    print("Testing compatibility scoring...\n")

    score1, reason1 = get_compatibility_score(alice, bob)
    print(f"Alice vs Bob: {score1}% - {reason1}\n")

    score2, reason2 = get_compatibility_score(alice, charlie)
    print(f"Alice vs Charlie: {score2}% - {reason2}\n")

    score3, reason3 = get_compatibility_score(bob, charlie)
    print(f"Bob vs Charlie: {score3}% - {reason3}\n")
