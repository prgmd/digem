import os
from typing import Dict, List, Optional
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

class SupabaseLoader:
    def __init__(self):
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not supabase_url or not supabase_key:
            raise ValueError('SUPABASE URL과 KEY가 환경변수에 없습니다.')
        
        self.client: Client = create_client(supabase_url, supabase_key)
        print('Supabase 연결 완료')
    
    def save_article(self, article_data: Dict) -> bool:
        try:
            print('DB 저장 중...')
            data = {
                'title': article_data.get('title'),
                'title_ko': article_data.get('title_ko'),
                'content_en': article_data.get('content_en'),
                'content_ko': article_data.get('content_ko'),
                'source': article_data.get('source'),
                'source_url': article_data.get('source_url'),
                'author': article_data.get('author'),
                'published_at': article_data.get('published_at'),
                'translation_status': 'success',
                'translated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            result = self.client.table('articles').insert(data).execute()
            
            print('DB 저장 완료')
            return True
        
        except Exception as e:
            print(f'DB 저장 실패: {e}')
            return False
    
    def article_exists(self, source_url: str) -> bool:
        try:
            result = self.client.table('articles').select('id').eq('source_url', source_url).execute()
            return len(result.data) > 0
        except Exception as e:
            print(f'중복 체크 실패: {e}')
            return False

    def filter_new_articles(self, articles: List[Dict]) -> List[Dict]:        
        new_articles = []
        for article in articles:
            source_url = article.get('source_url')
            if not source_url:
                continue
            
            if self.article_exists(source_url):
                print(f"{article.get('title', '')[:50]}...이/가 이미 존재합니다.")
            else:
                print(f"{article.get('title', '')[:50]}...을/를 저장합니다.")
                new_articles.append(article)
        
        return new_articles


def main():
    loader = SupabaseLoader()

if __name__ == "__main__":
    main()