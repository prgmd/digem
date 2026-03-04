# test_categories.py
import feedparser

RSS_URL = "https://pitchfork.com/feed/feed-features/rss"

print("=" * 60)
print("📋 Pitchfork RSS 카테고리 확인")
print("=" * 60)

feed = feedparser.parse(RSS_URL)

print(f"\n총 {len(feed.entries)}개 항목\n")

categories = {}

for i, entry in enumerate(feed.entries, 1):
    title = entry.get('title', '')[:50]
    
    # 카테고리 추출
    category = ''
    if 'tags' in entry and entry['tags']:
        category = entry['tags'][0].get('term', 'Unknown')
    else:
        category = 'No Category'
    
    # 카테고리별 카운트
    if category not in categories:
        categories[category] = []
    categories[category].append(title)
    
    print(f"{i}. [{category}] {title}...")

print("\n" + "=" * 60)
print("📊 카테고리별 통계:")
print("=" * 60)

for category, titles in sorted(categories.items(), key=lambda x: len(x[1]), reverse=True):
    print(f"\n{category}: {len(titles)}개")
    for title in titles[:3]:  # 처음 3개만
        print(f"  - {title}...")
    if len(titles) > 3:
        print(f"  ... 외 {len(titles) - 3}개")

print("\n" + "=" * 60)
print("✅ 확인 완료!")
print("=" * 60)